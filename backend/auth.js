import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET is missing or too short. Set a random string of at least 32 characters ' +
    'in your .env (generate one with: openssl rand -base64 32)'
  )
}

export function signAdminToken(extraClaims = {}) {
  return jwt.sign(
    { role: 'admin', ...extraClaims },
    JWT_SECRET,
    { expiresIn: '8h', algorithm: 'HS256' }
  )
}

export function requireAdmin(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}