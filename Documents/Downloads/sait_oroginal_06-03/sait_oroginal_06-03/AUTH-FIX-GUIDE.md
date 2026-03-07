# 🔐 Исправление цикла авторизации Discord

## Проблема
Пользователь цикличег перенаправляется между Discord и сайтом при авторизации вместо того, чтобы авторизоваться.

## Решение

### 1️⃣ Проверьте логи сервера
Откройте консоль Vercel:
```
https://vercel.com/your-project/logs
```

Ищите ошибки с префиксами:
- ❌ `CRITICAL ERROR in JWT callback`
- ❌ `Database error on user lookup`
- ❌ `Error creating user`

### 2️⃣ Обновите NEXTAUTH_SECRET (ВАЖНО!)

Текущий секрет слишком простой. Генерируем новый:

```bash
node scripts/generate-nextauth-secret.js
```

Скопируйте вывод и:

**Локально** - обновите `.env`:
```
NEXTAUTH_SECRET="<новый_сгенерированный_секрет>"
```

**На Vercel** - откройте Project Settings → Environment Variables:
```
https://vercel.com/your-project-name/settings/environment-variables
```

Обновите `NEXTAUTH_SECRET` на новый значение.

⚠️ **ВАЖНО**: После изменения NEXTAUTH_SECRET все текущие сессии будут инвалидированы! 

### 3️⃣ Проверьте DATABASE_URL

В Vercel переменные окружения должны совпадать с локальными:

```bash
# Проверьте локально:
echo $env:DATABASE_URL
```

На Vercel эта переменная должна быть установлена и работать.

### 4️⃣ Проверьте Discord OAuth Settings

1. Откройте [Discord Developer Portal](https://discord.com/developers/applications)
2. Выберите ваше приложение
3. Откройте OAuth2 → General
4. Проверьте **Redirect URLs**:

Должен быть добавлен:
```
https://alcohol-petra-tracker-final.vercel.app/api/auth/callback/discord
```

Если сайт находится на другом домене, добавьте правильный URL.

### 5️⃣ Проверьте статус авторизации

Откройте в браузере:
```
https://alcohol-petra-tracker-final.vercel.app/api/debug/auth-status
```

Должен показать:
```json
{
  "status": "ok",
  "environment": {
    "NEXTAUTH_URL": true,
    "NEXTAUTH_SECRET": true,
    "DISCORD_CLIENT_ID": true,
    "DISCORD_CLIENT_SECRET": true,
    "DATABASE_URL": true
  },
  "database": "connected"
}
```

Если что-то `false` или `database` = `"error"`, это ваша проблема.

### 6️⃣ Очистите cookies и попробуйте снова

Если все выше настроено, откройте DevTools (F12) и:

1. Откройте Application → Cookies
2. Удалите все cookies для сайта (особенно `next-auth.session-token`, `next-auth.callback-url`)
3. Полностью перезагрузите страницу (Ctrl+Shift+R или Cmd+Shift+R)
4. Нажмите кнопку "Авторизоваться"

### 7️⃣ Если все еще не работает - проверьте логи

В Vercel перейдите в Deployments и смотрите Real-time Logs:

```
https://vercel.com/your-project/deployments
```

Нажмите на последний deployment и откройте "Logs" вкладку.

Ищите строки с логированием (я добавил их в `authOptions.ts`):
- `🔐 JWT Callback - discordId:`
- `👤 User lookup for:`
- `❌ Database error on user lookup:`
- `📝 Creating new user:`

## Быстрая диагностика

Если циклишь перенаправляется, сделайте:

1. **Проверьте console в браузере** (F12 → Console)
   - Ищите ошибки от next-auth

2. **Проверьте Vercel logs** 
   - Ищите мои логи с ❌ префиксами

3. **Вероятные проблемы по порядку:**
   - ❌ NEXTAUTH_SECRET не совпадает между локалью и Vercel (САМАЯ ЧАСТАЯ)
   - ❌ DATABASE_URL не установлена на Vercel
   - ❌ DATABASE_URL неправильная или БД недоступна
   - ❌ Discord Redirect URL неправильный
   - ❌ NEXTAUTH_URL неправильный

## Дополнительные команды

```bash
# Проверить что все зависимости установлены
npm install

# Пересоздать типы Prisma (на случай если БД схема изменилась)
npm run prisma:generate

# Локально создать миграцию (если изменилась schema.prisma)
npm run prisma:migrate

# Развернуть на Vercel
npm run vercel-deploy
```

## Что изменилось в коде

✅ **Добавлено детальное логирование** в `src/server/authOptions.ts`:
- Теперь я вижу каждый шаг авторизации
- Специфичные ошибки БД
- Проверка discordId на каждом этапе

✅ **Улучшена страница входа** в `app/signin/page.tsx`:
- Показывает конкретные ошибки
- Кнопка "Очистить cookies"
- Отладочную информацию при ошибках
- Защита от бесконечных циклов редиректов

✅ **Добавлен API endpoint** для отладки:
- `/api/debug/auth-status` - проверяет все переменные и подключение БД
