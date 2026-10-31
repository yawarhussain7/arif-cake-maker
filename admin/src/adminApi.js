const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/+$/, '')

export async function adminRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot connect to the bakery API at ${API_BASE_URL}. Start the server or set VITE_API_URL.`, { cause: error })
    }
    throw error
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error(`The API returned an invalid response (${response.status}).`)
  }
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || `Request failed (${response.status}).`)
    error.status = response.status
    throw error
  }
  return payload.data
}

export function adminJson(path, method, values) {
  return adminRequest(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}

export async function adminUpload(path, method, values, photo) {
  const form = new FormData()
  Object.entries(values).forEach(([key, value]) => form.set(key, String(value)))
  if (photo) form.set('photo', photo)
  return adminRequest(path, { method, body: form })
}

export function imageUrl(path) {
  if (!path) return ''
  if (/^(https?:|data:)/i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export { API_BASE_URL }
