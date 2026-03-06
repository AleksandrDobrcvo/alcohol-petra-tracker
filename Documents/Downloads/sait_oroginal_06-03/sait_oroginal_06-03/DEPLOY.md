# Бесплатный деплой без своего домена

Свой домен не нужен — хост даст бесплатный адрес вида `твой-проект.vercel.app` или `твой-проект.onrender.com`. Поставил и всё.

---

## Вариант 1: Vercel + Neon (бесплатно, поддомен .vercel.app)

**Vercel** и **Neon** дают бесплатный тариф без карты. Получишь ссылку типа `alcohol-petra-tracker.vercel.app`.

1. Залей проект на **GitHub** (создай репозиторий и запушь код).
2. **База (Neon):**
   - Зайди на [neon.tech](https://neon.tech), регистрация через GitHub.
   - **New Project** → скопируй **Connection string** (PostgreSQL).
3. **Сайт (Vercel):**
   - Зайди на [vercel.com](https://vercel.com), войди через GitHub.
   - **Add New** → **Project** → выбери свой репозиторий → **Import**.
   - Пока не жми Deploy — зайди в **Environment Variables**.
4. **Переменные в Vercel** (все в одном проекте):
   - `DATABASE_URL` — вставь строку из Neon.
   - `NEXTAUTH_URL` — пока оставь `https://твой-проект.vercel.app` (имя проекта видно сверху, например `alcohol-petra-tracker`).
   - `NEXTAUTH_SECRET` — любая длинная случайная строка (можно сгенерировать: [randomkeygen.com](https://randomkeygen.com) → Code 256-bit).
   - `DISCORD_CLIENT_ID` и `DISCORD_CLIENT_SECRET` — из [Discord Developer Portal](https://discord.com/developers/applications) (см. DISCORD_SETUP.md).
   - По желанию: `OWNER_DISCORD_ID` — твой Discord ID (чтобы стать владельцем).
5. Нажми **Deploy**. Дождись сборки — Vercel покажет ссылку, например `https://alcohol-petra-tracker.vercel.app`.
6. Обнови `NEXTAUTH_URL`: в Vercel → **Settings** → **Environment Variables** → измени `NEXTAUTH_URL` на точную ссылку (как в п.5) и сохрани. Сделай **Redeploy** (Deployments → три точки у последнего деплоя → Redeploy).
7. В Discord-приложении в **OAuth2** → **Redirects** добавь: `https://твой-проект.vercel.app/api/auth/callback/discord` (с твоей реальной ссылкой из п.5).

Готово: заходи по ссылке с Vercel — домен не нужен.

---

## Вариант 2: Render (бесплатно, поддомен .onrender.com)

Всё в одном месте: и сайт, и БД. Адрес будет типа `твой-проект.onrender.com`. Бесплатный сервис «засыпает» после ~15 мин без заходов (первый заход после этого может подождать 30–50 сек).

1. Залей проект на **GitHub**.
2. Зайди на [render.com](https://render.com), войди через GitHub.
3. **New +** → **PostgreSQL** — создай базу, запомни/скопируй **Internal Database URL** (или External, если Render попросит).
4. **New +** → **Web Service** → выбери репозиторий.
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free.
5. В **Environment** добавь переменные:
   - `DATABASE_URL` — строка подключения из шага 3.
   - `NEXTAUTH_URL` — после первого деплоя Render даст ссылку; тогда поставь `https://твой-сервис.onrender.com` и сделай **Manual Deploy** ещё раз.
   - `NEXTAUTH_SECRET` — случайная длинная строка.
   - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, при желании `OWNER_DISCORD_ID`.
6. В Discord в **Redirects** добавь: `https://твой-сервис.onrender.com/api/auth/callback/discord`.

Готово: заходи по ссылке с Render.

---

## После деплоя

- Сайт открывается по бесплатной ссылке (Vercel или Render) — свой домен не нужен.
- Первый вход через Discord создаст тебя в БД; если указан `OWNER_DISCORD_ID`, получишь роль владельца.

Локально: `docker-compose up -d`, в `.env` укажи `DATABASE_URL="postgresql://postgres:clan123456@localhost:5432/clan_tracker"` и остальное по `.env.example`, затем `npm run dev`.
