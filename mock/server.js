import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import db from './db.js'
import { generateToken, authMiddleware } from './middleware.js'

const app = express()
app.use(cors())
app.use(express.json())

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { code: 429, message: '登录尝试过于频繁，请15分钟后再试' }
})

const flashSaleLimiter = rateLimit({
  windowMs: 1000,
  max: 2,
  message: { code: 429, message: '点击太快了，请稍候再试' }
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
})

app.use('/api/user/login', loginLimiter)
app.use('/api/flashsales/:id/buy', flashSaleLimiter)
app.use('/api/', apiLimiter)

// ============ 用户相关 ============

// 用户注册
app.post('/api/user/register', (req, res) => {
  const { username, password, email, phone } = req.body
  if (!username || !password) {
    return res.json({ code: 400, message: '用户名和密码不能为空' })
  }
  if (password.length < 6) {
    return res.json({ code: 400, message: '密码长度不能少于6位' })
  }
  const exists = db.users.find(u => u.username === username)
  if (exists) {
    return res.json({ code: 400, message: '用户名已存在' })
  }
  const newUser = {
    id: db.nextId.user++,
    username,
    password: bcrypt.hashSync(password, 10),
    email: email || '',
    phone: phone || '',
    level: 'normal',
    points: 0,
    signStreak: 0,
    createdAt: new Date().toISOString(),
    lastSignAt: null
  }
  db.users.push(newUser)
  res.json({ code: 200, message: '注册成功' })
})

// 用户登录
app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body
  const user = db.users.find(u => u.username === username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ code: 401, message: '用户名或密码错误' })
  }
  const token = generateToken(user)
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
    }
  })
})

// 获取用户信息（需登录）
app.get('/api/user/info', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  res.json({
    code: 200,
    data: { id: user.id, username: user.username, email: user.email, phone: user.phone, createdAt: user.createdAt }
  })
})

// 修改密码（需登录）
app.put('/api/user/password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.json({ code: 400, message: '原密码错误' })
  }
  if (newPassword.length < 6) {
    return res.json({ code: 400, message: '新密码长度不能少于6位' })
  }
  user.password = bcrypt.hashSync(newPassword, 10)
  res.json({ code: 200, message: '密码修改成功' })
})

// 更新用户信息（需登录）
app.put('/api/user/info', authMiddleware, (req, res) => {
  const { username, email, phone } = req.body
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  if (username !== undefined) {
    // 检查用户名是否已被占用
    const exists = db.users.find(u => u.username === username && u.id !== req.user.id)
    if (exists) {
      return res.json({ code: 400, message: '用户名已被占用' })
    }
    user.username = username
  }
  if (email !== undefined) user.email = email
  if (phone !== undefined) user.phone = phone
  res.json({ code: 200, message: '更新成功', data: { id: user.id, username: user.username, email: user.email, phone: user.phone } })
})

// ============ 分类相关 ============

// 获取全部分类
app.get('/api/categories', (req, res) => {
  res.json({ code: 200, data: db.categories })
})

// 获取子分类
app.get('/api/categories/:parentId/children', (req, res) => {
  const parentId = parseInt(req.params.parentId)
  const children = db.categories.filter(c => c.parentId === parentId)
  res.json({ code: 200, data: children })
})

// ============ 商品相关 ============

// 获取商品列表（支持分类筛选、关键词搜索）
app.get('/api/products', (req, res) => {
  let { categoryId, keyword, page = 1, pageSize = 12 } = req.query
  let result = [...db.products]

  // 多级分类：如果指定了 categoryId，包含其所有子分类
  if (categoryId) {
    categoryId = parseInt(categoryId)
    const childIds = getAllChildCategoryIds(categoryId)
    result = result.filter(p => childIds.includes(p.categoryId))
  }

  // 关键词模糊搜索
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    )
  }

  const total = result.length
  const start = (parseInt(page) - 1) * parseInt(pageSize)
  const items = result.slice(start, start + parseInt(pageSize))

  res.json({
    code: 200,
    data: { items, total, page: parseInt(page), pageSize: parseInt(pageSize) }
  })
})

