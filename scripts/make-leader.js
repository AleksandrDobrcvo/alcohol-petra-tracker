const { PrismaClient } = require('@prisma/client');

async function makeLeader() {
  const prisma = new PrismaClient();
  
  try {
    // Знайти першого користувача
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    
    if (!user) {
      console.log('❌ Користувачів не знайдено');
      return;
    }
    
    // Зробити Лідером
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        role: 'LEADER',
        isApproved: true 
      }
    });
    
    console.log(`✅ Користувача ${user.name} (${user.discordId}) зроблено Лідером!`);
    console.log('Тепер ви можете бачити адмінку');
    
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeLeader();