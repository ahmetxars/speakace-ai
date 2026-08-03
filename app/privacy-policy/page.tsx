import type { Metadata } from "next";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { getPrivacyControllerIdentity } from "@/lib/server/privacy-controller";
import { siteConfig } from "@/lib/site";

type PrivacyCopy = {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  controller: string;
  controllerText: string;
  representativeLabel: string;
  dpoLabel: string;
  collect: string;
  collectText: string;
  leadData: string;
  leadDataText: string;
  use: string;
  useItems: string[];
  legal: string;
  legalText: string;
  emailFlow: string;
  emailFlowText: string;
  third: string;
  thirdText: string;
  transfers: string;
  transfersText: string;
  transfersLink: string;
  retention: string;
  retentionText: string;
  choices: string;
  choicesText: string;
  contact: string;
  contactText: string;
};

const privacyCopy: Record<PublicLanguage, PrivacyCopy> = {
  en: {
    title: "Privacy Policy",
    description: "Read how SpeakAce collects, uses, retains, and protects personal information.",
    eyebrow: "Privacy Policy",
    heading: "Privacy Policy",
    intro: "This policy explains what SpeakAce collects, why it is used, which providers process it, and how you can control or delete your information.",
    controller: "Data controller",
    controllerText: "The legal entity below is the controller for personal information processed through SpeakAce.",
    representativeLabel: "EU/UK representative",
    dpoLabel: "Data-protection contact",
    collect: "Account and practice data",
    collectText: "We may collect your name, email address, language and study settings, speaking session data, recordings or transcripts you submit, feedback, and product usage activity.",
    leadData: "Score-diagnostic and contact requests",
    leadDataText: "If you request a guide, teacher walkthrough, or school demo without an account, we store the name and email you provide, consent time and version, language, landing-page path, referring hostname, UTM campaign fields, and email delivery or suppression state. We do not store the full referring URL.",
    use: "How we use information",
    useItems: [
      "Create and manage accounts",
      "Provide speaking practice, feedback, and progress tracking",
      "Improve product quality, reliability, and user experience",
      "Deliver requested material and measure the first-party campaign that brought the request",
      "Send account, billing, support, and consented practice emails"
    ],
    legal: "Legal bases",
    legalText: "We process data to perform our contract with account holders and provide requested services; on consent for optional practice and marketing emails; for legitimate interests such as service security, fraud prevention, reliability, and limited first-party campaign measurement where those interests do not override your rights; and where needed to meet legal obligations. You can withdraw consent at any time without affecting earlier lawful processing.",
    emailFlow: "Requested guide and follow-up emails",
    emailFlowText: "A score-diagnostic request sends one guide email. The three practice follow-ups do not start until you confirm ownership from that email. Once confirmed, they are scheduled for days 2, 4, and 7; the last may include a SpeakAce Plus annual offer. Creating an account stops the anonymous sequence. Teacher and school requests receive the requested walkthrough or demo communication instead of the learner sequence. An unsubscribe is durable: the public form will not reactivate that address; use authenticated account settings or contact support if you later want to opt in again.",
    third: "Third-party services",
    thirdText: "SpeakAce uses providers for hosting, payments, analytics, email delivery, and AI processing. Resend processes the recipient name or email, message content, delivery status, and suppression data needed to deliver these emails. Providers receive only the information needed for their role and, where they act as processors, are engaged under data-processing terms appropriate to that role.",
    transfers: "International transfers",
    transfersText: "Email delivery uses Resend, operated by Plus Five Five, Inc. Recipient addresses, message content, and delivery metadata are stored and processed in the United States. Resend’s DPA incorporates the EU Standard Contractual Clauses and UK Addendum and documents its Data Privacy Framework participation. You can obtain the applicable safeguard from us or review Resend’s current DPA.",
    transfersLink: "Review Resend’s Data Processing Addendum",
    retention: "Retention",
    retentionText: "We keep account and practice data while an account is active and afterwards only for service, security, dispute, deletion, or legal needs. For an unauthenticated lead, optional name and visit/campaign attribution are minimized after 30 days if follow-ups are not confirmed, or 90 days after the completed three-message sequence. Marketing delivery logs are deleted after 365 days. On unsubscribe, those optional fields are erased immediately. We retain the address and minimal consent/suppression record for as long as needed to honor the opt-out, unless a verified erasure request or law requires a different result.",
    choices: "Your choices and rights",
    choicesText: "You can withdraw email consent through the unsubscribe link in every marketing message. Depending on applicable law, you may also ask to access, correct, delete, restrict, or export personal information, and object to processing based on legitimate interests. We may need to verify your identity before completing a request. Withdrawal does not affect earlier lawful processing. You may lodge a complaint with your local data-protection authority.",
    contact: "Contact",
    contactText: "For privacy questions, consent withdrawal, or deletion requests, contact us at"
  },
  tr: {
    title: "Gizlilik Politikası",
    description: "SpeakAce'in kişisel bilgileri nasıl topladığını, kullandığını, sakladığını ve koruduğunu okuyun.",
    eyebrow: "Gizlilik Politikası",
    heading: "Gizlilik Politikası",
    intro: "Bu politika SpeakAce'in hangi bilgileri topladığını, neden kullandığını, hangi sağlayıcıların işlediğini ve bilgilerinizi nasıl yönetip sildirebileceğinizi açıklar.",
    controller: "Veri sorumlusu",
    controllerText: "Aşağıdaki tüzel kişi, SpeakAce üzerinden işlenen kişisel bilgilerin veri sorumlusudur.",
    representativeLabel: "AB/BK temsilcisi",
    dpoLabel: "Veri koruma iletişimi",
    collect: "Hesap ve pratik verileri",
    collectText: "Ad, e-posta, dil ve çalışma ayarları, speaking oturumları, gönderdiğiniz kayıt veya transcript'ler, geri bildirim ve ürün kullanım hareketlerini toplayabiliriz.",
    leadData: "Skor rehberi ve iletişim talepleri",
    leadDataText: "Hesap açmadan rehber, öğretmen tanıtımı veya okul demosu istediğinizde verdiğiniz ad ve e-postayı; onay zamanı ve sürümünü; dil, giriş sayfası yolu, yönlendiren alan adı, UTM kampanya alanları ile e-posta teslim veya suppression durumunu saklarız. Yönlendiren sayfanın tam URL'sini saklamayız.",
    use: "Bilgileri nasıl kullanıyoruz",
    useItems: ["Hesap oluşturmak ve yönetmek", "Speaking pratiği, geri bildirim ve gelişim takibi sunmak", "Ürün kalitesini, güvenilirliği ve deneyimi geliştirmek", "İstenen içeriği teslim etmek ve talebi getiren birinci taraf kampanyayı ölçmek", "Hesap, ödeme, destek ve izin verilen pratik e-postalarını göndermek"],
    legal: "Hukuki dayanaklar",
    legalText: "Hesap sahipleriyle sözleşmeyi yürütmek ve istenen hizmeti sunmak için; isteğe bağlı pratik ve pazarlama e-postalarında onaya dayanarak; haklarınız ağır basmadığı sürece hizmet güvenliği, dolandırıcılığı önleme, güvenilirlik ve sınırlı birinci taraf kampanya ölçümü gibi meşru menfaatler için; ayrıca yasal yükümlülükler gerektiğinde veri işleriz. Önceki hukuka uygun işlemleri etkilemeden onayınızı istediğiniz zaman geri çekebilirsiniz.",
    emailFlow: "İstenen rehber ve takip e-postaları",
    emailFlowText: "Skor rehberi talebi tek bir rehber e-postası gönderir. Üç pratik takip e-postası, o e-postadan adres sahipliğini doğrulayana kadar başlamaz. Doğrulama sonrası 2., 4. ve 7. gün için planlanır; son mesaj yıllık SpeakAce Plus teklifi içerebilir. Hesap açmanız anonim seriyi durdurur. Öğretmen ve okul talepleri öğrenci serisi yerine istenen tanıtım veya demo iletişimini alır. Abonelikten çıkış kalıcıdır: halka açık form adresi yeniden etkinleştirmez; tekrar katılmak için oturum açılmış hesap ayarlarını kullanın veya destekle iletişime geçin.",
    third: "Üçüncü taraf hizmetler",
    thirdText: "SpeakAce barındırma, ödeme, analitik, e-posta teslimi ve yapay zekâ işleme için hizmet sağlayıcılar kullanır. Resend bu e-postalar için gereken alıcı adı veya e-postası, mesaj içeriği, teslim ve suppression durumunu işler. Sağlayıcılar yalnızca görevleri için gereken bilgiyi alır ve veri işleyen sıfatıyla hareket ettiklerinde rollerine uygun veri işleme şartlarıyla görevlendirilir.",
    transfers: "Uluslararası veri aktarımları",
    transfersText: "E-posta teslimi, Plus Five Five, Inc. tarafından işletilen Resend üzerinden yapılır. Alıcı adresleri, mesaj içeriği ve teslim metadatası Amerika Birleşik Devletleri’nde saklanır ve işlenir. Resend DPA’sı AB Standart Sözleşme Maddelerini ve BK Ekini içerir ve Data Privacy Framework katılımını belgeler. Uygulanan güvenceyi bizden isteyebilir veya güncel DPA’yı inceleyebilirsiniz.",
    transfersLink: "Resend Veri İşleme Ekini incele",
    retention: "Saklama",
    retentionText: "Hesap ve pratik verilerini hesap aktifken, sonrasında ise yalnızca hizmet, güvenlik, uyuşmazlık, silme veya yasal ihtiyaçlar için tutarız. Hesapsız lead kaydındaki isteğe bağlı ad ve ziyaret/kampanya attribution verileri; takip onayı yoksa 30 gün sonra, üç mesajlık seri tamamlandıysa son mesajdan 90 gün sonra minimize edilir. Pazarlama teslim logları 365 gün sonra silinir. Abonelikten çıkışta isteğe bağlı alanlar hemen silinir. Adresi ve asgari onay/suppression kaydını çıkışı uygulamak için gerektiği sürece tutarız; doğrulanmış silme talebi veya yasa farklı bir sonuç gerektirebilir.",
    choices: "Tercihleriniz ve haklarınız",
    choicesText: "Her pazarlama e-postasındaki abonelikten çıkma bağlantısıyla izninizi geri çekebilirsiniz. Uygulanabilir hukuka göre kişisel bilgilere erişme, düzeltme, silme, işlemeyi kısıtlama veya dışa aktarma; meşru menfaate dayalı işlemeye itiraz etme hakkınız olabilir. Talebi tamamlamadan önce kimliğinizi doğrulamamız gerekebilir. Yerel veri koruma otoritesine şikâyette bulunabilirsiniz.",
    contact: "İletişim",
    contactText: "Gizlilik, izin geri çekme veya silme talepleri için bize şu adresten ulaşabilirsiniz:"
  },
  de: {
    title: "Datenschutz",
    description: "Lies, wie SpeakAce persönliche Daten sammelt, nutzt, speichert und schützt.",
    eyebrow: "Datenschutz",
    heading: "Datenschutzerklärung",
    intro: "Diese Richtlinie erklärt, welche Daten SpeakAce erhebt, warum sie verwendet werden, welche Anbieter sie verarbeiten und wie du sie kontrollieren oder löschen lassen kannst.",
    controller: "Verantwortlicher",
    controllerText: "Die unten genannte juristische Person ist für die über SpeakAce verarbeiteten personenbezogenen Daten verantwortlich.",
    representativeLabel: "EU-/UK-Vertreter",
    dpoLabel: "Datenschutzkontakt",
    collect: "Konto- und Übungsdaten",
    collectText: "Wir können Name, E-Mail, Sprache und Lerneinstellungen, Speaking-Sitzungen, eingereichte Aufnahmen oder Transkripte, Feedback und Nutzungsaktivität erfassen.",
    leadData: "Score-Diagnose und Kontaktanfragen",
    leadDataText: "Wenn du ohne Konto einen Leitfaden, Lehrer-Rundgang oder eine Schul-Demo anforderst, speichern wir Name und E-Mail, Einwilligungszeit und -version, Sprache, Landingpage-Pfad, verweisenden Hostnamen, UTM-Felder sowie Zustell- oder Sperrstatus. Die vollständige Referrer-URL speichern wir nicht.",
    use: "Wie wir Informationen verwenden",
    useItems: ["Konten erstellen und verwalten", "Speaking-Training, Feedback und Fortschritt bereitstellen", "Qualität, Zuverlässigkeit und Nutzererlebnis verbessern", "Angeforderte Inhalte liefern und die eigene Kampagnenquelle messen", "Konto-, Zahlungs-, Support- und genehmigte Übungs-E-Mails senden"],
    legal: "Rechtsgrundlagen",
    legalText: "Wir verarbeiten Daten zur Erfüllung unseres Vertrags mit Kontoinhabern und zur Bereitstellung angeforderter Dienste, auf Grundlage der Einwilligung für optionale Übungs- und Marketing-E-Mails, aufgrund berechtigter Interessen an Sicherheit, Betrugsprävention, Zuverlässigkeit und begrenzter eigener Kampagnenmessung, soweit deine Rechte nicht überwiegen, sowie zur Erfüllung rechtlicher Pflichten. Eine Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden.",
    emailFlow: "Leitfaden und Folge-E-Mails",
    emailFlowText: "Eine Score-Diagnose sendet zunächst genau eine Leitfaden-E-Mail. Die drei Übungs-Folgen starten erst nach Bestätigung der E-Mail-Inhaberschaft und sind dann für Tag 2, 4 und 7 geplant; die letzte kann ein SpeakAce-Plus-Jahresangebot enthalten. Ein Konto stoppt die anonyme Sequenz. Lehrer- und Schulanfragen erhalten stattdessen die angeforderte Kommunikation. Eine Abmeldung bleibt bestehen: Das öffentliche Formular reaktiviert die Adresse nicht; nutze dafür authentifizierte Kontoeinstellungen oder kontaktiere den Support.",
    third: "Drittanbieter",
    thirdText: "SpeakAce nutzt Dienstleister für Hosting, Zahlungen, Analysen, E-Mail-Zustellung und KI-Verarbeitung. Resend verarbeitet Empfängername oder -adresse, Nachrichteninhalt, Zustellstatus und Sperrdaten, die für diese E-Mails nötig sind. Anbieter erhalten nur die erforderlichen Daten und werden, soweit sie Auftragsverarbeiter sind, mit passenden Datenschutzbedingungen beauftragt.",
    transfers: "Internationale Übermittlungen",
    transfersText: "Der E-Mail-Versand erfolgt über Resend, betrieben von Plus Five Five, Inc. Empfängeradressen, Nachrichteninhalte und Zustellmetadaten werden in den USA gespeichert und verarbeitet. Resends DPA enthält die EU-Standardvertragsklauseln und das UK Addendum und dokumentiert die Teilnahme am Data Privacy Framework. Du kannst die anwendbare Garantie bei uns anfordern oder das aktuelle DPA prüfen.",
    transfersLink: "Resends Auftragsverarbeitungsvereinbarung ansehen",
    retention: "Speicherdauer",
    retentionText: "Konto- und Übungsdaten speichern wir während eines aktiven Kontos und danach nur für Dienst-, Sicherheits-, Streit-, Lösch- oder Rechtspflichten. Bei einem Lead ohne Konto werden optionaler Name und Besuchs-/Kampagnenzuordnung nach 30 Tagen ohne Bestätigung oder 90 Tage nach Abschluss der drei Nachrichten minimiert. Marketing-Zustellprotokolle werden nach 365 Tagen gelöscht. Bei Abmeldung löschen wir optionale Felder sofort. Adresse und minimaler Einwilligungs-/Sperrnachweis bleiben so lange erhalten, wie die Abmeldung beachtet werden muss, sofern ein verifizierter Löschantrag oder das Gesetz nichts anderes verlangt.",
    choices: "Wahlmöglichkeiten und Rechte",
    choicesText: "Du kannst die E-Mail-Einwilligung über den Abmeldelink widerrufen. Nach anwendbarem Recht kannst du Auskunft, Berichtigung, Löschung, Einschränkung oder Datenübertragbarkeit verlangen und einer Verarbeitung aufgrund berechtigter Interessen widersprechen. Wir können deine Identität prüfen. Du kannst dich bei deiner Datenschutzaufsichtsbehörde beschweren.",
    contact: "Kontakt",
    contactText: "Bei Datenschutz-, Widerrufs- oder Löschanfragen kontaktiere uns unter"
  },
  es: {
    title: "Política de privacidad",
    description: "Lee cómo SpeakAce recopila, usa, conserva y protege la información personal.",
    eyebrow: "Privacidad",
    heading: "Política de privacidad",
    intro: "Esta política explica qué recopila SpeakAce, por qué lo usa, qué proveedores lo procesan y cómo puedes controlar o eliminar tu información.",
    controller: "Responsable del tratamiento",
    controllerText: "La entidad jurídica indicada abajo es responsable de la información personal tratada mediante SpeakAce.",
    representativeLabel: "Representante UE/Reino Unido",
    dpoLabel: "Contacto de protección de datos",
    collect: "Datos de cuenta y práctica",
    collectText: "Podemos recopilar nombre, email, idioma y ajustes de estudio, sesiones de speaking, grabaciones o transcripciones enviadas, feedback y actividad de uso.",
    leadData: "Diagnóstico de puntuación y contacto",
    leadDataText: "Si solicitas una guía, recorrido docente o demo escolar sin cuenta, guardamos nombre y email, hora y versión del consentimiento, idioma, ruta de entrada, hostname de referencia, campos UTM y estado de entrega o supresión. No guardamos la URL de referencia completa.",
    use: "Cómo usamos la información",
    useItems: ["Crear y gestionar cuentas", "Ofrecer práctica de speaking, feedback y seguimiento", "Mejorar calidad, fiabilidad y experiencia", "Entregar lo solicitado y medir la campaña propia de origen", "Enviar emails de cuenta, pago, soporte y práctica consentida"],
    legal: "Bases jurídicas",
    legalText: "Tratamos datos para ejecutar el contrato con titulares de cuenta y prestar servicios solicitados; con consentimiento para emails opcionales de práctica y marketing; por intereses legítimos de seguridad, prevención del fraude, fiabilidad y medición limitada de campañas propias cuando no prevalezcan tus derechos; y para cumplir obligaciones legales. Puedes retirar el consentimiento en cualquier momento sin afectar al tratamiento lícito anterior.",
    emailFlow: "Guía y emails de seguimiento",
    emailFlowText: "Una solicitud de diagnóstico envía primero un único email con la guía. Los tres seguimientos empiezan solo tras confirmar la titularidad del email; se programan para los días 2, 4 y 7 y el último puede incluir una oferta anual de SpeakAce Plus. Crear una cuenta detiene la secuencia anónima. Docentes y escuelas reciben la comunicación solicitada en su lugar. La baja es duradera: el formulario público no reactiva la dirección; usa los ajustes autenticados de la cuenta o contacta con soporte para volver a suscribirte.",
    third: "Servicios de terceros",
    thirdText: "SpeakAce usa proveedores para hosting, pagos, analítica, email e IA. Resend procesa nombre o email del destinatario, contenido, estado de entrega y supresión necesarios. Cada proveedor recibe solo los datos necesarios y, cuando actúa como encargado, se contrata bajo condiciones de tratamiento adecuadas a su función.",
    transfers: "Transferencias internacionales",
    transfersText: "El envío de email usa Resend, operado por Plus Five Five, Inc. Las direcciones, el contenido y los metadatos de entrega se almacenan y tratan en Estados Unidos. El DPA de Resend incorpora las Cláusulas Contractuales Tipo de la UE y el Addendum del Reino Unido y documenta su participación en el Data Privacy Framework. Puedes pedirnos la garantía aplicable o consultar el DPA actual.",
    transfersLink: "Consultar el Acuerdo de Tratamiento de Datos de Resend",
    retention: "Conservación",
    retentionText: "Conservamos datos de cuenta y práctica mientras la cuenta está activa y después solo por necesidades de servicio, seguridad, disputas, borrado o ley. En un lead sin cuenta, el nombre opcional y la atribución de visita/campaña se minimizan tras 30 días sin confirmación o 90 días después de completar los tres mensajes. Los logs de entrega de marketing se borran tras 365 días. Al darte de baja borramos de inmediato los campos opcionales. Conservamos la dirección y el registro mínimo de consentimiento/supresión mientras sea necesario para respetar la baja, salvo que una solicitud verificada de borrado o la ley exija otro resultado.",
    choices: "Opciones y derechos",
    choicesText: "Puedes retirar el consentimiento desde el enlace de baja. Según la ley aplicable, también puedes pedir acceso, corrección, eliminación, limitación o portabilidad, y oponerte al tratamiento basado en intereses legítimos. Podemos verificar tu identidad antes de actuar. Puedes presentar una reclamación ante tu autoridad local de protección de datos.",
    contact: "Contacto",
    contactText: "Para privacidad, retirada de consentimiento o eliminación, escríbenos a"
  },
  fr: {
    title: "Politique de confidentialité",
    description: "Lisez comment SpeakAce collecte, utilise, conserve et protège les données personnelles.",
    eyebrow: "Confidentialité",
    heading: "Politique de confidentialité",
    intro: "Cette politique explique ce que SpeakAce collecte, pourquoi ces données sont utilisées, quels prestataires les traitent et comment les contrôler ou les supprimer.",
    controller: "Responsable du traitement",
    controllerText: "L’entité juridique ci-dessous est responsable des données personnelles traitées via SpeakAce.",
    representativeLabel: "Représentant UE/Royaume-Uni",
    dpoLabel: "Contact protection des données",
    collect: "Données de compte et de pratique",
    collectText: "Nous pouvons collecter le nom, l’e-mail, la langue et les réglages d’étude, les sessions speaking, les enregistrements ou transcriptions soumis, le feedback et l’activité d’utilisation.",
    leadData: "Diagnostic de score et contact",
    leadDataText: "Si vous demandez un guide, une visite enseignant ou une démo école sans compte, nous conservons nom et e-mail, heure et version du consentement, langue, chemin d’entrée, hôte référent, champs UTM et état de livraison ou suppression. Nous ne conservons pas l’URL référente complète.",
    use: "Comment nous utilisons les informations",
    useItems: ["Créer et gérer les comptes", "Fournir pratique speaking, feedback et suivi", "Améliorer qualité, fiabilité et expérience", "Livrer le contenu demandé et mesurer la campagne propriétaire d’origine", "Envoyer les e-mails de compte, paiement, support et pratique autorisée"],
    legal: "Bases juridiques",
    legalText: "Nous traitons les données pour exécuter le contrat avec les titulaires de compte et fournir les services demandés, sur la base du consentement pour les e-mails facultatifs de pratique et de marketing, au titre de nos intérêts légitimes de sécurité, prévention de la fraude, fiabilité et mesure limitée de campagnes propriétaires lorsque vos droits ne prévalent pas, et pour respecter nos obligations légales. Le consentement peut être retiré à tout moment sans affecter les traitements licites antérieurs.",
    emailFlow: "Guide et e-mails de suivi",
    emailFlowText: "Une demande de diagnostic envoie d’abord un seul e-mail avec le guide. Les trois suivis commencent uniquement après confirmation de la propriété de l’adresse; ils sont prévus aux jours 2, 4 et 7 et le dernier peut inclure une offre annuelle SpeakAce Plus. La création d’un compte arrête la séquence anonyme. Enseignants et écoles reçoivent la communication demandée à la place. La désinscription est durable : le formulaire public ne réactive pas l’adresse; utilisez les réglages authentifiés du compte ou contactez l’assistance pour vous réinscrire.",
    third: "Services tiers",
    thirdText: "SpeakAce utilise des prestataires pour l’hébergement, les paiements, l’analytique, l’e-mail et l’IA. Resend traite le nom ou l’adresse, le contenu, l’état de livraison et les données de suppression nécessaires. Chaque prestataire ne reçoit que les données utiles et, lorsqu’il agit comme sous-traitant, est engagé selon des conditions de traitement adaptées à son rôle.",
    transfers: "Transferts internationaux",
    transfersText: "L’envoi d’e-mails utilise Resend, exploité par Plus Five Five, Inc. Les adresses, contenus et métadonnées de livraison sont stockés et traités aux États-Unis. Le DPA de Resend intègre les Clauses Contractuelles Types de l’UE et l’Addendum britannique et documente sa participation au Data Privacy Framework. Vous pouvez nous demander la garantie applicable ou consulter le DPA actuel.",
    transfersLink: "Consulter l’avenant de traitement des données de Resend",
    retention: "Conservation",
    retentionText: "Nous gardons les données de compte et de pratique pendant l’activité du compte, puis seulement pour le service, la sécurité, les litiges, l’effacement ou la loi. Pour un lead sans compte, le nom facultatif et l’attribution visite/campagne sont minimisés après 30 jours sans confirmation ou 90 jours après la fin des trois messages. Les journaux de livraison marketing sont supprimés après 365 jours. À la désinscription, les champs facultatifs sont effacés immédiatement. Nous gardons l’adresse et la trace minimale de consentement/suppression aussi longtemps que nécessaire pour respecter le retrait, sauf demande d’effacement vérifiée ou exigence légale contraire.",
    choices: "Choix et droits",
    choicesText: "Vous pouvez retirer le consentement via le lien de désinscription. Selon la loi applicable, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité, et vous opposer au traitement fondé sur l’intérêt légitime. Nous pouvons vérifier votre identité. Vous pouvez saisir votre autorité locale de protection des données.",
    contact: "Contact",
    contactText: "Pour la confidentialité, le retrait du consentement ou l’effacement, contactez-nous à"
  }
};

