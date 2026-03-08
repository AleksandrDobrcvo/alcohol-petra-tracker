/**
 * Discord Webhook утилиты для уведомлений о доганах
 */

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

// Цвета для embed
const COLORS = {
  WARNING_ISSUED: 0xff6b6b,   // Красный - выдан доган
  WARNING_WORKED_OFF: 0x51cf66, // Зеленый - отработан
  USER_FROZEN: 0x868e96,      // Серый - заморозка
  USER_UNFROZEN: 0x4dabf7,    // Голубой - разморозка
};

async function sendDiscordWebhook(payload: DiscordWebhookPayload): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WARNINGS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("[Discord] Webhook URL not configured");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[Discord] Webhook failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Discord] Webhook error:", error);
    return false;
  }
}

/**
 * Уведомление о выдаче догана
 */
export async function notifyWarningIssued(params: {
  username: string;
  warningNumber: number;
  reason: string;
  requiredAmount: number;
  issuedByName: string;
}): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: `Доган #${params.warningNumber}`,
    description: `**${params.username}** отримав доган`,
    color: COLORS.WARNING_ISSUED,
    fields: [
      {
        name: "Причина",
        value: params.reason,
        inline: false,
      },
      {
        name: "Для відпрацювання",
        value: `${params.requiredAmount} шт.`,
        inline: true,
      },
      {
        name: "Видав",
        value: params.issuedByName,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook({ embeds: [embed] });
}

/**
 * Уведомление об отработке догана
 */
export async function notifyWarningWorkedOff(params: {
  username: string;
  warningNumber: number;
  workedOffType: string;
  workedOffAmount: number;
}): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: "Доган відпрацьовано",
    description: `**${params.username}** успішно відпрацював доган`,
    color: COLORS.WARNING_WORKED_OFF,
    fields: [
      {
        name: "Тип",
        value: params.workedOffType === "ALCO" ? "Алко" : "Петра",
        inline: true,
      },
      {
        name: "Здано",
        value: `${params.workedOffAmount} шт.`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook({ embeds: [embed] });
}

/**
 * Уведомление о заморозке пользователя (3 догана)
 */
export async function notifyUserFrozen(params: {
  username: string;
  reason: string;
}): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: "Користувача заморожено",
    description: `**${params.username}** отримав 3 догани`,
    color: COLORS.USER_FROZEN,
    fields: [
      {
        name: "Статус",
        value: "Акаунт заморожено до відпрацювання доганів",
        inline: false,
      },
    ],
    footer: {
      text: params.reason,
    },
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook({ embeds: [embed] });
}

/**
 * Уведомление о разморозке пользователя
 */
export async function notifyUserUnfrozen(params: {
  username: string;
  remainingWarnings: number;
}): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: "Користувача розморожено",
    description: `**${params.username}** розморожено`,
    color: COLORS.USER_UNFROZEN,
    fields: [
      {
        name: "Активних доганів",
        value: `${params.remainingWarnings}/3`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook({ embeds: [embed] });
}

/**
 * Прогресс отработки догана
 */
export async function notifyWarningProgress(params: {
  username: string;
  progress: number;
  required: number;
  type: string;
}): Promise<boolean> {
  const percentage = Math.round((params.progress / params.required) * 100);
  const progressBar = createProgressBar(percentage);
  
  const embed: DiscordEmbed = {
    title: "Прогрес відпрацювання",
    description: `**${params.username}** здав ${params.type === "ALCO" ? "алко" : "петру"}`,
    color: 0xffd43b, // Желтый
    fields: [
      {
        name: "Прогрес",
        value: `${progressBar} ${params.progress}/${params.required} (${percentage}%)`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook({ embeds: [embed] });
}

function createProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}