// 获取商品详情
app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === parseInt(req.params.id))
  if (!product) {
    return res.json({ code: 404, message: '商品不存在' })
  }
  res.json({ code: 200, data: product })
})

// 获取商品评价
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id)
  const { page = 1, pageSize = 10 } = req.query
  const reviews = db.productReviews
    .filter(r => r.productId === productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  const total = reviews.length
  const start = (parseInt(page) - 1) * parseInt(pageSize)
  const items = reviews.slice(start, start + parseInt(pageSize))
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0
  
  res.json({
    code: 200,
    data: {
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      avgRating,
      reviewCount: reviews.length
    }
  })
})

// ============ 收货地址相关（需登录） ============

// 获取收货地址列表
app.get('/api/addresses', authMiddleware, (req, res) => {
  const addresses = db.addresses
    .filter(a => a.userId === req.user.id)
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
  res.json({ code: 200, data: addresses })
})

// 获取收货地址详情
app.get('/api/addresses/:id', authMiddleware, (req, res) => {
  const address = db.addresses.find(
    a => a.id === parseInt(req.params.id) && a.userId === req.user.id
  )
  if (!address) {
    return res.json({ code: 404, message: '地址不存在' })
  }
  res.json({ code: 200, data: address })
})

// 新增收货地址
app.post('/api/addresses', authMiddleware, (req, res) => {
  const { name, phone, province, city, district, detail, isDefault = false } = req.body
  
  if (!name || !phone || !province || !city || !district || !detail) {
    return res.json({ code: 400, message: '请填写完整的地址信息' })
  }
  
  if (isDefault) {
    db.addresses.forEach(a => {
      if (a.userId === req.user.id) {
        a.isDefault = false
      }
    })
  }
  
  const newAddress = {
    id: db.nextId.address++,
    userId: req.user.id,
    name,
    phone,
    province,
    city,
    district,
    detail,
    isDefault,
    createdAt: new Date().toISOString()
  }
  
  db.addresses.push(newAddress)
  res.json({ code: 200, data: newAddress, message: '添加成功' })
})

// 更新收货地址
app.put('/api/addresses/:id', authMiddleware, (req, res) => {
  const addressId = parseInt(req.params.id)
  const address = db.addresses.find(
    a => a.id === addressId && a.userId === req.user.id
  )
  
  if (!address) {
    return res.json({ code: 404, message: '地址不存在' })
  }
  
  const { name, phone, province, city, district, detail, isDefault } = req.body
  
  if (isDefault) {
    db.addresses.forEach(a => {
      if (a.userId === req.user.id && a.id !== addressId) {
        a.isDefault = false
      }
    })
  }
  
  if (name !== undefined) address.name = name
  if (phone !== undefined) address.phone = phone
  if (province !== undefined) address.province = province
  if (city !== undefined) address.city = city
  if (district !== undefined) address.district = district
  if (detail !== undefined) address.detail = detail
  if (isDefault !== undefined) address.isDefault = isDefault
  
  res.json({ code: 200, data: address, message: '更新成功' })
})

// 删除收货地址
app.delete('/api/addresses/:id', authMiddleware, (req, res) => {
  const idx = db.addresses.findIndex(
    a => a.id === parseInt(req.params.id) && a.userId === req.user.id
  )
  
  if (idx === -1) {
    return res.json({ code: 404, message: '地址不存在' })
  }
  
  db.addresses.splice(idx, 1)
  res.json({ code: 200, message: '删除成功' })
})

// 设置默认地址
app.put('/api/addresses/:id/default', authMiddleware, (req, res) => {
  const addressId = parseInt(req.params.id)
  const address = db.addresses.find(
    a => a.id === addressId && a.userId === req.user.id
  )
  
  if (!address) {
    return res.json({ code: 404, message: '地址不存在' })
  }
  
  db.addresses.forEach(a => {
    if (a.userId === req.user.id) {
      a.isDefault = a.id === addressId
    }
  })
  
  res.json({ code: 200, message: '设置成功' })
})

