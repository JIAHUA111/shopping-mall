// 使用 Node.js 内置 fetch

async function testAPI() {
  console.log('=== 测试注册接口 ===')
  try {
    const registerRes = await fetch('http://localhost:3000/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: '123456', email: 'test@example.com' })
    })
    const registerData = await registerRes.json()
    console.log('注册结果:', registerData)
  } catch (e) {
    console.error('注册失败:', e.message)
  }

  console.log('\n=== 测试登录接口 ===')
  try {
    const loginRes = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: '123456' })
    })
    const loginData = await loginRes.json()
    console.log('登录结果:', loginData)

    if (loginData.code === 200) {
      const token = loginData.data.token

      console.log('\n=== 测试获取用户信息 ===')
      const userRes = await fetch('http://localhost:3000/api/user/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const userData = await userRes.json()
      console.log('用户信息:', userData)

      console.log('\n=== 测试获取分类列表 ===')
      const catRes = await fetch('http://localhost:3000/api/categories')
      const catData = await catRes.json()
      console.log('分类列表:', catData.data?.length || 0, '个分类')

      console.log('\n=== 测试获取商品列表 ===')
      const prodRes = await fetch('http://localhost:3000/api/products?pageSize=5')
      const prodData = await prodRes.json()
      console.log('商品列表:', prodData.data?.items?.length || 0, '个商品')

      console.log('\n=== 测试添加购物车 ===')
      const cartRes = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: 1, quantity: 2 })
      })
      const cartData = await cartRes.json()
      console.log('添加购物车:', cartData)

      console.log('\n=== 测试获取购物车 ===')
      const getCartRes = await fetch('http://localhost:3000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const getCartData = await getCartRes.json()
      console.log('购物车:', getCartData.data?.length || 0, '件商品')

      console.log('\n=== 测试获取商品库存（下单前）===')
      const productBeforeRes = await fetch('http://localhost:3000/api/products/1')
      const productBeforeData = await productBeforeRes.json()
      console.log('商品iPhone 15 Pro库存（下单前）:', productBeforeData.data?.stock)

      console.log('\n=== 测试创建订单 ===')
      const orderRes = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartIds: getCartData.data.map(item => item.id) })
      })
      const orderData = await orderRes.json()
      console.log('创建订单:', orderData)

      console.log('\n=== 测试获取商品库存（下单后）===')
      const productAfterRes = await fetch('http://localhost:3000/api/products/1')
      const productAfterData = await productAfterRes.json()
      console.log('商品iPhone 15 Pro库存（下单后）:', productAfterData.data?.stock)

      console.log('\n=== 测试搜索功能 ===')
      const searchRes = await fetch('http://localhost:3000/api/products?keyword=iPhone')
      const searchData = await searchRes.json()
      console.log('搜索iPhone结果:', searchData.data?.items?.length || 0, '个商品')

      console.log('\n=== 测试修改用户信息（修改用户名）===')
      const updateInfoRes = await fetch('http://localhost:3000/api/user/info', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: 'newname', email: 'newemail@test.com', phone: '13900139000' })
      })
      const updateInfoData = await updateInfoRes.json()
      console.log('修改用户信息:', updateInfoData)

      console.log('\n=== 测试获取更新后的用户信息 ===')
      const updatedUserRes = await fetch('http://localhost:3000/api/user/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const updatedUserData = await updatedUserRes.json()
      console.log('更新后的用户信息:', updatedUserData)
    }
  } catch (e) {
    console.error('测试失败:', e.message)
  }
}

testAPI()