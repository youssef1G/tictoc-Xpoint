import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { requireAdmin, signAdminToken } from './auth.js'
import {
  getAllProducts,
  getProductById,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  listAdmins,
  findAdminByUsername,
  createAdmin,
  deleteAdmin,
  updateAdminPassword,
  getAllOrders,
  getOrderById,
  getOrdersByPhone,
  createOrder,
  updateOrder,
  updateOrderStatus,
  decrementStock,
  getDashboardStats,
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  createReturnRequest,
  getAllReturnRequests,
  updateReturnStatus,
  deleteReturnRequest,
  getOrderNotes,
  addOrderNote,
  deleteOrderNote,
  getSettings,
  upsertSetting,
  getAnalytics,
  getCustomers,
} from './db.js'

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'FRONTEND_URL']

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const VALID_RETURN_STATUSES = ['pending', 'approved', 'rejected', 'cancelled']

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file.`)
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is too short. Use at least 32 random characters (openssl rand -base64 32).')
}

if (!/^https?:\/\//.test(process.env.FRONTEND_URL)) {
  throw new Error('FRONTEND_URL must be a full URL including http:// or https://')
}

const isProd = process.env.NODE_ENV === 'production'

const app = express()

app.set('trust proxy', 1)

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json({ limit: '100kb' }))

function sendError(res, err, status = 500) {
  console.error(err)
  res.status(status).json({
    error: isProd && status === 500 ? 'Something went wrong. Please try again.' : err.message,
  })
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
})

const orderLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many lookup attempts. Please try again later.' },
})

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders placed. Please try again later.' },
})

const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin management requests. Please try again later.' },
})

app.get('/health', (req, res) => res.json({ ok: true }))

app.get('/api/products', async (req, res) => {
  try {
    res.json(await getAllProducts(req.query.store || null))
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/categories', async (req, res) => {
  try {
    res.json(await getAllCategories(req.query.store || null))
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/admin/categories', requireAdmin, async (req, res) => {
  try {
    const { name, store } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' })
    if (!store || !['xpoint', 'tictoc'].includes(store)) return res.status(400).json({ error: 'Valid store (xpoint or tictoc) is required' })
    const category = await createCategory({ name: name.trim(), store })
    res.status(201).json(category)
  } catch (err) {
    if (err.message === 'Category already exists') return res.status(409).json({ error: err.message })
    sendError(res, err)
  }
})

app.put('/api/admin/categories/:name', requireAdmin, async (req, res) => {
  try {
    const currentName = decodeURIComponent(req.params.name)
    const { name, store } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' })
    if (!store || !['xpoint', 'tictoc'].includes(store)) return res.status(400).json({ error: 'Valid store (xpoint or tictoc) is required' })
    const category = await updateCategory(currentName, { name: name.trim(), store })
    res.json(category)
  } catch (err) {
    if (err.message === 'Category not found') return res.status(404).json({ error: err.message })
    if (err.message.includes('already exists')) return res.status(409).json({ error: err.message })
    sendError(res, err)
  }
})

app.delete('/api/admin/categories/:name', requireAdmin, async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name)
    const store = req.query.store || null
    await deleteCategory(name, store)
    res.json({ ok: true })
  } catch (err) {
    if (err.message === 'Category not found') return res.status(404).json({ error: err.message })
    if (err.code === '23503') return res.status(409).json({ error: 'Cannot delete category that still has products. Reassign or delete those products first.' })
    sendError(res, err)
  }
})

app.get('/api/orders/:id', orderLookupLimiter, async (req, res) => {
  try {
    const order = await getOrderById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/orders', orderLookupLimiter, async (req, res) => {
  try {
    const cleanedPhone = (req.query.phone || '').replace(/\s/g, '')
    if (!/^(010|011|012|015)\d{8}$/.test(cleanedPhone)) {
      return res.status(400).json({ error: 'A valid Egyptian phone number is required' })
    }
    res.json(await getOrdersByPhone(cleanedPhone))
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/checkout/cod', checkoutLimiter, async (req, res) => {
  try {
    const { customer, items } = req.body

    if (!items || items.length === 0)
      return res.status(400).json({ error: 'No items in order' })

    const { name, phone, address, city } = customer || {}
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Invalid name' })
    if (!/^(010|011|012|015)\d{8}$/.test((phone || '').replace(/\s/g, '')))
      return res.status(400).json({ error: 'Invalid Egyptian phone number' })
    if (!address || address.trim().length < 5) return res.status(400).json({ error: 'Invalid address' })
    if (!city || !city.trim()) return res.status(400).json({ error: 'City is required' })

    let serverTotal = 0
    const normalizedItems = []
    for (const item of items) {
      const pid = item.productId || item.id
      const product = await getProductById(pid)
      if (!product) return res.status(400).json({ error: `Product ${pid} not found` })

      if (product.stock !== null && product.stock < item.quantity)
        return res.status(400).json({ error: `Not enough stock for ${product.name}` })

      serverTotal += product.price * item.quantity
      normalizedItems.push({
        productId: pid,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      })
    }

    const allSettings = await getSettings()
    const shippingSetting = allSettings.find(s => s.key === 'shipping')
    const thresholdSetting = allSettings.find(s => s.key === 'free_shipping_threshold')
    const threshold = thresholdSetting ? Math.max(0, Number(thresholdSetting.value) || 0) : 0
    let shippingFee = shippingSetting ? Math.max(0, Number(shippingSetting.value) || 0) : 0
    if (threshold > 0 && serverTotal >= threshold) shippingFee = 0
    const grandTotal = Math.round((serverTotal + shippingFee) * 100) / 100

    const order = await createOrder({
      customer,
      items: normalizedItems,
      total: grandTotal,
      type: 'cod',
    })

    for (const item of normalizedItems) {
      try {
        await decrementStock(item.productId, item.quantity)
      } catch (stockErr) {
        console.error(`Order ${order.id} placed, but stock decrement failed for ${item.productId}:`, stockErr)
      }
    }

    res.json({ orderId: order.id })
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    if (
      username === process.env.ADMIN_USERNAME &&
      (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH))
    ) {
      return res.json({ token: signAdminToken() })
    }
    const admin = await findAdminByUsername(username)
    if (admin && (await bcrypt.compare(password, admin.password_hash))) {
      return res.json({ token: signAdminToken() })
    }
    res.status(401).json({ error: 'Invalid credentials' })
  } catch (err) {
    sendError(res, err)
  }
})

// ─── Public Settings ─────────────────────────────────────
app.get('/api/settings/public', async (req, res) => {
  try {
    const all = await getSettings()
    const allowed = ['shipping', 'free_shipping_threshold', 'currency', 'contact_phone', 'contact_email']
    res.json(all.filter(s => allowed.includes(s.key)))
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ ok: true }))

app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    res.json(await getDashboardStats())
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    res.json(await getAllOrders())
  } catch (err) {
    sendError(res, err)
  }
})

app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status, estimated_delivery } = req.body
    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` })
    }
    const order = await updateOrder(req.params.id, { status, estimated_delivery })
    res.json(order)
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/admin/admins', requireAdmin, async (req, res) => {
  try {
    res.json(await listAdmins())
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/admin/admins', requireAdmin, adminWriteLimiter, async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const admin = await createAdmin({ username: username.trim(), passwordHash })
    res.status(201).json(admin)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username already exists' })
    sendError(res, err)
  }
})

