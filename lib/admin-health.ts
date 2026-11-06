export type AdminHealthConfiguration = {
  databaseConfigured: boolean;
  lemonWebhookConfigured: boolean;
  emailConfigured: boolean;
  emailLegalIdentityConfigured: boolean;
  commercialEmailConfigured: boolean;
  analyticsConfigured: boolean;
  posthogConfigured: boolean;
};
export type AdminHealthRow = {
  label: string;
  detail: string;
  status: string;
  tone: "neutral" | "success" | "warning";
};
/** Configuration is not a live delivery test; intentionally disabled services are neutral. */
export function getAdminHealthRows(
  config: AdminHealthConfiguration,
): AdminHealthRow[] {
  return [
    {
      label: "Veritabanı",
      detail: config.databaseConfigured
        ? "Bağlantı ayarı mevcut. Erişimi yukarıdaki canlı servis kontrolü doğrular."
        : "DATABASE_URL eksik.",
      status: config.databaseConfigured ? "Tanımlı" : "Ayar eksik",
      tone: config.databaseConfigured ? "neutral" : "warning",
    },
    {
      label: "Lemon webhook",
      detail: config.lemonWebhookConfigured
        ? "İmza doğrulama ayarı mevcut. Gerçek webhook teslimatı ayrıca kontrol edilir."
        : "Webhook imza ayarı eksik; ödeme erişimi güncellenemeyebilir.",
      status: config.lemonWebhookConfigured ? "Tanımlı" : "Ayar eksik",
      tone: config.lemonWebhookConfigured ? "neutral" : "warning",
    },
    {
      label: "Kayıt ve hesap e-postaları",
      detail: config.emailConfigured
        ? "Resend anahtarı ve gönderici tanımlı. Gerçek e-posta teslimatı bu ayar kontrolünden ayrı doğrulanır."
        : "RESEND_API_KEY veya EMAIL_FROM eksik.",
      status: config.emailConfigured ? "Tanımlı" : "Ayar eksik",
      tone: config.emailConfigured ? "neutral" : "warning",
    },
    {
      label: "Ticari e-postalar",
      detail: !config.emailLegalIdentityConfigured
        ? "Gönderen adı veya posta adresi eksik olduğu için kapalı. Hesap doğrulama e-postaları bu ticari gönderim izninden ayrıdır."
        : !config.emailConfigured
          ? "Gönderici bağlantısı tamamlanana kadar kapalı."
          : config.commercialEmailConfigured
            ? "Yalnızca kayıtlı pazarlama izni bulunan alıcılara gönderim yapılabilir."
            : "Gönderim yapılandırması tamamlanmamış.",
      status: config.commercialEmailConfigured ? "İzinle etkin" : "Kapalı",
      tone: config.commercialEmailConfigured ? "success" : "neutral",
    },
    {
      label: "Birinci taraf analitik",
      detail: config.analyticsConfigured
        ? "Kullanıcı çerez izni verirse olaylar kaydedilir. İzin yoksa boş trafik verisi normaldir."
        : "İsteğe bağlı analitik kapalı.",
      status: config.analyticsConfigured ? "İzinle etkin" : "Kapalı",
      tone: "neutral",
    },
    {
      label: "PostHog",
      detail: config.posthogConfigured
        ? "Harici izleme ayarı tanımlı; aktarımdan önce kullanıcı izni gerekir."
        : "Harici izleme bilinçli olarak kapalı. Birinci taraf analitik bundan etkilenmez.",
      status: config.posthogConfigured ? "Tanımlı" : "Kapalı",
      tone: "neutral",
    },
  ];
}