// ============ 收藏相关（需登录） ============

// 获取收藏列表
app.get('/api/favorites', authMiddleware, (req, res) => {
  const favorites = db.favorites
    .filter(f => f.userId === req.user.id)
    .map(f => {
      const product = db.products.find(p => p.id === f.productId)
      return { ...f, product: product || null }
    })
    .filter(f => f.product)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ code: 200, data: favorites })
})

// 检查是否已收藏
app.get('/api/favorites/check/:productId', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.productId)
  const exists = db.favorites.some(
    f => f.userId === req.user.id && f.productId === productId
  )
  res.json({ code: 200, data: { favorited: exists } })
})

// 添加收藏
app.post('/api/favorites/:productId', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.productId)
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    return res.json({ code: 404, message: '商品不存在' })
  }
  const existing = db.favorites.find(
    f => f.userId === req.user.id && f.productId === productId
  )
  if (existing) {
    return res.json({ code: 200, message: '已收藏', data: existing })
  }
  const fav = {
    id: db.nextId.favorite++,
    userId: req.user.id,
    productId,
    createdAt: new Date().toISOString()
  }
  db.favorites.push(fav)
  res.json({ code: 200, data: fav, message: '收藏成功' })
})

// 取消收藏
app.delete('/api/favorites/:productId', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.productId)
  const idx = db.favorites.findIndex(
    f => f.userId === req.user.id && f.productId === productId
  )
  if (idx === -1) {
    return res.json({ code: 404, message: '未收藏该商品' })
  }
  db.favorites.splice(idx, 1)
  res.json({ code: 200, message: '取消收藏成功' })
})

// ============ 浏览记录相关（需登录） ============

// 获取浏览记录
app.get('/api/browse-history', authMiddleware, (req, res) => {
  const history = db.browseHistory
    .filter(h => h.userId === req.user.id)
    .map(h => {
      const product = db.products.find(p => p.id === h.productId)
      return { ...h, product: product || null }
    })
    .filter(h => h.product)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ code: 200, data: history })
})

// 添加浏览记录
app.post('/api/browse-history/:productId', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.productId)
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    return res.json({ code: 404, message: '商品不存在' })
  }
  // 如果已存在记录，更新时间
  const existing = db.browseHistory.find(
    h => h.userId === req.user.id && h.productId === productId
  )
  if (existing) {
    existing.createdAt = new Date().toISOString()
    return res.json({ code: 200, data: existing })
  }
  // 超过50条删除最早的
  const userHistory = db.browseHistory.filter(h => h.userId === req.user.id)
  if (userHistory.length >= 50) {
    const oldest = userHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
    const idx = db.browseHistory.indexOf(oldest)
    if (idx > -1) db.browseHistory.splice(idx, 1)
  }
  const record = {
    id: db.nextId.browseHistory++,
    userId: req.user.id,
    productId,
    createdAt: new Date().toISOString()
  }
  db.browseHistory.push(record)
  res.json({ code: 200, data: record })
})

// 清空浏览记录
app.delete('/api/browse-history', authMiddleware, (req, res) => {
  db.browseHistory = db.browseHistory.filter(h => h.userId !== req.user.id)
  res.json({ code: 200, message: '清空成功' })
})

// 删除单条浏览记录
app.delete('/api/browse-history/:id', authMiddleware, (req, res) => {
  const idx = db.browseHistory.findIndex(
    h => h.id === parseInt(req.params.id) && h.userId === req.user.id
  )
  if (idx === -1) {
    return res.json({ code: 404, message: '记录不存在' })
  }
  db.browseHistory.splice(idx, 1)
  res.json({ code: 200, message: '删除成功' })
})

// ============ 意见反馈相关（需登录） ============

// 获取反馈列表
app.get('/api/feedbacks', authMiddleware, (req, res) => {
  const feedbacks = db.feedbacks
    .filter(f => f.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ code: 200, data: feedbacks })
})