app.delete('/api/admin/admins/:id', requireAdmin, adminWriteLimiter, async (req, res) => {
  try {
    const all = await listAdmins()
    if (all.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin account' })
    }
    await deleteAdmin(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    sendError(res, err)
  }
})

app.patch('/api/admin/admins/:id/password', requireAdmin, adminWriteLimiter, async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await updateAdminPassword(req.params.id, passwordHash)
    res.json({ ok: true })
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    res.status(201).json(await createProduct(req.body))
  } catch (err) {
    sendError(res, err)
  }
})

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    res.json(await updateProduct(req.params.id, req.body))
  } catch (err) {
    sendError(res, err)
  }
})

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    await deleteProduct(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/complaints', async (req, res) => {
  try {
    const { name, phone, message } = req.body
    if (!name || !phone || !message)
      return res.status(400).json({ error: 'Name, phone and message are required' })
    if (!/^(010|011|012|015)\d{8}$/.test((phone || '').replace(/\s/g, '')))
      return res.status(400).json({ error: 'Invalid Egyptian phone number' })
    const complaint = await createComplaint({ name, phone, message })
    res.status(201).json(complaint)
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/returns', async (req, res) => {
  try {
    const { order_id, reason, details } = req.body
    if (!order_id || !reason)
      return res.status(400).json({ error: 'Order ID and reason are required' })
    const order = await getOrderById(order_id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const allReturns = await getAllReturnRequests()
    const existing = allReturns.find(r => r.order_id === order_id && r.status !== 'cancelled')
    if (existing) return res.status(409).json({ error: 'You already have a pending return for this order' })

    const request = await createReturnRequest({ order_id, reason, details })
    res.status(201).json(request)
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/admin/complaints', requireAdmin, async (req, res) => {
  try {
    res.json(await getAllComplaints())
  } catch (err) {
    sendError(res, err)
  }
})

app.patch('/api/admin/complaints/:id', requireAdmin, async (req, res) => {
  try {
    res.json(await updateComplaintStatus(req.params.id, req.body.status))
  } catch (err) {
    sendError(res, err)
  }
})

app.delete('/api/admin/complaints/:id', requireAdmin, async (req, res) => {
  try {
    await deleteComplaint(req.params.id)
    res.json({ success: true })
  } catch (err) {
    sendError(res, err)
  }
})

app.get('/api/admin/returns', requireAdmin, async (req, res) => {
  try {
    res.json(await getAllReturnRequests())
  } catch (err) {
    sendError(res, err)
  }
})

app.patch('/api/admin/returns/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    if (status && !VALID_RETURN_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid return status. Must be one of: ${VALID_RETURN_STATUSES.join(', ')}` })
    }
    res.json(await updateReturnStatus(req.params.id, status))
  } catch (err) {
    sendError(res, err)
  }
})

