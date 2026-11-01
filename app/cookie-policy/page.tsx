import type { Metadata } from "next";
import Link from "next/link";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";
export const metadata: Metadata = {
  title: "Cookies & local storage",
  description:
    "The storage SpeakAce uses, why it is used and how to control optional analytics.",
};
export default async function CookiePolicy() {
  const tr = (await getServerLanguage()) === "tr";
  const rows = tr
    ? [
        [
          "speakace_session",
          "Gerekli",
          "Giriş yaptığınız hesabı doğrular; HttpOnly.",
          "30 gün",
        ],
        [
          "speakace_admin_session",
          "Gerekli",
          "Yalnızca yönetici girişi için; HttpOnly.",
          "7 gün",
        ],
        [
          "speakace_google_oauth_state",
          "Gerekli",
          "Google giriş isteğinin güvenliğini doğrular; HttpOnly.",
          "10 dakika",
        ],
        [
          "speakace-language",
          "Tercih",
          "Seçtiğiniz arayüz dilini hatırlar.",
          "1 yıl",
        ],
        [
          "speakace_consent",
          "Gerekli",
          "Bu politikaya ilişkin izin ve ret tercihini, sürümünü ve zamanını saklar.",
          "180 gün",
        ],
        [
          "speakace_checkout_attribution",
          "Satın alma işlevi",
          "Sizin başlattığınız satın alma işleminin planını hatırlar ve geri dönmenizi sağlar.",
          "72 saat",
        ],
        [
          "speakace_visitor_id",
          "İsteğe bağlı analitik",
          "Yalnızca analitik izniyle oluşturulan site içi rastgele ziyaretçi tanımlayıcısı; HttpOnly.",
          "180 gün",
        ],
      ]
    : [
        [
          "speakace_session",
          "Necessary",
          "Authenticates your signed-in account; HttpOnly.",
          "30 days",
        ],
        [
          "speakace_admin_session",
          "Necessary",
          "Authenticates the admin workspace only; HttpOnly.",
          "7 days",
        ],
        [
          "speakace_google_oauth_state",
          "Necessary",
          "Validates the Google sign-in request; HttpOnly.",
          "10 minutes",
        ],
        [
          "speakace-language",
          "Preference",
          "Remembers the interface language you choose.",
          "1 year",
        ],
        [
          "speakace_consent",
          "Necessary",
          "Saves your consent or refusal, policy version and time.",
          "180 days",
        ],
        [
          "speakace_checkout_attribution",
          "Checkout functionality",
          "Remembers the plan in a checkout you initiated so you can return to it.",
          "72 hours",
        ],
        [
          "speakace_visitor_id",
          "Optional analytics",
          "Random first-party visitor identifier created only with analytics permission; HttpOnly.",
          "180 days",
        ],
      ];
  return (
    <main className="page-shell section legal-notice">
      <span className="eyebrow">
        {tr ? "Gizlilik / Çerezler" : "Privacy / Cookies"}
      </span>
      <h1>
        {tr ? "Çerezler ve tarayıcı depolama" : "Cookies & browser storage"}
      </h1>
      <p>
        {tr
          ? "Güncelleme: 1 Kasım 2026. Bu politika SpeakAce.org için geçerlidir."
          : "Updated 1 November 2026. This policy applies to SpeakAce.org."}
      </p>
      <p>
        {tr
          ? "Giriş ve güvenlik için gerekli çerezler ile seçtiğiniz dil, tema ve pratik ayarları hizmeti sunar. İsteğe bağlı kullanım analitiği ilk ziyarette kapalıdır. Sol alttaki “Çerez tercihleri” düğmesiyle reddedebilir, kabul edebilir veya kararınızı değiştirebilirsiniz. Siteyi kullanmaya devam etmek izin sayılmaz."
          : "Sign-in and security cookies, together with the language, theme and practice settings you choose, support the service. Optional usage analytics are off on your first visit. Use “Cookie settings” at the bottom left to decline, allow or change your choice. Continuing to browse does not count as consent."}
      </p>
      <div className="legal-table-scroll">
        <table>
          <thead>
            <tr>
              {(tr
                ? ["Ad", "Amaç", "Kullanım", "Azami süre"]
                : ["Name", "Purpose", "Use", "Maximum duration"]
              ).map((x) => (
                <th key={x} scope="col">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((x, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {x}
                    </th>
                  ) : (
                    <td key={i}>{x}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>
        {tr
          ? "Yerel depolama ve pratik kayıtları"
          : "Local storage and practice recordings"}
      </h2>
      <p>
        {tr
          ? "Tarayıcınızda speakace-theme, speakace-language ve speakace-user ile tercih ve geçici profil bilgileri; pratik kurtarma, çalışma ve onboarding anahtarlarıyla taslaklar; speakace-audio-* anahtarlarıyla sizin kayıtlarınız tutulabilir. Oturum kimliği sunucuda doğrulanır; yerel profil giriş yetkisi vermez. Bu işlevsel bilgiler siz temizleyene veya ilgili akışın süresi dolana kadar bu cihazda kalabilir. Ses kayıtlarını paylaşılmış cihazlarda bırakmayın. speakace-share-attribution yalnızca analitik izniyle saklanır."
          : "Your browser may store preferences and a temporary profile in speakace-theme, speakace-language and speakace-user; recovery, study and onboarding drafts; and your recordings under speakace-audio-* keys. Authentication is verified on the server; a local profile does not grant access. Functional data can remain on this device until you clear it or its flow expires. Avoid leaving recordings on shared devices. speakace-share-attribution is stored only with analytics permission."}
      </p>
      <h2>{tr ? "İsteğe bağlı analitik" : "Optional analytics"}</h2>
      <p>
        {tr
          ? "İzin verdiğinizde sayfa ve özellik kullanımı gibi olaylar SpeakAce'in kendi veritabanına gönderilir. Analitik olaylarına ses, transcript, parola veya e-posta içeriği eklenmez. İzni geri aldığınızda yeni kullanım olaylarının gönderimi durur ve siteye erişebildiğimiz eski takip kayıtlarını temizleriz. HttpOnly ziyaretçi çerezi sonraki site isteğinde temizlenir. Ret kararınız siteyi kullanmanızı engellemez."
          : "If you opt in, page and feature usage events are sent to SpeakAce’s database. Analytics events do not include audio, transcripts, passwords or email content. Withdrawal stops new usage events and clears accessible legacy tracking storage. The HttpOnly visitor cookie is removed on your next site request. Declining does not prevent you from using SpeakAce."}
      </p>
      <h2>{tr ? "Üçüncü taraflar" : "Third parties"}</h2>
      <p>
        {tr
          ? "Google Analytics, AdSense reklamları, Microsoft Clarity ve PostHog izleme araçları bu sürümde devre dışıdır. Google ile giriş ve Lemon Squeezy üzerinden ödeme, yalnızca o işlemi başlattığınızda ilgili sağlayıcının sayfasına yönlendirir; o sağlayıcının politikası ayrıca geçerlidir. Vercel güvenlik ve altyapı istek kayıtları hizmeti sunmak için işlenebilir; çerez izni sunucu güvenlik kayıtlarını kapatmaz."
          : "Google Analytics, AdSense advertising, Microsoft Clarity and PostHog tracking are disabled in this release. Google sign-in and Lemon Squeezy checkout open the provider only when you initiate that action; their own policies also apply. Vercel infrastructure and security request logs may be processed to operate the service; cookie choices do not disable server security logs."}
      </p>
      <h2>{tr ? "Tarayıcıdan yönetim" : "Browser controls"}</h2>
      <p>
        {tr
          ? "Tarayıcınızın site verisi ayarlarından çerez ve yerel kayıtları silebilirsiniz. Gerekli çerezleri engellemek giriş ve bazı pratik işlevlerini bozabilir. Çerez onayını hesabın kullanımı veya pazarlama e-postası izniyle birleştirmiyoruz."
          : "You can delete cookies and local storage through your browser’s site-data settings. Blocking necessary cookies can prevent sign-in or practice recovery. Cookie consent is separate from account terms and email marketing permission."}
      </p>
      <p>
        <Link href="/privacy-policy">
          {tr ? "Gizlilik ve KVKK aydınlatma metni" : "Privacy Notice"}
        </Link>{" "}
        ·{" "}
        <Link href="/terms">{tr ? "Kullanım koşulları" : "Terms of Use"}</Link>
      </p>
      <p>
        {tr ? "Gizlilik ve silme talepleri:" : "Privacy and deletion requests:"}{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </p>
    </main>
  );
}
