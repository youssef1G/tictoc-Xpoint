import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

let _supabase = null
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key || url === 'https://xxxx.supabase.co') {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.'
      )
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

function randomId(prefix, byteLength) {
  return `${prefix}-${crypto.randomBytes(byteLength).toString('hex')}`
}

function randomNumericId(prefix, digits) {
  const max = 10 ** digits
  const n = crypto.randomInt(0, max)
  return `${prefix}-${String(n).padStart(digits, '0')}`
}

export function nextProductId() {
  return randomId('ttx', 4)
}

export function nextOrderId() {
  return randomNumericId('order', 12)
}

export function nextAdminId() {
  return randomId('admin', 4)
}

export function nextComplaintId() {
  return randomId('complaint', 4)
}

export function nextReturnId() {
  return randomId('return', 4)
}

export function nextNoteId() {
  return randomId('note', 4)
}

async function insertWithRetry(table, buildRow, selectClause = '*', maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await getSupabase()
      .from(table)
      .insert(buildRow())
      .select(selectClause)
      .single()

    if (!error) return data
    if (error.code === '23505' && attempt < maxAttempts) continue
    throw error
  }
}

function isNotFoundError(error) {
  return error?.code === 'PGRST116'
}

const PRODUCT_PROTECTED_FIELDS = ['id', 'created_at', 'updated_at']

function stripProtectedFields(obj, fields) {
  const clean = { ...(obj || {}) }
  for (const key of fields) delete clean[key]
  return clean
}

export async function getAllProducts() {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .order('id')

  if (error) throw error
  return data
}

export async function getProductById(id) {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (isNotFoundError(error)) return null
    throw error
  }
  return data
}

export async function createProduct(product) {
  const safeProduct = stripProtectedFields(product, PRODUCT_PROTECTED_FIELDS)
  return insertWithRetry('products', () => ({ ...safeProduct, id: nextProductId() }))
}

export async function updateProduct(id, updates) {
  const safeUpdates = stripProtectedFields(updates, PRODUCT_PROTECTED_FIELDS)
  const { data, error } = await getSupabase()
    .from('products')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await getSupabase()
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllCategories() {
  const { data, error } = await getSupabase()
    .from('categories')
    .select('name')
    .order('name')

  if (error) throw error
  return data.map(r => r.name)
}

export async function listAdmins() {
  const { data, error } = await getSupabase()
    .from('admins')
    .select('id, username, created_at')
    .order('created_at')

  if (error) throw error
  return data
}

export async function findAdminByUsername(username) {
  const { data, error } = await getSupabase()
    .from('admins')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (isNotFoundError(error)) return null
    throw error
  }
  return data
}

export async function createAdmin({ username, passwordHash }) {
  return insertWithRetry(
    'admins',
    () => ({ id: nextAdminId(), username, password_hash: passwordHash }),
    'id, username, created_at'
  )
}

export async function deleteAdmin(id) {
  const { error } = await getSupabase()
    .from('admins')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateAdminPassword(id, passwordHash) {
  const { error } = await getSupabase()
    .from('admins')
    .update({ password_hash: passwordHash })
    .eq('id', id)

  if (error) throw error
}

export async function getAllOrders() {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderById(id) {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (isNotFoundError(error)) return null
    throw error
  }
  return data
}

export async function getOrdersByPhone(phone) {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('customer->>phone', phone)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createOrder({ customer, items, total, type = 'cod' }) {
  return insertWithRetry('orders', () => ({
    id: nextOrderId(),
    type,
    status: 'pending',
    customer,
    items,
    total,
  }))
}

export async function updateOrder(id, fields) {
  const allowed = {}
  if (fields.status !== undefined) {
    allowed.status = fields.status
    if (fields.status === 'delivered') allowed.delivered_at = new Date().toISOString()
  }
  if (fields.estimated_delivery !== undefined) allowed.estimated_delivery = fields.estimated_delivery || null
  allowed.updated_at = new Date().toISOString()

  const { data, error } = await getSupabase()
    .from('orders')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateOrderStatus = (id, status) => updateOrder(id, { status })

export async function getOrderNotes(orderId) {
  const { data, error } = await getSupabase()
    .from('order_notes')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addOrderNote({ order_id, note }) {
  return insertWithRetry('order_notes', () => ({
    id: nextNoteId(),
    order_id,
    note,
  }))
}

export async function deleteOrderNote(id) {
  const { error } = await getSupabase()
    .from('order_notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getSettings() {
  const { data, error } = await getSupabase()
    .from('settings')
    .select('*')

  if (error) throw error
  return data
}

export async function upsertSetting(key, value) {
  const { error } = await getSupabase()
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) throw error
}

export async function getAnalytics(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [ordersResult, productsResult] = await Promise.all([
    getSupabase()
      .from('orders')
      .select('id, status, total, created_at, delivered_at, items, customer')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true }),
    getSupabase()
      .from('products')
      .select('id, name, category, stock'),
  ])

  const orders = ordersResult.data || []
  const products = productsResult.data || []

  const revenueByDay = {}
  const ordersByDay = {}
  orders.forEach(o => {
    const day = o.created_at.split('T')[0]
    revenueByDay[day] = (revenueByDay[day] || 0) + Number(o.total || 0)
    ordersByDay[day] = (ordersByDay[day] || 0) + 1
  })

  const ordersByStatus = []
  const statusMap = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 }
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
  for (const [status, count] of Object.entries(statusMap)) {
    ordersByStatus.push({ status, count })
  }

  const productCategoryMap = {}
  products.forEach(p => { productCategoryMap[p.id] = p.category || 'Uncategorized' })

  const categoryMap = {}
  orders.forEach(o => {
    const items = o.items || []
    items.forEach(item => {
      const cat = productCategoryMap[item.productId] || 'Uncategorized'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })
  })
  const ordersByCategory = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const cityCounts = {}
  orders.forEach(o => {
    const city = o.customer?.city || 'Unknown'
    cityCounts[city] = (cityCounts[city] || 0) + 1
  })

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const deliveredRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  const completed = orders.filter(o => o.status === 'delivered').length
  const nonCancelled = orders.filter(o => o.status !== 'cancelled').length
  const completionRate = nonCancelled > 0 ? Math.round((completed / nonCancelled) * 100) : 0

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    deliveredRevenue: Math.round(deliveredRevenue * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalOrders: orders.length,
    completionRate,
    ordersByStatus,
    ordersByCategory,
    revenueByDay,
    ordersByDay,
    cityCounts,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock !== null && p.stock > 0 && p.stock <= 10).length,
    totalProducts: products.length,
  }
}

