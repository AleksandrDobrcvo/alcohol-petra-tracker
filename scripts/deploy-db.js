const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Проверяем подключение к базе данных...');
  
  try {
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверяем существование таблицы User
    const userCount = await prisma.user.count();
    console.log(`✅ Таблица User существует, записей: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
