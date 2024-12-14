import fetch from 'cross-fetch'

async function request<TResponse>(url: string, config?: RequestInit): Promise<TResponse> {
  const response = await fetch(url, config)
  return await response.json()
}

const api = {
  get: <TResponse>(url: string) => request<TResponse>(url),

  // Using `extends` to set a type constraint:
  //TBody extends BodyInit
  post: <TResponse>(url: string, body: string) => request<TResponse>(url, { method: 'POST', body })
}
export default api
