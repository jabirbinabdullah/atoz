import prisma from './src/lib/prisma.js'

async function seedDemo() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    })

    if (existingUser) {
      console.log('✓ Demo user already exists')
      return
    }

    await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Admin Demo',
        role: 'admin',
      },
    })

    console.log('✓ Demo user created successfully')
    console.log('  Email: demo@example.com')
    console.log('  Password: demo123')
  } catch (error) {
    console.error('Error seeding demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDemo()
