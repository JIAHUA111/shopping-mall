import jwt from 'jsonwebtoken'

const JWT_SECRET = 'shopping-mall-secret-key-2026'
const JWT_EXPIRES_IN = '7d'

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或令牌已过期' })
  }
  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ code: 401, message: '令牌无效或已过期' })
  }
  req.user = decoded
  next()
}