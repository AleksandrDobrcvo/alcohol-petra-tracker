import { prisma } from "@/src/server/prisma";
import { jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    // Знайти всіх користувачів
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    if (users.length === 0) {
      return jsonOk({ message: "Немає користувачів" });
    }
    
    // Зробити першого користувача Лідером
    const firstUser = users[0];
    await prisma.user.update({
      where: { id: firstUser.id },
      data: {
        role: "LEADER",
        isApproved: true
      }
    });
    
    return jsonOk({ 
      message: `✅ ${firstUser.name} тепер Лідер!`,
      user: firstUser.name,
      discordId: firstUser.discordId
    });
    
  } catch (error) {
    return jsonOk({ error: "Щось пішло не так" });
  }
}