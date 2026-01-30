# 🔐 Discord Login Setup

## 📋 Що потрібно для Discord логіна:

### 1. **Створити Discord Application:**
1. Зайди на [Discord Developer Portal](https://discord.com/developers/applications)
2. Натисни "New Application"
3. Дай назву "Clan Tracker"
4. Збережи

### 2. **Налаштувати OAuth2:**
1. Перейди на вкладку "OAuth2" → "General"
2. Додай "Redirect URI":
   ```
   https://your-domain.vercel.app/api/auth/callback/discord
   ```
3. Збережи зміни

### 3. **Отримати Client ID та Secret:**
1. Перейди на вкладку "OAuth2" → "General"
2. Скопіюй **Client ID**
3. Натисни "Reset Secret" та скопіюй **Client Secret**

### 4. **Налаштувати Environment Variables на Vercel:**
1. Зайди на Vercel → Settings → Environment Variables
2. Додай змінні:
   ```
   DISCORD_CLIENT_ID=твій_client_id
   DISCORD_CLIENT_SECRET=твій_client_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=випадковий_секретний_ключ
   ```

### 5. **Додати Discord Bot (опційно):**
1. Перейди на вкладку "Bot"
2. Натисни "Add Bot"
3. Увімкни "Server Members Intent"
4. Скопіюй **Bot Token**

## 🚀 **Готово!** 
Discord логін має працювати після налаштування цих змінних.
