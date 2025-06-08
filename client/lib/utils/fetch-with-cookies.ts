// Utility function for making authenticated requests
export async function fetchWithCookies(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: "include",
  })
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false

  const cookies = document.cookie
  return cookies.includes("access_token") && cookies.includes("refresh_token")
}

// Helper to clear authentication cookies
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return

  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}
