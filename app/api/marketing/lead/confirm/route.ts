import { NextRequest } from "next/server";
import {
  confirmMarketingLeadFollowup,
  isMarketingLeadPersistenceAvailable
} from "@/lib/marketing-leads";
import { verifyMarketingLeadConfirmationToken } from "@/lib/server/marketing-lead-confirmation-token";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/server/rate-limit";

type ConfirmationLocale = "en" | "tr" | "de" | "es" | "fr";

const confirmationCopy: Record<ConfirmationLocale, {
  eyebrow: string;
  confirmButton: string;
  resourcesButton: string;
  safeNote: string;
  invalidTitle: string;
  invalidMessage: string;
  promptTitle: string;
  promptMessage: string;
  successTitle: string;
  successMessage: string;
  unavailableTitle: string;
  unavailableMessage: string;
}> = {
  en: {
    eyebrow: "SpeakAce email preferences",
    confirmButton: "Confirm the 3 follow-up emails",
    resourcesButton: "Open SpeakAce resources",
    safeNote: "Opening this page did not subscribe you. The follow-up sequence starts only after you press the confirmation button.",
    invalidTitle: "This confirmation link is not valid",
    invalidMessage: "The link may be incomplete, expired, or replaced. For privacy, the public form does not resend to an existing address. Contact SpeakAce support if you still want to activate follow-up emails.",
    promptTitle: "Confirm your practice follow-ups",
    promptMessage: "Your requested score diagnostic was the first and only email sent automatically. Confirm below to receive three short practice emails on days 2, 4, and 7, including one SpeakAce Plus annual offer.",
    successTitle: "Follow-up emails confirmed",
    successMessage: "Your three short practice emails are now scheduled from today. You can unsubscribe from any message at any time.",
    unavailableTitle: "Confirmation is temporarily unavailable",
    unavailableMessage: "We did not activate any follow-up emails. Please try this link again later."
  },
  tr: {
    eyebrow: "SpeakAce e-posta tercihleri",
    confirmButton: "3 takip e-postasını onayla",
    resourcesButton: "SpeakAce kaynaklarını aç",
    safeNote: "Bu sayfayı açmak seni abone yapmadı. Takip serisi yalnızca onay düğmesine bastığında başlar.",
    invalidTitle: "Bu onay bağlantısı geçerli değil",
    invalidMessage: "Bağlantı eksik, süresi dolmuş veya değiştirilmiş olabilir. Gizlilik nedeniyle halka açık form mevcut adrese yeniden gönderim yapmaz. Takipleri hâlâ istiyorsan SpeakAce destekle iletişime geç.",
    promptTitle: "Pratik takiplerini onayla",
    promptMessage: "İstediğin skor rehberi otomatik gönderilen ilk ve tek e-postaydı. 2., 4. ve 7. günlerde üç kısa pratik e-postası ve bir yıllık SpeakAce Plus teklifi almak için aşağıdan onayla.",
    successTitle: "Takip e-postaları onaylandı",
    successMessage: "Üç kısa pratik e-postan bugünden itibaren planlandı. Her mesajdan istediğin zaman çıkabilirsin.",
    unavailableTitle: "Onay geçici olarak kullanılamıyor",
    unavailableMessage: "Hiçbir takip e-postasını etkinleştirmedik. Lütfen bağlantıyı daha sonra tekrar dene."
  },
  de: {
    eyebrow: "SpeakAce E-Mail-Einstellungen",
    confirmButton: "3 Folge-E-Mails bestätigen",
    resourcesButton: "SpeakAce-Ressourcen öffnen",
    safeNote: "Das Öffnen dieser Seite hat dich nicht angemeldet. Die Folge beginnt erst nach dem Bestätigungsbutton.",
    invalidTitle: "Dieser Bestätigungslink ist ungültig",
    invalidMessage: "Der Link kann unvollständig, abgelaufen oder ersetzt sein. Zum Schutz deiner Privatsphäre sendet das öffentliche Formular nicht erneut an bestehende Adressen. Kontaktiere den SpeakAce-Support, wenn du die Folgen noch aktivieren möchtest.",
    promptTitle: "Übungs-Folge-E-Mails bestätigen",
    promptMessage: "Die angeforderte Score-Diagnose war die erste und einzige automatisch versandte E-Mail. Bestätige drei kurze Übungs-E-Mails an Tag 2, 4 und 7, darunter ein SpeakAce-Plus-Jahresangebot.",
    successTitle: "Folge-E-Mails bestätigt",
    successMessage: "Deine drei kurzen Übungs-E-Mails sind ab heute geplant. Du kannst dich jederzeit abmelden.",
    unavailableTitle: "Bestätigung vorübergehend nicht verfügbar",
    unavailableMessage: "Wir haben keine Folge-E-Mails aktiviert. Bitte versuche den Link später erneut."
  },
  es: {
    eyebrow: "Preferencias de email de SpeakAce",
    confirmButton: "Confirmar los 3 emails de seguimiento",
    resourcesButton: "Abrir recursos de SpeakAce",
    safeNote: "Abrir esta página no te ha suscrito. La secuencia solo empieza al pulsar el botón de confirmación.",
    invalidTitle: "Este enlace de confirmación no es válido",
    invalidMessage: "El enlace puede estar incompleto, caducado o sustituido. Por privacidad, el formulario público no reenvía a una dirección existente. Contacta con soporte de SpeakAce si aún quieres activar los seguimientos.",
    promptTitle: "Confirma tus seguimientos de práctica",
    promptMessage: "El diagnóstico solicitado fue el primer y único email automático. Confirma tres emails breves de práctica en los días 2, 4 y 7, incluida una oferta anual de SpeakAce Plus.",
    successTitle: "Emails de seguimiento confirmados",
    successMessage: "Tus tres emails breves de práctica están programados desde hoy. Puedes darte de baja en cualquier mensaje.",
    unavailableTitle: "La confirmación no está disponible temporalmente",
    unavailableMessage: "No hemos activado ningún seguimiento. Vuelve a probar este enlace más tarde."
  },
  fr: {
    eyebrow: "Préférences e-mail SpeakAce",
    confirmButton: "Confirmer les 3 e-mails de suivi",
    resourcesButton: "Ouvrir les ressources SpeakAce",
    safeNote: "Ouvrir cette page ne vous a pas inscrit. La séquence commence uniquement après le bouton de confirmation.",
    invalidTitle: "Ce lien de confirmation n’est pas valide",
    invalidMessage: "Le lien peut être incomplet, expiré ou remplacé. Pour protéger votre vie privée, le formulaire public ne renvoie pas à une adresse existante. Contactez l’assistance SpeakAce si vous souhaitez encore activer les suivis.",
    promptTitle: "Confirmez vos suivis de pratique",
    promptMessage: "Le diagnostic demandé était le premier et unique e-mail automatique. Confirmez trois courts e-mails de pratique aux jours 2, 4 et 7, dont une offre annuelle SpeakAce Plus.",
    successTitle: "E-mails de suivi confirmés",
    successMessage: "Vos trois courts e-mails de pratique sont programmés à partir d’aujourd’hui. Désinscription possible dans chaque message.",
    unavailableTitle: "Confirmation temporairement indisponible",
    unavailableMessage: "Nous n’avons activé aucun suivi. Réessayez ce lien plus tard."
  }
};