async function getPrivacyCopy() {
  const language = await getServerLanguage();
  return privacyCopy[normalizePublicLanguage(language)];
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPrivacyCopy();
  return { title: copy.title, description: copy.description };
}

export default async function PrivacyPolicyPage() {
  const copy = await getPrivacyCopy();
  const controller = getPrivacyControllerIdentity();
  const sections = [
    [copy.collect, copy.collectText],
    [copy.leadData, copy.leadDataText],
    [copy.legal, copy.legalText],
    [copy.emailFlow, copy.emailFlowText],
    [copy.third, copy.thirdText],
    [copy.transfers, copy.transfersText],
    [copy.retention, copy.retentionText],
    [copy.choices, copy.choicesText]
  ] as const;

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.heading}</h1>
        <p className="practice-copy">{copy.intro}</p>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.controller}</strong>
          <p className="practice-copy">{copy.controllerText}</p>
          <address className="practice-copy" style={{ fontStyle: "normal" }}>
            <strong>{controller.legalName}</strong>
            <br />
            {controller.postalAddress}
            <br />
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </address>
          {controller.representative ? (
            <p className="practice-copy">
              <strong>{copy.representativeLabel}:</strong> {controller.representative}
            </p>
          ) : null}
          {controller.dpoEmail ? (
            <p className="practice-copy">
              <strong>{copy.dpoLabel}:</strong>{" "}
              <a href={`mailto:${controller.dpoEmail}`}>{controller.dpoEmail}</a>
            </p>
          ) : null}
        </section>

        {sections.slice(0, 2).map(([heading, text]) => (
          <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }} key={heading}>
            <strong>{heading}</strong>
            <p className="practice-copy">{text}</p>
          </section>
        ))}

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.use}</strong>
          <ul className="seo-bullet-list">
            {copy.useItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {sections.slice(2).map(([heading, text]) => (
          <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }} key={heading}>
            <strong>{heading}</strong>
            <p className="practice-copy">{text}</p>
            {heading === copy.transfers ? (
              <a href="https://resend.com/legal/dpa" rel="noreferrer" target="_blank">
                {copy.transfersLink}
              </a>
            ) : null}
          </section>
        ))}

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.contact}</strong>
          <p className="practice-copy">
            {copy.contactText} <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
