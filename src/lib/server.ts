import type { AstroCookies } from 'astro'

export const validateCookies = (cookies: AstroCookies): boolean => {
  return cookies.has('access') || cookies.has('refresh')
}
