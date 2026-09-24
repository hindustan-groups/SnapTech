/**
 * api.js — thin fetch wrapper.
 * Base URL comes from Vite proxy in dev (/api → localhost:5000)
 * and from VITE_API_URL env var in production.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData

  const headers = { ...options.headers }
  
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const unlockToken = window.sessionStorage.getItem('integration_unlock_token')
    if (unlockToken) {
      headers['x-integration-unlock-token'] = unlockToken
    }
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (isFormData) {
    delete headers['Content-Type']
  }

  const { params, ...fetchOptions } = options
  let url = `${BASE_URL}${path}`

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val)
      }
    })
    const qs = searchParams.toString()
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs
    }
  }

  const res = await fetch(url, {
    headers,
    credentials: 'include', // sends httpOnly cookies for admin auth
    ...fetchOptions,
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(json.message || 'Something went wrong', res.status)
  }

  return json
}

export const api = {
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  post: (path, body, options = {}) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: (path, body, options = {}) =>
    request(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  patch: (path, body, options = {}) =>
    request(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
}
