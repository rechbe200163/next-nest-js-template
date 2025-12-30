'use server';

import { updateTag } from 'next/cache';
import { FormState } from '../fom.types';
import { apiClientServer } from '../api-client.server';
import { formDataToPartial, getChangedFormData } from '../utils';
import { guardAction } from '../guardAction';

type Method = 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ServerAction = (
  _prev: FormState,
  formData: FormData
) => Promise<FormState>;

type DiffConfig<TArgs extends any[]> = {
  /** Liefert den aktuellen Stand für changedOnly-Payloads */
  getCurrent: (args: TArgs) => Record<string, any>;
};

type GuardedFormActionOptions<
  TArgs extends any[],
  TPayload extends Record<string, any>,
> = {
  errorMessage?: string;

  method: Method;

  /**
   * Endpoint kann fix sein (Create) oder aus args gebaut werden (Update/Delete)
   */
  endpoint: string | ((args: TArgs) => string);

  /** Cache invalidation */
  cacheTags?: string[] | ((args: TArgs) => string[]);

  /**
   * Payload:
   * - 'formData' => formDataToPartial(formData)
   * - builder => custom mapping
   * - undefined => default 'formData'
   */
  payload?: 'formData' | ((formData: FormData, args: TArgs) => TPayload);

  /**
   * PATCH/PUT: nur geänderte Felder (aus current)
   * -> du gibst diff.getCurrent(args) an
   */
  changedOnly?: boolean;
  diff?: DiffConfig<TArgs>;

  /** Optional Erfolgsmeldung */
  successMessage?: string | ((args: TArgs) => string);

  /** Optional: wenn du auf response eine id/zahl/string zurückgeben willst */
  pickData?: (response: any, args: TArgs) => string | number | undefined;

  /**
   * Optional: manche DELETEs brauchen kein FormData,
   * aber useActionState liefert dir halt immer FormData.
   * Wenn du willst, kannst du payload komplett ignorieren via payload: () => ({} as any)
   */
};

type CreateReturn<TArgs extends any[]> = TArgs extends []
  ? ServerAction
  : (...args: TArgs) => ServerAction;

function resolveEndpoint<TArgs extends any[]>(
  endpoint: string | ((args: TArgs) => string),
  args: TArgs
) {
  return typeof endpoint === 'string' ? endpoint : endpoint(args);
}

function resolveCacheTags<TArgs extends any[]>(
  cacheTags: undefined | string[] | ((args: TArgs) => string[]),
  args: TArgs
) {
  if (!cacheTags) return [];
  return Array.isArray(cacheTags) ? cacheTags : cacheTags(args);
}

function resolveSuccessMessage<TArgs extends any[]>(
  msg: undefined | string | ((args: TArgs) => string),
  args: TArgs
) {
  if (!msg) return 'OK';
  return typeof msg === 'string' ? msg : msg(args);
}

async function requestByMethod<TPayload extends Record<string, any>>(
  method: Method,
  endpoint: string,
  payload: TPayload
) {
  // Ich nehme an dein apiClientServer hat post/patch/delete.
  // PUT: entweder put() ergänzen oder auf request('PUT') umstellen.
  switch (method) {
    case 'POST':
      return apiClientServer.post<any, TPayload>(endpoint, { body: payload });
    case 'PATCH':
      return apiClientServer.patch<any, TPayload>(endpoint, payload);
    case 'PUT':
      // falls du kein put() hast: ersetz das hier durch apiClientServer.request('PUT', ...)
      return apiClientServer.post<any, TPayload>(endpoint, { body: payload });
    case 'DELETE':
      return apiClientServer.delete<any>(endpoint);
  }
}

/**
 * Ein Boilerplate-Reducer, der:
 * - als direkte Action (Args=[]) funktioniert
 * - oder als Factory (...args) => Action (Args!=[]) funktioniert
 */
export function createGuardedFormAction<
  TArgs extends any[] = [],
  TPayload extends Record<string, any> = Record<string, any>,
>(opts: GuardedFormActionOptions<TArgs, TPayload>): CreateReturn<TArgs> {
  const makeAction = (...boundArgs: TArgs): ServerAction => {
    return async function action(
      _prev: FormState,
      formData: FormData
    ): Promise<FormState> {
      // wichtig: boundArgs hier in eine const ziehen -> stabil für Transform
      const args = boundArgs;

      return guardAction(async (_session) => {
        let payload: Record<string, any>;

        if (opts.method === 'DELETE') {
          payload = {};
        } else if (opts.changedOnly) {
          if (!opts.diff)
            throw new Error('changedOnly=true requires diff.getCurrent(args)');
          payload = getChangedFormData(opts.diff.getCurrent(args), formData);
        } else if (opts.payload === 'formData' || !opts.payload) {
          payload = formDataToPartial(formData);
        } else {
          payload = opts.payload(formData, args);
        }

        const endpoint = resolveEndpoint(opts.endpoint, args);
        const response = await requestByMethod(
          opts.method,
          endpoint,
          payload as TPayload
        );

        resolveCacheTags(opts.cacheTags, args).forEach(updateTag);

        const data = opts.pickData
          ? opts.pickData(response, args)
          : response?.id;

        return {
          success: true,
          message: resolveSuccessMessage(opts.successMessage, args),
          ...(data !== undefined ? { data } : {}),
        } satisfies FormState;
      }, opts.errorMessage ?? 'Action failed');
    };
  };

  // KEIN zweites args hier, sondern "factoryArgs" (oder direkt boundArgs weiterreichen)
  const factory = (...factoryArgs: TArgs) => makeAction(...factoryArgs);

  // Wenn du wirklich Args=[] direkt als Action willst:
  // -> runtime check (sauberer als conditional type-Spielchen)
  return (
    opts.endpoint && typeof opts.endpoint === 'string'
      ? (makeAction(...([] as unknown as TArgs)) as unknown)
      : (factory as unknown)
  ) as CreateReturn<TArgs>;
}