app.delete('/api/admin/returns/:id', requireAdmin, async (req, res) => {
  try {
    await deleteReturnRequest(req.params.id)
    res.json({ success: true })
  } catch (err) {
    sendError(res, err)
  }
})

// ─── Order Notes ──────────────────────────────────────────
app.get('/api/admin/orders/:id/notes', requireAdmin, async (req, res) => {
  try {
    res.json(await getOrderNotes(req.params.id))
  } catch (err) {
    sendError(res, err)
  }
})

app.post('/api/admin/orders/:id/notes', requireAdmin, async (req, res) => {
  try {
    const { note } = req.body
    if (!note || !note.trim()) return res.status(400).json({ error: 'Note is required' })
    const result = await addOrderNote({ order_id: req.params.id, note: note.trim() })
    res.status(201).json(result)
  } catch (err) {
    sendError(res, err)
  }
})

app.delete('/api/admin/notes/:id', requireAdmin, async (req, res) => {
  try {
    await deleteOrderNote(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    sendError(res, err)
  }
})

// ─── Settings ──────────────────────────────────────────
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    res.json(await getSettings())
  } catch (err) {
    sendError(res, err)
  }
})

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body
    if (!key) return res.status(400).json({ error: 'Key is required' })
    await upsertSetting(key, value)
    res.json({ ok: true })
  } catch (err) {
    sendError(res, err)
  }
})

// ─── Analytics ──────────────────────────────────────────
app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    res.json(await getAnalytics(days))
  } catch (err) {
    sendError(res, err)
  }
})

// ─── Customers ──────────────────────────────────────────
app.get('/api/admin/customers', requireAdmin, async (req, res) => {
  try {
    res.json(await getCustomers(req.query.search || ''))
  } catch (err) {
    sendError(res, err)
  }
})

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4242
  app.listen(PORT, () => console.log(`Tic Toc Xpoint backend running on port ${PORT}`))
}

export default app