function normalizeLocale(value: string | null | undefined): ConfirmationLocale {
  const normalized = value?.trim().toLowerCase().split("-")[0];
  return normalized === "tr" || normalized === "de" || normalized === "es" || normalized === "fr"
    ? normalized
    : "en";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function confirmationPage(input: {
  locale: ConfirmationLocale;
  title: string;
  message: string;
  status?: number;
  token?: string;
}) {
  const copy = confirmationCopy[input.locale];
  const action = input.token
    ? `<form method="post" action="/api/marketing/lead/confirm">
        <input type="hidden" name="token" value="${escapeHtml(input.token)}" />
        <input type="hidden" name="lang" value="${input.locale}" />
        <button type="submit">${escapeHtml(copy.confirmButton)}</button>
      </form>`
    : `<a class="button" href="/resources">${escapeHtml(copy.resourcesButton)}</a>`;

  return new Response(`<!doctype html>
<html lang="${input.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(input.title)} | SpeakAce AI</title>
    <style>
      :root { color-scheme: light; font-family: Arial, sans-serif; background: #f8f6f3; color: #111318; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
      main { width: min(560px, 100%); background: #fff; border: 1px solid #dedbd6; border-radius: 22px; padding: 34px; box-sizing: border-box; box-shadow: 0 18px 60px rgba(17, 19, 24, .08); }
      .eyebrow { margin: 0 0 14px; color: #176a61; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: 0 0 16px; font-size: clamp(30px, 7vw, 48px); line-height: 1; letter-spacing: -.04em; }
      p { margin: 0 0 24px; color: #555b66; font-size: 17px; line-height: 1.65; }
      form { margin: 0; }
      button, .button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 20px; border: 0; border-radius: 999px; background: #2563eb; color: white; font: inherit; font-weight: 800; text-decoration: none; cursor: pointer; }
      small { display: block; margin-top: 18px; color: #737985; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
      <h1>${escapeHtml(input.title)}</h1>
      <p>${escapeHtml(input.message)}</p>
      ${action}
      ${input.token ? `<small>${escapeHtml(copy.safeNote)}</small>` : ""}
    </main>
  </body>
</html>`, {
    status: input.status ?? 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Language": input.locale,
      "Cache-Control": "no-store, max-age=0",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function invalidRequest(request: NextRequest, locale: ConfirmationLocale) {
  const limit = checkRateLimit({
    key: `lead-confirm-invalid:${getRequestIp(request)}`,
    windowMs: 60 * 60 * 1000,
    max: 100
  });
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);
  const copy = confirmationCopy[locale];
  return confirmationPage({
    locale,
    title: copy.invalidTitle,
    message: copy.invalidMessage,
    status: 400
  });
}

export async function GET(request: NextRequest) {
  const locale = normalizeLocale(request.nextUrl.searchParams.get("lang"));
  const copy = confirmationCopy[locale];
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!verifyMarketingLeadConfirmationToken(token)) return invalidRequest(request, locale);

  // GET is deliberately read-only. Email security scanners commonly open links;
  // only the explicit POST from the button below activates follow-up messages.
  return confirmationPage({
    locale,
    title: copy.promptTitle,
    message: copy.promptMessage,
    token
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const langValue = formData?.get("lang");
  const locale = normalizeLocale(typeof langValue === "string" ? langValue : request.nextUrl.searchParams.get("lang"));
  const copy = confirmationCopy[locale];
  const tokenValue = formData?.get("token");
  const token = typeof tokenValue === "string" ? tokenValue.trim() : "";
  const verified = verifyMarketingLeadConfirmationToken(token);
  if (!verified) return invalidRequest(request, locale);

  if (!isMarketingLeadPersistenceAvailable()) {
    return confirmationPage({
      locale,
      title: copy.unavailableTitle,
      message: copy.unavailableMessage,
      status: 503
    });
  }

  try {
    const result = await confirmMarketingLeadFollowup(verified);
    if (!result.ok) return invalidRequest(request, locale);

    return confirmationPage({
      locale,
      title: copy.successTitle,
      message: copy.successMessage
    });
  } catch {
    return confirmationPage({
      locale,
      title: copy.unavailableTitle,
      message: copy.unavailableMessage,
      status: 503
    });
  }
}