// 提交反馈
app.post('/api/feedbacks', authMiddleware, (req, res) => {
  const { type, content, contact } = req.body
  if (!type || !content) {
    return res.json({ code: 400, message: '请填写反馈类型和内容' })
  }
  const feedback = {
    id: db.nextId.feedback++,
    userId: req.user.id,
    type,
    content,
    contact: contact || '',
    status: 'pending',
    reply: null,
    createdAt: new Date().toISOString()
  }
  db.feedbacks.push(feedback)
  res.json({ code: 200, data: feedback, message: '提交成功，感谢您的反馈' })
})

// ============ 购物车相关（需登录） ============

// 获取购物车列表
app.get('/api/cart', authMiddleware, (req, res) => {
  const items = db.carts
    .filter(c => c.userId === req.user.id)
    .map(c => {
      const product = db.products.find(p => p.id === c.productId)
      return { ...c, product: product || null }
    })
  res.json({ code: 200, data: items })
})

// 添加商品到购物车
app.post('/api/cart', authMiddleware, (req, res) => {
  const { productId, quantity = 1 } = req.body
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    return res.json({ code: 404, message: '商品不存在' })
  }
  const existing = db.carts.find(c => c.userId === req.user.id && c.productId === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    db.carts.push({
      id: db.nextId.cart++,
      userId: req.user.id,
      productId,
      quantity
    })
  }
  res.json({ code: 200, message: '添加成功' })
})

// 更新购物车商品数量
app.put('/api/cart/:id', authMiddleware, (req, res) => {
  const { quantity } = req.body
  const item = db.carts.find(c => c.id === parseInt(req.params.id) && c.userId === req.user.id)
  if (!item) {
    return res.json({ code: 404, message: '购物车商品不存在' })
  }
  if (quantity <= 0) {
    return res.json({ code: 400, message: '数量必须大于0' })
  }
  item.quantity = quantity
  res.json({ code: 200, message: '更新成功' })
})

// 删除购物车商品
app.delete('/api/cart/:id', authMiddleware, (req, res) => {
  const idx = db.carts.findIndex(c => c.id === parseInt(req.params.id) && c.userId === req.user.id)
  if (idx === -1) {
    return res.json({ code: 404, message: '购物车商品不存在' })
  }
  db.carts.splice(idx, 1)
  res.json({ code: 200, message: '删除成功' })
})

// ============ 订单相关（需登录） ============