export async function getCustomers(search = '') {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, customer, total, status, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  const customerMap = new Map()
  for (const order of data) {
    const phone = order.customer?.phone
    if (!phone) continue
    if (search && !phone.includes(search) && !order.customer?.name?.toLowerCase().includes(search.toLowerCase())) continue

    const existing = customerMap.get(phone)
    customerMap.set(phone, {
      phone,
      name: order.customer?.name || '—',
      order_count: (existing?.order_count || 0) + 1,
      total_spent: (existing?.total_spent || 0) + Number(order.total || 0),
      last_order_date: !existing || order.created_at > existing.last_order_date ? order.created_at : existing.last_order_date,
      created_at: existing?.created_at || order.created_at,
    })
  }

  return Array.from(customerMap.values())
    .sort((a, b) => b.last_order_date.localeCompare(a.last_order_date))
}

export async function decrementStock(id, quantity) {
  const { error } = await getSupabase().rpc('decrement_stock', { p_id: id, p_qty: quantity })
  if (error) {
    console.error(`Failed to decrement stock for product ${id}:`, error)
    throw error
  }
}

export async function getDashboardStats() {
  const [{ data: products }, { data: orders }] = await Promise.all([
    getSupabase().from('products').select('id, stock'),
    getSupabase().from('orders').select('id, status, total, created_at'),
  ])

  const totalProducts   = products?.length || 0
  const outOfStock      = products?.filter(p => p.stock === 0).length || 0
  const lowStock        = products?.filter(p => p.stock !== null && p.stock > 0 && p.stock <= 10).length || 0

  const totalOrders     = orders?.length || 0
  const pendingOrders   = orders?.filter(o => o.status === 'pending').length || 0
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0

  const totalRevenue = (orders || [])
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  const deliveredRevenue = (orders || [])
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  return {
    totalProducts,
    outOfStock,
    lowStock,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    deliveredRevenue: Math.round(deliveredRevenue * 100) / 100,
  }
}

export async function createComplaint({ name, phone, message }) {
  return insertWithRetry('complaints', () => ({
    id: nextComplaintId(),
    name,
    phone,
    message,
    status: 'pending',
  }))
}

export async function getAllComplaints() {
  const { data, error } = await getSupabase()
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateComplaintStatus(id, status) {
  const { data, error } = await getSupabase()
    .from('complaints')
    .update({ status })
    .eq('id', id)
    .select().single()
  if (error) throw error
  return data
}

export async function createReturnRequest({ order_id, reason, details }) {
  return insertWithRetry('return_requests', () => ({
    id: nextReturnId(),
    order_id,
    reason,
    details: details || null,
    status: 'pending',
  }))
}

export async function getAllReturnRequests() {
  const { data, error } = await getSupabase()
    .from('return_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateReturnStatus(id, status) {
  const { data, error } = await getSupabase()
    .from('return_requests')
    .update({ status })
    .eq('id', id)
    .select().single()
  if (error) throw error
  return data
}