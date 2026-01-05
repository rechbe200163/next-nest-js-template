'server-only';

import { ENDPOINTS } from '../endpoints';
import { serverApiCLient } from '.';

// ------------------------------------------------------
//  GET SESSION ENTRIES BY SESSION ID
// ------------------------------------------------------
export async function getTodos(sessionId: number): Promise<Todos[]> {
  return serverApiCLient.safeGet<Todos>(ENDPOINTS.TODOS.GET);
}