// 创建订单（从购物车生成）
app.post('/api/orders', authMiddleware, (req, res) => {
  const { cartIds, couponId = null, pointsUsed = 0 } = req.body
  if (!cartIds || !cartIds.length) {
    return res.json({ code: 400, message: '请选择要下单的商品' })
  }
  const cartItems = db.carts.filter(c => cartIds.includes(c.id) && c.userId === req.user.id)
  if (cartItems.length === 0) {
    return res.json({ code: 400, message: '未找到有效的购物车商品' })
  }

  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }

  const stockChanges = []
  let orderItems = []
  let totalPrice = 0
  let couponDiscount = 0
  let actualPointsUsed = 0
  let pointsEarned = 0
  let usedUserCoupon = null

  try {
    const insufficientStockItems = []
    for (const ci of cartItems) {
      const product = db.products.find(p => p.id === ci.productId)
      if (!product || product.stock < ci.quantity) {
        insufficientStockItems.push({
          productId: ci.productId,
          productName: product?.name || '未知商品',
          requestedQuantity: ci.quantity,
          availableStock: product?.stock || 0
        })
      }
    }
    if (insufficientStockItems.length > 0) {
      return res.json({
        code: 400,
        message: '部分商品库存不足',
        data: { insufficientStockItems }
      })
    }

    for (const ci of cartItems) {
      const product = db.products.find(p => p.id === ci.productId)
      if (!product) continue
      
      stockChanges.push({ product, quantity: ci.quantity })
      product.stock -= ci.quantity
      
      const subtotal = product.price * ci.quantity
      totalPrice += subtotal
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: ci.quantity,
        image: product.image
      })
    }

    const levelInfo = getLevelInfo(user.level || 'normal')
    const discount = levelInfo.discount
    let discountedPrice = totalPrice * discount
    
    if (couponId) {
      const userCoupon = db.userCoupons.find(uc => 
        uc.id === couponId && uc.userId === req.user.id && uc.status === 'unused'
      )
      if (userCoupon) {
        const coupon = db.coupons.find(c => c.id === userCoupon.couponId)
        if (coupon && totalPrice >= coupon.minAmount) {
          couponDiscount = coupon.discount
          discountedPrice -= couponDiscount
          userCoupon.status = 'used'
          userCoupon.usedAt = new Date().toISOString()
          usedUserCoupon = userCoupon
        }
      }
    }
    
    if (pointsUsed > 0) {
      actualPointsUsed = Math.min(pointsUsed, user.points)
      const pointsDiscount = actualPointsUsed / 100
      discountedPrice -= pointsDiscount
      user.points -= actualPointsUsed
    }
    
    const finalPrice = Math.max(0.01, discountedPrice)
    
    pointsEarned = Math.floor(totalPrice * 10 * (levelInfo.doublePoints ? 2 : 1))
    user.points += pointsEarned
    updateUserLevel(user)
    
    const order = {
      id: db.nextId.order++,
      userId: req.user.id,
      items: orderItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      discount: discount < 1 ? discount : null,
      couponDiscount: couponDiscount > 0 ? couponDiscount : null,
      pointsUsed: actualPointsUsed > 0 ? actualPointsUsed : null,
      pointsEarned,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.orders.push(order)

    cartIds.forEach(cid => {
      const idx = db.carts.findIndex(c => c.id === cid)
      if (idx !== -1) db.carts.splice(idx, 1)
    })

    if (actualPointsUsed > 0) {
      db.pointsHistory.push({
        id: db.nextId.pointsHistory++,
        userId: user.id,
        type: 'deduct',
        amount: -actualPointsUsed,
        orderId: order.id,
        description: `积分抵扣订单#${order.id}`,
        createdAt: new Date().toISOString()
      })
    }
    if (pointsEarned > 0) {
      db.pointsHistory.push({
        id: db.nextId.pointsHistory++,
        userId: user.id,
        type: 'order',
        amount: pointsEarned,
        orderId: order.id,
        description: `购物奖励`,
        createdAt: new Date().toISOString()
      })
    }

    res.json({ code: 200, message: '下单成功', data: order })
  } catch (e) {
    for (const { product, quantity } of stockChanges) {
      product.stock += quantity
    }
    if (usedUserCoupon) {
      usedUserCoupon.status = 'unused'
      usedUserCoupon.usedAt = null
    }
    if (actualPointsUsed > 0) {
      user.points += actualPointsUsed
    }
    if (pointsEarned > 0) {
      user.points -= pointsEarned
      updateUserLevel(user)
    }
    res.json({ code: 500, message: '下单失败，请重试' })
  }
})

// 获取用户订单列表
app.get('/api/orders', authMiddleware, (req, res) => {
  const { status } = req.query
  let orders = db.orders.filter(o => o.userId === req.user.id)
  if (status) {
    orders = orders.filter(o => o.status === status)
  }
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ code: 200, data: orders })
})

// 获取订单详情
app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id) && o.userId === req.user.id)
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  res.json({ code: 200, data: order })
})

// 修改订单（缺货状态可修改）
app.put('/api/orders/:id', authMiddleware, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id) && o.userId === req.user.id)
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  if (order.status !== 'out_of_stock') {
    return res.json({ code: 400, message: '仅缺货中的订单可以修改' })
  }
  const { items, status } = req.body
  if (items) {
    let totalPrice = 0
    for (const item of items) {
      totalPrice += item.price * item.quantity
    }
    order.items = items
    order.totalPrice = Math.round(totalPrice * 100) / 100
  }
  if (status) order.status = status
  order.updatedAt = new Date().toISOString()
  res.json({ code: 200, message: '订单修改成功', data: order })
})

