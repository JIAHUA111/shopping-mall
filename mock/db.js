import bcrypt from 'bcryptjs'

const hashPassword = (password) => bcrypt.hashSync(password, 10)

const db = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: hashPassword('123456'),
      email: 'admin@shop.com',
      phone: '13800138000',
      level: 'gold',
      points: 8500,
      signStreak: 0,
      createdAt: '2026-01-01T00:00:00Z',
      lastSignAt: null
    }
  ],
  categories: [
    { id: 1, name: '电子产品', parentId: 0 },
    { id: 2, name: '手机', parentId: 1 },
    { id: 3, name: '电脑', parentId: 1 },
    { id: 4, name: '耳机', parentId: 1 },
    { id: 5, name: '服装', parentId: 0 },
    { id: 6, name: '男装', parentId: 5 },
    { id: 7, name: '女装', parentId: 5 },
    { id: 8, name: '鞋靴', parentId: 5 },
    { id: 9, name: '食品', parentId: 0 },
    { id: 10, name: '零食', parentId: 9 },
    { id: 11, name: '饮料', parentId: 9 },
    { id: 12, name: '家居', parentId: 0 },
    { id: 13, name: '家具', parentId: 12 },
    { id: 14, name: '厨具', parentId: 12 }
  ],
  products: [
    { 
      id: 1, name: 'iPhone 15 Pro', categoryId: 2, price: 8999, stock: 50, 
      image: '/iPhone-15-Pro.jpg', 
      description: 'Apple iPhone 15 Pro 256GB 钛金属设计',
      images: ['/iPhone-15-Pro.jpg', '/iPhone-15-Pro.jpg', '/iPhone-15-Pro.jpg'],
      specs: [
        { name: '颜色', options: ['钛金属黑', '钛金属白', '钛金属蓝', '钛金属灰'] },
        { name: '容量', options: ['128GB', '256GB', '512GB', '1TB'] }
      ],
      detail: '全新钛金属设计，A17 Pro芯片，专业级摄像系统，USB-C接口，支持USB 3.0速度。Action按钮带来全新交互方式。'
    },
    { 
      id: 2, name: 'MacBook Air M3', categoryId: 3, price: 10999, stock: 30, 
      image: '/MacBook-Air-M3.jpg', 
      description: 'Apple MacBook Air M3 16GB/512GB',
      images: ['/MacBook-Air-M3.jpg', '/MacBook-Air-M3.jpg', '/MacBook-Air-M3.jpg'],
      specs: [
        { name: '颜色', options: ['午夜色', '星光色', '深空灰', '银色'] },
        { name: '配置', options: ['8GB+256GB', '16GB+512GB', '16GB+1TB'] }
      ],
      detail: '搭载M3芯片，18小时电池续航，Liquid Retina显示屏，轻薄便携，是创意工作和日常办公的理想选择。'
    },
    { 
      id: 3, name: 'AirPods Pro 2', categoryId: 4, price: 1899, stock: 100, 
      image: '/AirPods-Pro-2.jpg', 
      description: 'Apple AirPods Pro 第二代',
      images: ['/AirPods-Pro-2.jpg', '/AirPods-Pro-2.jpg', '/AirPods-Pro-2.jpg'],
      specs: [
        { name: '版本', options: ['标准版', 'USB-C版'] }
      ],
      detail: '主动降噪，自适应通透模式，个性化空间音频，最长6小时聆听时间，MagSafe充电盒支持无线充电。'
    },
    { 
      id: 4, name: '华为 Mate 60 Pro', categoryId: 2, price: 6999, stock: 40, 
      image: '/Huawei-Mate-60-Pro.jpg', 
      description: '华为 Mate 60 Pro 512GB',
      images: ['/Huawei-Mate-60-Pro.jpg', '/Huawei-Mate-60-Pro.jpg', '/Huawei-Mate-60-Pro.jpg'],
      specs: [
        { name: '颜色', options: ['雅丹黑', '雅川青', '白沙银', '南糯紫'] },
        { name: '容量', options: ['256GB', '512GB', '1TB'] }
      ],
      detail: '麒麟9000S芯片，卫星通信，超可靠玄武架构，全焦段超清影像，超级快充，鸿蒙4.0系统。'
    },
    { 
      id: 5, name: 'ThinkPad X1 Carbon', categoryId: 3, price: 12999, stock: 20, 
      image: '/ThinkPad-X1-Carbon.jpg', 
      description: '联想 ThinkPad X1 Carbon Gen 12',
      images: ['/ThinkPad-X1-Carbon.jpg', '/ThinkPad-X1-Carbon.jpg', '/ThinkPad-X1-Carbon.jpg'],
      specs: [
        { name: '处理器', options: ['i5-1335U', 'i7-1365U'] },
        { name: '配置', options: ['16GB+512GB', '32GB+1TB'] }
      ],
      detail: '第12代英特尔酷睿处理器，14英寸2.8K OLED屏幕，军规品质，轻薄商务本首选。'
    },
    { 
      id: 6, name: 'Sony WH-1000XM5', categoryId: 4, price: 2499, stock: 60, 
      image: '/Sony-WH-1000XM5.jpg', 
      description: 'Sony 降噪耳机 WH-1000XM5',
      images: ['/Sony-WH-1000XM5.jpg', '/Sony-WH-1000XM5.jpg', '/Sony-WH-1000XM5.jpg'],
      specs: [
        { name: '颜色', options: ['黑色', '银色'] }
      ],
      detail: '业界领先降噪，30小时续航，Hi-Res Audio认证，多点连接，舒适佩戴体验。'
    },
    { 
      id: 7, name: '男士休闲西装', categoryId: 6, price: 599, stock: 80, 
      image: '/men-suit.jpg', 
      description: '商务休闲男士西装外套',
      images: ['/men-suit.jpg', '/men-suit.jpg', '/men-suit.jpg'],
      specs: [
        { name: '颜色', options: ['黑色', '深灰', '藏蓝'] },
        { name: '尺码', options: ['M', 'L', 'XL', 'XXL'] }
      ],
      detail: '精选优质面料，修身版型，商务休闲两相宜，精湛工艺，舒适透气。'
    },
    { 
      id: 8, name: '女士连衣裙', categoryId: 7, price: 399, stock: 120, 
      image: '/women-dress.jpg', 
      description: '夏季女士碎花连衣裙',
      images: ['/women-dress.jpg', '/women-dress.jpg', '/women-dress.jpg'],
      specs: [
        { name: '颜色', options: ['碎花', '纯色', '条纹'] },
        { name: '尺码', options: ['S', 'M', 'L', 'XL'] }
      ],
      detail: '雪纺面料，轻盈飘逸，收腰设计显瘦显高，夏日必备单品。'
    },
    { 
      id: 9, name: 'Nike Air Max', categoryId: 8, price: 899, stock: 90, 
      image: '/Nike-Air-Max.jpg', 
      description: 'Nike Air Max 270 运动鞋',
      images: ['/Nike-Air-Max.jpg', '/Nike-Air-Max.jpg', '/Nike-Air-Max.jpg'],
      specs: [
        { name: '颜色', options: ['黑白', '红黑', '蓝白'] },
        { name: '尺码', options: ['39', '40', '41', '42', '43', '44'] }
      ],
      detail: 'Air气垫技术，缓震舒适，透气网面，潮流设计，运动休闲百搭。'
    },
    { 
      id: 10, name: '三只松鼠坚果礼盒', categoryId: 10, price: 128, stock: 200, 
      image: '/nuts-gift-box.jpg', 
      description: '三只松鼠每日坚果礼盒750g',
      images: ['/nuts-gift-box.jpg', '/nuts-gift-box.jpg', '/nuts-gift-box.jpg'],
      specs: [
        { name: '规格', options: ['750g/30包', '1500g/60包'] }
      ],
      detail: '精选8种坚果果干，科学配比，每日一包，营养健康，精美礼盒装。'
    },
    { 
      id: 11, name: '元气森林气泡水', categoryId: 11, price: 5, stock: 500, 
      image: '/sparkling-water.jpg', 
      description: '元气森林白桃味气泡水480ml',
      images: ['/sparkling-water.jpg', '/sparkling-water.jpg', '/sparkling-water.jpg'],
      specs: [
        { name: '口味', options: ['白桃味', '葡萄味', '荔枝味', '卡曼橘味'] },
        { name: '规格', options: ['480ml*1瓶', '480ml*15瓶'] }
      ],
      detail: '0糖0脂0卡，强劲气泡，果味浓郁，清爽解腻，好喝无负担。'
    },
    { 
      id: 12, name: '北欧风书桌', categoryId: 13, price: 1299, stock: 25, 
      image: '/nordic-desk.jpg', 
      description: '简约北欧风实木书桌1.2m',
      images: ['/nordic-desk.jpg', '/nordic-desk.jpg', '/nordic-desk.jpg'],
      specs: [
        { name: '尺寸', options: ['1.0m', '1.2m', '1.4m'] },
        { name: '颜色', options: ['原木色', '胡桃色', '白色'] }
      ],
      detail: '进口实木，环保板材，简约设计，稳固耐用，居家办公首选。'
    },
    { 
      id: 13, name: '不粘锅三件套', categoryId: 14, price: 299, stock: 150, 
      image: '/non-stick-pans.jpg', 
      description: '麦饭石不粘锅厨具三件套',
      images: ['/non-stick-pans.jpg', '/non-stick-pans.jpg', '/non-stick-pans.jpg'],
      specs: [
        { name: '套装', options: ['三件套', '五件套'] }
      ],
      detail: '麦饭石不粘涂层，少油烟易清洗，复合锅底，导热均匀，一套搞定各种烹饪。'
    },
    { 
      id: 14, name: 'Samsung Galaxy S24', categoryId: 2, price: 7999, stock: 35, 
      image: '/Samsung-Galaxy-S24.jpg', 
      description: 'Samsung Galaxy S24 Ultra 512GB',
      images: ['/Samsung-Galaxy-S24.jpg', '/Samsung-Galaxy-S24.jpg', '/Samsung-Galaxy-S24.jpg'],
      specs: [
        { name: '颜色', options: ['钛灰', '钛黑', '钛紫', '钛黄'] },
        { name: '容量', options: ['256GB', '512GB', '1TB'] }
      ],
      detail: 'Galaxy AI智能助手，2亿像素相机，S Pen手写笔，骁龙8 Gen 3处理器。'
    },
    { 
      id: 15, name: '男士商务皮鞋', categoryId: 8, price: 699, stock: 70, 
      image: '/men-dress-shoes.jpg', 
      description: '头层牛皮商务正装皮鞋',
      images: ['/men-dress-shoes.jpg', '/men-dress-shoes.jpg', '/men-dress-shoes.jpg'],
      specs: [
        { name: '颜色', options: ['黑色', '棕色'] },
        { name: '尺码', options: ['38', '39', '40', '41', '42', '43', '44'] }
      ],
      detail: '头层牛皮，舒适透气，橡胶大底，耐磨防滑，商务正装必备。'
    }
  ],
  productReviews: [
    { id: 1, productId: 1, userId: 1, username: '用户***8', rating: 5, content: '非常好的手机，钛金属质感很棒，性能强劲！', images: ['/iPhone-15-Pro.jpg'], createdAt: '2026-01-15T10:30:00Z' },
    { id: 2, productId: 1, userId: 2, username: '用户***6', rating: 4, content: '拍照效果很好，续航也不错，就是价格有点贵。', images: [], createdAt: '2026-01-10T15:20:00Z' },
    { id: 3, productId: 2, userId: 3, username: '用户***2', rating: 5, content: 'M3芯片太强了，剪辑视频毫无压力，续航也很顶！', images: [], createdAt: '2026-01-12T09:15:00Z' },
    { id: 4, productId: 3, userId: 4, username: '用户***5', rating: 5, content: '降噪效果一流，音质也很棒，佩戴舒适。', images: [], createdAt: '2026-01-08T14:45:00Z' }
  ],
  carts: [],      // { id, userId, productId, quantity }
  orders: [],     // { id, userId, items: [{productId, name, price, quantity}], totalPrice, status, createdAt, updatedAt }
  pointsHistory: [],  // { id, userId, type, amount, orderId, description, createdAt }
  coupons: [
    { id: 1, name: '新人专享券', type: 'new_user', discount: 50, minAmount: 200, userId: null, status: 'available', createdAt: '2026-01-01T00:00:00Z', expireAt: '2026-12-31T23:59:59Z' },
    { id: 2, name: '满减优惠券', type: 'full_reduction', discount: 100, minAmount: 500, userId: null, status: 'available', createdAt: '2026-01-01T00:00:00Z', expireAt: '2026-12-31T23:59:59Z' },
    { id: 3, name: '会员专享券', type: 'member', discount: 200, minAmount: 1000, userId: null, status: 'available', createdAt: '2026-01-01T00:00:00Z', expireAt: '2026-12-31T23:59:59Z' },
    { id: 4, name: '积分兑换券', type: 'points', discount: 30, minAmount: 0, userId: null, status: 'available', createdAt: '2026-01-01T00:00:00Z', expireAt: '2026-12-31T23:59:59Z' }
  ],
  userCoupons: [
    { id: 1, couponId: 1, userId: 1, status: 'unused', usedAt: null },
    { id: 2, couponId: 2, userId: 1, status: 'unused', usedAt: null }
  ],
  flashSales: [
    { id: 1, productId: 1, originalPrice: 8999, flashPrice: 6999, stock: 10, totalStock: 10, startTime: '2026-06-18T10:00:00Z', endTime: '2026-06-18T12:00:00Z', status: 'upcoming' },
    { id: 2, productId: 3, originalPrice: 1899, flashPrice: 999, stock: 20, totalStock: 20, startTime: '2026-06-18T14:00:00Z', endTime: '2026-06-18T16:00:00Z', status: 'upcoming' },
    { id: 3, productId: 6, originalPrice: 2499, flashPrice: 1499, stock: 15, totalStock: 15, startTime: '2026-06-18T18:00:00Z', endTime: '2026-06-18T20:00:00Z', status: 'upcoming' }
  ],
  addresses: [
    {
      id: 1,
      userId: 1,
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号SOHO现代城A座1001室',
      isDefault: true,
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      name: '李四',
      phone: '13900139000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴金融中心88号2001室',
      isDefault: false,
      createdAt: '2026-01-15T00:00:00Z'
    }
  ],
  favorites: [
    { id: 1, userId: 1, productId: 1, createdAt: '2026-06-01T10:00:00Z' },
    { id: 2, userId: 1, productId: 6, createdAt: '2026-06-10T14:00:00Z' },
    { id: 3, userId: 1, productId: 11, createdAt: '2026-06-15T09:00:00Z' }
  ],
  browseHistory: [
    { id: 1, userId: 1, productId: 1, createdAt: '2026-07-09T10:00:00Z' },
    { id: 2, userId: 1, productId: 2, createdAt: '2026-07-09T11:00:00Z' },
    { id: 3, userId: 1, productId: 6, createdAt: '2026-07-09T14:00:00Z' },
    { id: 4, userId: 1, productId: 3, createdAt: '2026-07-08T16:00:00Z' },
    { id: 5, userId: 1, productId: 11, createdAt: '2026-07-08T18:00:00Z' }
  ],
  feedbacks: [
    {
      id: 1,
      userId: 1,
      type: 'suggestion',
      content: '希望增加更多支付方式，比如微信支付',
      contact: '13800138000',
      status: 'processed',
      reply: '感谢您的建议，我们正在对接微信支付，预计下个版本上线。',
      createdAt: '2026-06-20T10:00:00Z'
    }
  ],
  nextId: { user: 2, product: 16, cart: 1, order: 1, category: 15, pointsHistory: 1, coupon: 5, userCoupon: 3, flashSale: 4, address: 3, favorite: 4, browseHistory: 6, feedback: 2 }
}

export default db