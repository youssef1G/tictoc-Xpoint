const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4242'

function handle401() {
  localStorage.removeItem('ttx-token')
  window.location.href = '/admin-access'
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    handle401()
    throw Object.assign(new Error('Session expired'), { status: 401 })
  }

  if (!res.ok) {
    let message
    try { message = (await res.json()).error } catch { message = res.statusText }
    const err = new Error(message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const fetchProducts      = ()       => request('/api/products')
export const fetchProduct       = (id)     => request(`/api/products/${id}`)
export const fetchCategories    = ()       => request('/api/categories')

export const fetchOrder         = (id)     => request(`/api/orders/${id}`)
export const fetchOrdersByPhone = (phone)  => request(`/api/orders?phone=${encodeURIComponent(phone)}`)

export const loginAdmin  = (username, password) => request('/api/admin/login', { method: 'POST', body: { username, password } })
export const verifyAdmin = (token)              => request('/api/admin/me', { token })

export const createProduct = (token, product)      => request('/api/products',       { method: 'POST',   token, body: product })
export const updateProduct = (token, id, product)  => request(`/api/products/${id}`, { method: 'PUT',    token, body: product })
export const deleteProduct = (token, id)           => request(`/api/products/${id}`, { method: 'DELETE', token })

export const createCodOrder = (data) => request('/api/checkout/cod', { method: 'POST', body: data })

export const fetchAdmins         = (token)               => request('/api/admin/admins',                 { token })
export const createAdmin         = (token, data)         => request('/api/admin/admins',                 { method: 'POST',   token, body: data })
export const deleteAdmin         = (token, id)           => request(`/api/admin/admins/${id}`,           { method: 'DELETE', token })
export const changeAdminPassword = (token, id, password) => request(`/api/admin/admins/${id}/password`,  { method: 'PATCH',  token, body: { password } })

export const fetchDashboard    = (token)              => request('/api/admin/dashboard',    { token })
export const fetchOrders       = (token)              => request('/api/admin/orders',        { token })
export const updateOrder       = (token, id, fields)  => request(`/api/admin/orders/${id}`, { method: 'PATCH', token, body: fields })

export const submitComplaint       = (data)               => request('/api/complaints',               { method: 'POST', body: data })
export const fetchComplaints       = (token)              => request('/api/admin/complaints',          { token })
export const updateComplaintStatus = (token, id, status)  => request(`/api/admin/complaints/${id}`,   { method: 'PATCH', token, body: { status } })

export const submitReturn       = (data)               => request('/api/returns',              { method: 'POST', body: data })
export const fetchReturns       = (token)              => request('/api/admin/returns',         { token })
export const updateReturnStatus = (token, id, status)  => request(`/api/admin/returns/${id}`,  { method: 'PATCH', token, body: { status } })

// ─── Order Notes ──────────────────────
export const fetchOrderNotes  = (token, orderId)          => request(`/api/admin/orders/${orderId}/notes`,        { token })
export const addOrderNote     = (token, orderId, note)    => request(`/api/admin/orders/${orderId}/notes`,        { method: 'POST', token, body: { note } })
export const deleteOrderNote  = (token, noteId)           => request(`/api/admin/notes/${noteId}`,                { method: 'DELETE', token })

// ─── Settings ─────────────────────────
export const fetchSettings  = (token)                     => request('/api/admin/settings',                       { token })
export const upsertSetting  = (token, key, value)         => request('/api/admin/settings',                       { method: 'PUT', token, body: { key, value } })

// ─── Analytics ────────────────────────
export const fetchAnalytics = (token, days = 30)          => request(`/api/admin/analytics?days=${days}`,          { token })

// ─── Customers ────────────────────────
export const fetchCustomers = (token, search = '')        => request(`/api/admin/customers?search=${encodeURIComponent(search)}`, { token })