// 删除订单（缺货状态可删除）
app.delete('/api/orders/:id', authMiddleware, (req, res) => {
  const idx = db.orders.findIndex(o => o.id === parseInt(req.params.id) && o.userId === req.user.id)
  if (idx === -1) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  if (db.orders[idx].status !== 'out_of_stock') {
    return res.json({ code: 400, message: '仅缺货中的订单可以删除' })
  }
  db.orders.splice(idx, 1)
  res.json({ code: 200, message: '订单删除成功' })
})

// ============ 会员等级与积分系统 ============

// 获取会员等级配置
const levelConfig = {
  normal: { minPoints: 0, maxPoints: 1000, discount: 1, name: '普通会员', icon: '⭐' },
  silver: { minPoints: 1000, maxPoints: 5000, discount: 0.98, name: '白银会员', icon: '🥈' },
  gold: { minPoints: 5000, maxPoints: 10000, discount: 0.95, name: '黄金会员', icon: '🥇' },
  diamond: { minPoints: 10000, maxPoints: Infinity, discount: 0.9, name: '钻石会员', icon: '💎' }
}

// 获取会员等级信息
function getLevelInfo(level) {
  return levelConfig[level] || levelConfig['normal']
}

// 更新用户等级
function updateUserLevel(user) {
  if (!user) return
  const points = user.points || 0
  for (const [level, config] of Object.entries(levelConfig)) {
    if (points >= config.minPoints && points < config.maxPoints) {
      user.level = level
      break
    }
  }
}

// 用户签到
app.post('/api/user/sign', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  
  const today = new Date().toISOString().split('T')[0]
  const lastSignDate = user.lastSignAt?.split('T')[0]
  
  if (lastSignDate === today) {
    return res.json({ code: 400, message: '今天已经签到过了' })
  }
  
  // 计算连续签到天数
  let streak = 0
  if (user.lastSignAt) {
    const lastDate = new Date(user.lastSignAt)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (lastDate.toDateString() === yesterday.toDateString()) {
      streak = user.signStreak ? user.signStreak + 1 : 1
    } else {
      streak = 1
    }
  } else {
    streak = 1
  }
  user.signStreak = streak
  
  // 根据连续签到天数给予不同积分
  let points = 10
  if (streak >= 7) points = 30
  else if (streak >= 3) points = 20
  
  user.points = (user.points || 0) + points
  user.lastSignAt = new Date().toISOString()
  
  // 更新等级
  updateUserLevel(user)
  
  // 记录积分历史
  db.pointsHistory.push({
    id: db.nextId.pointsHistory++,
    userId: user.id,
    type: 'sign',
    amount: points,
    description: `签到奖励${streak > 1 ? `(连续${streak}天)` : ''}`,
    createdAt: new Date().toISOString()
  })
  
  res.json({
    code: 200,
    message: `签到成功！获得${points}积分`,
    data: { points: user.points, streak, level: user.level, levelInfo: levelConfig[user.level] }
  })
})

// 获取用户积分和等级信息
app.get('/api/user/points', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  
  res.json({
    code: 200,
    data: {
      points: user.points || 0,
      level: user.level || 'normal',
      levelInfo: levelConfig[user.level || 'normal'],
      signStreak: user.signStreak || 0,
      lastSignAt: user.lastSignAt
    }
  })
})

// 获取积分历史
app.get('/api/user/points/history', authMiddleware, (req, res) => {
  const history = db.pointsHistory
    .filter(h => h.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ code: 200, data: history })
})

// 使用积分抵扣
app.post('/api/user/points/deduct', authMiddleware, (req, res) => {
  const { amount, orderId } = req.body
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  
  if ((user.points || 0) < amount) {
    return res.json({ code: 400, message: '积分不足' })
  }
  
  user.points -= amount
  
  // 更新等级
  updateUserLevel(user)
  
  // 记录积分历史
  db.pointsHistory.push({
    id: db.nextId.pointsHistory++,
    userId: user.id,
    type: 'deduct',
    amount: -amount,
    orderId,
    description: `积分抵扣订单#${orderId}`,
    createdAt: new Date().toISOString()
  })
  
  res.json({
    code: 200,
    message: '积分抵扣成功',
    data: { remainingPoints: user.points }
  })
})

