export function getItemFromLocalStorage(name: string): string | null {
  return localStorage.getItem(name);
}

export function setItemFromLocalStorage(name: string, token: string): void {
  localStorage.setItem(name, token);
}

export function removeItemFromLocalStorage(name: string): void {
  localStorage.removeItem(name);
}

/** get accessToken */
export function getAccessToken(): string | null {
  return getItemFromLocalStorage('accessToken');
}

/** set accessToken */
export function setAccessToken(token: string): void {
  setItemFromLocalStorage('accessToken', token);
}

/** remove accessToken */
export function removeAccessToken(): void {
  removeItemFromLocalStorage('accessToken');
}
