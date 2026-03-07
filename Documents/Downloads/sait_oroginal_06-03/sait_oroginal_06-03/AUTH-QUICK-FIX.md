# 🚀 Чек-лист: Исправление авторизации за 5 минут

## ШАГ 1️⃣: Сгенерируйте новый NEXTAUTH_SECRET (1 мин)

Откройте PowerShell и запустите:
```powershell
node scripts/generate-nextauth-secret.js
```

**Вывод будет что-то вроде:**
```
=== NEXTAUTH_SECRET Generation ===

Generated secure secret:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

Add this to your .env file:
NEXTAUTH_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

**Скопируйте этот секрет** (без кавычек) в буфер обмена.

## ШАГ 2️⃣: Обновите локальный .env файл (30 сек)

Откройте `.env` и замените:
```diff
- NEXTAUTH_SECRET="sobranie-clan-tracker-secret-key-123456789"
+ NEXTAUTH_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

Сохраните файл (Ctrl+S).

## ШАГ 3️⃣: Обновите Vercel переменные (2 мин)

1. Откройте: https://vercel.com/your-project-name/settings/environment-variables
   
   (Замените `your-project-name` на ваше имя проекта)

2. Найдите переменную `NEXTAUTH_SECRET`

3. Нажмите на ней (или иконку редактирования)

4. Замените значение на новое из ШАГ 1

5. Нажмите "Save"

6. Подождите пока переменная применится (обычно 5-10 сек)

## ШАГ 4️⃣: Перезагрузите Production (1 мин)

Откройте: https://vercel.com/your-project-name/deployments

1. Найдите последний deployment
2. Нажмите на 3 точки (меню)
3. Выберите "Redeploy"
4. Дождитесь завершения (2-3 минуты)

## ШАГ 5️⃣: Протестируйте авторизацию (30 сек)

1. Откройте сайт: https://alcohol-petra-tracker-final.vercel.app

2. Нажмите "Увійти"

3. Авторизуйтесь в Discord

4. Если все работает - ✅ готово!

Если не работает → идите в раздел **"Диагностика"** ниже.

---

## 🔍 Диагностика если не работает

### Проверка 1: Статус авторизации

Откройте в браузере:
```
https://alcohol-petra-tracker-final.vercel.app/api/debug/auth-status
```

**Должно показать:**
```json
{
  "database": "connected",  ← должно быть "connected"!
  "environment": {
    "DATABASE_URL": true,
    "DISCORD_CLIENT_ID": true,
    "DISCORD_CLIENT_SECRET": true,
    "NEXTAUTH_SECRET": true,
    "NEXTAUTH_URL": true
  },
  "status": "ok"
}
```

Если что-то `false` - переменная не установлена на Vercel.

### Проверка 2: Логи сервера

1. Откройте: https://vercel.com/your-project-name/deployments
2. Нажмите на последний deployment
3. Откройте вкладку "Logs"
4. Ищите сообщения с ❌:
   - `❌ CRITICAL ERROR in JWT callback` - проблема с БД
   - `❌ Database error on user lookup` - БД не работает
   - `❌ Database connection failed` - БД не подключена

### Проверка 3: Cookies в браузере

1. Откройте F12 (DevTools)
2. Откройте Application → Cookies
3. Найдите cookies для вашего сайта
4. Удалите все (особенно `next-auth*`)
5. Перезагрузите страницу (Ctrl+Shift+R)
6. Попробуйте авторизоваться снова

### Проверка 4: Discord OAuth URL

Откройте: https://discord.com/developers/applications

1. Выберите ваше приложение
2. Откройте OAuth2 → General
3. Проверьте **Redirect URLs** - должен быть:
   ```
   https://alcohol-petra-tracker-final.vercel.app/api/auth/callback/discord
   ```

Если разные домены - добавьте правильный.

---

## ❓ Частые вопросы

**В: Почему появляется бесконечный цикл?**
О: Обычно это значит что JWT callback не вернул token или сессия не создалась.

**В: Почему БД говорит что недоступна?**
О: Проверьте DATABASE_URL на Vercel - часто она не совпадает с локальной.

**В: У меня другой домен, что делать?**
О: Замените `alcohol-petra-tracker-final.vercel.app` на ваш домен везде.

**В: Я изменил NEXTAUTH_SECRET но старые пользователи не могут войти?**
О: Это нормально - сессии устаревают когда меняетсяSecret. Пользователи просто авторизуются заново.

---

## 📞 Если ничего не помогает

Команды для локального тестирования:
```bash
# Установите зависимости
npm install

# Запустите локально
npm run dev

# Откройте http://localhost:3000
```

Если локально работает, но на Vercel нет - проблема в переменных окружения на Vercel.

Если локально не работает - проблема в коде или локальном БД.