// ============ 优惠券系统 ============

// 获取可领取的优惠券列表
app.get('/api/coupons/available', authMiddleware, (req, res) => {
  // 获取用户已领取的优惠券ID
  const claimedIds = db.userCoupons
    .filter(uc => uc.userId === req.user.id)
    .map(uc => uc.couponId)
  
  // 获取未领取且未过期的优惠券
  const availableCoupons = db.coupons
    .filter(c => !claimedIds.includes(c.id))
    .filter(c => new Date(c.expireAt) > new Date())
  
  res.json({ code: 200, data: availableCoupons })
})

// 获取可用优惠券列表
app.get('/api/coupons', authMiddleware, (req, res) => {
  const userCoupons = db.userCoupons
    .filter(uc => uc.userId === req.user.id && uc.status === 'unused')
    .map(uc => {
      const coupon = db.coupons.find(c => c.id === uc.couponId)
      return { ...uc, coupon }
    })
    .filter(uc => uc.coupon)
  
  res.json({ code: 200, data: userCoupons })
})

// 领取优惠券
app.post('/api/coupons/:id/claim', authMiddleware, (req, res) => {
  const couponId = parseInt(req.params.id)
  const coupon = db.coupons.find(c => c.id === couponId)
  
  if (!coupon) {
    return res.json({ code: 404, message: '优惠券不存在' })
  }
  
  // 检查是否已领取
  const existing = db.userCoupons.find(uc => uc.couponId === couponId && uc.userId === req.user.id)
  if (existing) {
    return res.json({ code: 400, message: '您已领取过该优惠券' })
  }
  
  // 检查是否过期
  if (new Date(coupon.expireAt) < new Date()) {
    return res.json({ code: 400, message: '优惠券已过期' })
  }
  
  db.userCoupons.push({
    id: db.nextId.userCoupon++,
    couponId,
    userId: req.user.id,
    status: 'unused',
    usedAt: null
  })
  
  res.json({ code: 200, message: '领取成功', data: { couponId, userId: req.user.id } })
})

// 使用优惠券
app.post('/api/usercoupons/:id/use', authMiddleware, (req, res) => {
  const userCouponId = parseInt(req.params.id)
  const { orderId } = req.body
  
  const userCoupon = db.userCoupons.find(uc => uc.id === userCouponId && uc.userId === req.user.id)
  if (!userCoupon) {
    return res.json({ code: 404, message: '优惠券不存在' })
  }
  
  if (userCoupon.status !== 'unused') {
    return res.json({ code: 400, message: '优惠券已使用' })
  }
  
  const coupon = db.coupons.find(c => c.id === userCoupon.couponId)
  if (!coupon) {
    return res.json({ code: 404, message: '优惠券模板不存在' })
  }
  
  // 检查是否过期
  if (new Date(coupon.expireAt) < new Date()) {
    userCoupon.status = 'expired'
    return res.json({ code: 400, message: '优惠券已过期' })
  }
  
  userCoupon.status = 'used'
  userCoupon.usedAt = new Date().toISOString()
  userCoupon.orderId = orderId
  
  res.json({ code: 200, message: '使用成功', data: userCoupon })
})

// ============ 秒杀系统 ============

// 获取秒杀列表
app.get('/api/flashsales', (req, res) => {
  const now = new Date().toISOString()
  const flashSales = db.flashSales.map(fs => {
    const product = db.products.find(p => p.id === fs.productId)
    let status = fs.status
    
    // 更新状态
    if (new Date(fs.startTime) <= new Date(now) && new Date(fs.endTime) >= new Date(now)) {
      status = 'active'
    } else if (new Date(fs.endTime) < new Date(now)) {
      status = 'ended'
    }
    
    return {
      ...fs,
      product,
      status,
      progress: Math.round((1 - fs.stock / fs.totalStock) * 100)
    }
  })
  
  res.json({ code: 200, data: flashSales })
})

// 获取秒杀详情
app.get('/api/flashsales/:id', (req, res) => {
  const fs = db.flashSales.find(f => f.id === parseInt(req.params.id))
  if (!fs) {
    return res.json({ code: 404, message: '秒杀活动不存在' })
  }
  
  const product = db.products.find(p => p.id === fs.productId)
  const now = new Date().toISOString()
  let status = fs.status
  
  if (new Date(fs.startTime) <= new Date(now) && new Date(fs.endTime) >= new Date(now)) {
    status = 'active'
  } else if (new Date(fs.endTime) < new Date(now)) {
    status = 'ended'
  }
  
  res.json({
    code: 200,
    data: {
      ...fs,
      product,
      status,
      progress: Math.round((1 - fs.stock / fs.totalStock) * 100),
      remainingTime: status === 'active' 
        ? Math.max(0, Math.floor((new Date(fs.endTime) - new Date(now)) / 1000))
        : status === 'upcoming'
        ? Math.floor((new Date(fs.startTime) - new Date(now)) / 1000)
        : 0
    }
  })
})

// 秒杀下单
app.post('/api/flashsales/:id/buy', authMiddleware, (req, res) => {
  const fsId = parseInt(req.params.id)
  const fs = db.flashSales.find(f => f.id === fsId)
  
  if (!fs) {
    return res.json({ code: 404, message: '秒杀活动不存在' })
  }
  
  const now = new Date().toISOString()
  
  if (new Date(fs.startTime) > new Date(now)) {
    return res.json({ code: 400, message: '秒杀活动尚未开始' })
  }
  
  if (new Date(fs.endTime) < new Date(now)) {
    return res.json({ code: 400, message: '秒杀活动已结束' })
  }
  
  const product = db.products.find(p => p.id === fs.productId)
  if (!product) {
    return res.json({ code: 404, message: '商品不存在' })
  }
  
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.json({ code: 404, message: '用户不存在' })
  }
  
  const userFlashOrder = db.orders.find(o => 
    o.userId === req.user.id && o.flashSaleId === fsId
  )
  if (userFlashOrder) {
    return res.json({ code: 400, message: '您已参与过本次秒杀活动' })
  }
  
  if (fs.stock <= 0) {
    return res.json({ code: 400, message: '库存已抢光' })
  }
  if (product.stock <= 0) {
    return res.json({ code: 400, message: '商品库存不足' })
  }
  
  let stockDeducted = false
  let productStockDeducted = false
  
  try {
    fs.stock--
    stockDeducted = true
    
    product.stock--
    productStockDeducted = true
    
    const orderItems = [{
      productId: product.id,
      name: product.name,
      price: fs.flashPrice,
      quantity: 1,
      image: product.image
    }]
    
    const order = {
      id: db.nextId.order++,
      userId: req.user.id,
      items: orderItems,
      totalPrice: fs.flashPrice,
      finalPrice: fs.flashPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      flashSaleId: fsId
    }
    db.orders.push(order)
    
    const points = Math.floor(fs.flashPrice * 10)
    user.points = (user.points || 0) + points
    updateUserLevel(user)
    
    db.pointsHistory.push({
      id: db.nextId.pointsHistory++,
      userId: user.id,
      type: 'order',
      amount: points,
      orderId: order.id,
      description: `秒杀购物奖励`,
      createdAt: new Date().toISOString()
    })
    
    res.json({
      code: 200,
      message: '秒杀成功！',
      data: { order, pointsEarned: points }
    })
  } catch (e) {
    if (stockDeducted) fs.stock++
    if (productStockDeducted) product.stock++
    res.json({ code: 500, message: '秒杀失败，请重试' })
  }
})

// ============ 辅助函数 ============

function getAllChildCategoryIds(parentId) {
  const ids = [parentId]
  const children = db.categories.filter(c => c.parentId === parentId)
  for (const child of children) {
    ids.push(...getAllChildCategoryIds(child.id))
  }
  return ids
}

// 启动服务器
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`)
})