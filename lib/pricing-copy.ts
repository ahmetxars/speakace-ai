import type { PublicLanguage } from "@/lib/copy";
const en = {
  eyebrow: "Practice plans",
  title: "Start with your own answer. Choose more room when you need it.",
  intro:
    "Try speaking and writing on Free. Plus gives you a larger daily practice allowance and downloadable reports.",
  offer: "Choose a Plus offer",
  weekly: "Weekly subscription",
  annual: "Plus Annual · one payment",
  free: "Free",
  forever: "No payment required",
  week: "/ week",
  once: "one payment",
  trial: "3 days free, then $3.99 every week unless cancelled.",
  annualTerms:
    "$49.99 paid once. The current checkout does not automatically renew. No trial is shown for this offer.",
  freeNote: "Get to know the practice loop.",
  plusNote: "More attempts. More time to work on the feedback.",
  sessions: "Daily session allowance",
  minutes: "Daily speaking minutes",
  feedback: "Speaking feedback and transcript",
  writing: "Writing practice and feedback",
  export: "Downloadable PDF report",
  included: "Included",
  unavailable: "Not included",
  freeCta: "Start free",
  plusCta: "Continue to checkout",
  manage: "Manage current plan",
  account:
    "Use the same email as your SpeakAce account so your purchase can be linked to it.",
  paid: "You already have a paid plan. Manage its details in Billing.",
  comparison: "The actual difference",
  comparisonTitle: "The same practice loop. A larger daily allowance.",
  quotaNote:
    "Daily session limits also apply to writing practice. AI feedback is practice guidance, not an official exam result.",
  demoEyebrow: "See what changes",
  demoTitle: "Keep the feedback. Add room to practise.",
  demoBody:
    "Both plans include feedback on your submitted answer. Plus gives you more daily practice time and PDF report export.",
  sample: "Illustrative example · no live assessment",
  samplePrompt: "What do you like most about your hometown?",
  sampleAnswer:
    "“I like my hometown because it is very nice and the people are friendly.”",
  sampleFeedback: "Add one specific place or memory to develop your answer.",
  report: "PDF report",
  reportNote: "Plus includes exporting your report.",
  checkoutEyebrow: "Before you pay",
  checkoutTitle: "Know the payment you are choosing.",
  checkoutSteps: [
    {
      title: "Choose your offer",
      body: "Weekly is a recurring subscription with a three-day trial. Plus Annual is currently a one-time purchase, despite its product name.",
    },
    {
      title: "Review Lemon Squeezy checkout",
      body: "Confirm the offer, final total, taxes if applicable, and payment terms before paying. No payment happens on this page.",
    },
    {
      title: "Return to your account",
      body: "Keep your receipt and use the same account email. Your plan is updated after the payment provider confirms the purchase.",
    },
  ],
  faqTitle: "Billing questions",
  faqs: [
    {
      q: "Will my payment repeat?",
      a: "Weekly renews at $3.99 every week after the three-day trial unless cancelled. The current $49.99 Plus Annual checkout shows a single payment with no automatic renewal.",
    },
    {
      q: "How do I cancel a subscription?",
      a: "Open Billing in your account or the Lemon Squeezy customer portal to manage your active subscription. Review its next charge and cancellation terms there.",
    },
    {
      q: "Does Free include real feedback?",
      a: "Yes. Free includes speaking transcripts and feedback, plus writing practice, within its daily allowance. Plus increases the allowance and enables PDF report export.",
    },
    {
      q: "Are the scores official IELTS or TOEFL results?",
      a: "No. They are AI-generated practice estimates. SpeakAce is independent of the exam providers and cannot guarantee an exam score.",
    },
  ],
  portal: "Open customer portal",
  schools: "For schools",
  schoolTitle: "Start with a cohort and a real teaching workflow.",
  schoolBody:
    "Talk through your learners, teachers and pilot needs before deciding on a programme.",
  schoolCta: "Explore school pilots",
  closing: "Your next attempt starts with one question.",
  closingBody: "You can try Free without entering payment details.",
};
export const pricingCopy: Record<PublicLanguage, typeof en> = {
  en,
  tr: {
    eyebrow: "Pratik planları",
    title: "Kendi yanıtınla başla. Gerektiğinde daha fazla alan seç.",
    intro:
      "Konuşma ve yazmayı Free ile dene. Plus, günlük pratik limitlerini artırır ve rapor indirmeyi açar.",
    offer: "Plus teklifini seç",
    weekly: "Haftalık abonelik",
    annual: "Plus Annual · tek ödeme",
    free: "Free",
    forever: "Ödeme gerektirmez",
    week: "/ hafta",
    once: "tek ödeme",
    trial: "3 gün ücretsiz; iptal edilmezse ardından her hafta $3.99.",
    annualTerms:
      "Bir kez $49.99 ödenir. Mevcut ödeme sayfası otomatik yenilenmez. Bu teklifte deneme süresi görünmüyor.",
    freeNote: "Pratik döngüsünü tanı.",
    plusNote:
      "Daha fazla deneme. Geri bildirim üzerinde çalışmak için daha fazla zaman.",
    sessions: "Günlük oturum limiti",
    minutes: "Günlük konuşma dakikası",
    feedback: "Konuşma geri bildirimi ve transkript",
    writing: "Yazma pratiği ve geri bildirim",
    export: "İndirilebilir PDF raporu",
    included: "Dahil",
    unavailable: "Dahil değil",
    freeCta: "Ücretsiz başla",
    plusCta: "Ödeme sayfasına git",
    manage: "Mevcut planı yönet",
    account:
      "Satın almanın hesabınla eşleşmesi için SpeakAce hesabındaki e-posta adresini kullan.",
    paid: "Zaten ücretli bir planın var. Ayrıntılarını Ödemeler bölümünden yönet.",
    comparison: "Gerçek fark",
    comparisonTitle: "Aynı pratik döngüsü. Daha yüksek günlük limit.",
    quotaNote:
      "Günlük oturum limiti yazma pratiği için de geçerlidir. Yapay zekâ geri bildirimi pratik rehberidir; resmî sınav sonucu değildir.",
    demoEyebrow: "Farkı incele",
    demoTitle: "Geri bildirim aynı. Pratik için daha fazla alan.",
    demoBody:
      "İki plan da gönderdiğin yanıt için geri bildirim içerir. Plus, daha fazla günlük pratik süresi ve PDF raporu dışa aktarma sunar.",
    sample: "Temsili örnek · canlı değerlendirme değil",
    samplePrompt: "What do you like most about your hometown?",
    sampleAnswer:
      "“I like my hometown because it is very nice and the people are friendly.”",
    sampleFeedback: "Yanıtını geliştirmek için belirli bir yer veya anı ekle.",
    report: "PDF raporu",
    reportNote: "Plus, raporunu dışa aktarmayı içerir.",
    checkoutEyebrow: "Ödemeden önce",
    checkoutTitle: "Seçtiğin ödeme koşulunu bil.",
    checkoutSteps: [
      {
        title: "Teklifini seç",
        body: "Haftalık plan, üç gün denemeli yenilenen aboneliktir. Plus Annual, ürün adına rağmen şu anda tek seferlik satın almadır.",
      },
      {
        title: "Lemon Squeezy ekranını incele",
        body: "Ödemeden önce teklif, son tutar, varsa vergiler ve ödeme koşullarını kontrol et. Bu sayfada ödeme alınmaz.",
      },
      {
        title: "Hesabına dön",
        body: "Makbuzunu sakla ve aynı hesap e-postasını kullan. Planın, sağlayıcı satın almayı doğruladıktan sonra güncellenir.",
      },
    ],
    faqTitle: "Ödeme soruları",
    faqs: [
      {
        q: "Ödemem tekrar eder mi?",
        a: "Haftalık plan üç günlük denemeden sonra iptal edilene kadar her hafta $3.99 olarak yenilenir. Mevcut $49.99 Plus Annual ödeme sayfasında otomatik yenileme olmadan tek ödeme görünür.",
      },
      {
        q: "Aboneliğimi nasıl iptal ederim?",
        a: "Etkin aboneliğini yönetmek için hesabındaki Ödemeler bölümünü veya Lemon Squeezy müşteri portalını aç. Sonraki ödeme ve iptal koşullarını orada incele.",
      },
      {
        q: "Free gerçek geri bildirim içeriyor mu?",
        a: "Evet. Günlük limitleri içinde konuşma transkripti, geri bildirim ve yazma pratiği içerir. Plus limiti artırır ve PDF raporu dışa aktarmayı açar.",
      },
      {
        q: "Puanlar resmî IELTS veya TOEFL sonucu mu?",
        a: "Hayır. Yapay zekâ ile oluşturulmuş pratik tahminleridir. SpeakAce sınav sağlayıcılarından bağımsızdır ve sınav puanını garanti etmez.",
      },
    ],
    portal: "Müşteri portalını aç",
    schools: "Kurumlar için",
    schoolTitle: "Bir grup ve gerçek öğretim akışıyla başla.",
    schoolBody:
      "Programa karar vermeden önce öğrencilerini, öğretmenlerini ve pilot ihtiyaçlarını konuşalım.",
    schoolCta: "Kurum pilotlarını incele",
    closing: "Sonraki denemen tek bir soruyla başlar.",
    closingBody: "Ödeme bilgisi girmeden Free planını deneyebilirsin.",
  },
  de: {
    eyebrow: "Übungspläne",
    title: "Beginne mit deiner Antwort. Wähle bei Bedarf mehr Übungsraum.",
    intro:
      "Teste Sprechen und Schreiben mit Free. Plus erhöht das Tageskontingent und ermöglicht den Berichtexport.",
    offer: "Plus-Angebot wählen",
    weekly: "Wöchentliches Abo",
    annual: "Plus Annual · Einmalzahlung",
    free: "Free",
    forever: "Keine Zahlung nötig",
    week: "/ Woche",
    once: "einmalig",
    trial: "3 Tage kostenlos, danach $3.99 pro Woche bis zur Kündigung.",
    annualTerms:
      "Einmalig $49.99. Der aktuelle Checkout verlängert sich nicht automatisch. Für dieses Angebot wird keine Testphase angezeigt.",
    freeNote: "Lerne den Übungsablauf kennen.",
    plusNote: "Mehr Versuche. Mehr Zeit für dein Feedback.",
    sessions: "Tägliches Sitzungskontingent",
    minutes: "Sprechminuten pro Tag",
    feedback: "Sprechfeedback und Transkript",
    writing: "Schreibübungen und Feedback",
    export: "PDF-Bericht herunterladen",
    included: "Enthalten",
    unavailable: "Nicht enthalten",
    freeCta: "Kostenlos starten",
    plusCta: "Weiter zum Checkout",
    manage: "Aktuellen Plan verwalten",
    account:
      "Verwende dieselbe E-Mail-Adresse wie für dein SpeakAce-Konto, damit der Kauf zugeordnet werden kann.",
    paid: "Du hast bereits einen bezahlten Plan. Verwalte ihn unter Abrechnung.",
    comparison: "Der tatsächliche Unterschied",
    comparisonTitle: "Derselbe Übungsablauf. Ein größeres Tageskontingent.",
    quotaNote:
      "Das tägliche Sitzungslimit gilt auch für Schreibübungen. KI-Feedback ist eine Übungshilfe, kein offizielles Prüfungsergebnis.",
    demoEyebrow: "Den Unterschied ansehen",
    demoTitle: "Feedback behalten. Mehr Raum zum Üben.",
    demoBody:
      "Beide Pläne enthalten Feedback zu deiner Antwort. Plus bietet mehr tägliche Übungszeit und PDF-Berichtexport.",
    sample: "Illustratives Beispiel · keine Live-Bewertung",
    samplePrompt: en.samplePrompt,
    sampleAnswer: en.sampleAnswer,
    sampleFeedback: "Ergänze einen konkreten Ort oder eine Erinnerung.",
    report: "PDF-Bericht",
    reportNote: "Plus umfasst den Export deines Berichts.",
    checkoutEyebrow: "Vor dem Bezahlen",
    checkoutTitle: "Kenne die gewählten Zahlungsbedingungen.",
    checkoutSteps: [
      {
        title: "Angebot wählen",
        body: "Das Wochenabo hat drei kostenlose Testtage. Plus Annual ist trotz seines Namens derzeit ein einmaliger Kauf.",
      },
      {
        title: "Lemon Squeezy prüfen",
        body: "Prüfe Angebot, Endbetrag, gegebenenfalls Steuern und Zahlungsbedingungen. Auf dieser Seite wird nichts abgebucht.",
      },
      {
        title: "Zum Konto zurückkehren",
        body: "Bewahre den Beleg auf und nutze dieselbe Konto-E-Mail. Der Plan wird nach der Kaufbestätigung des Anbieters aktualisiert.",
      },
    ],
    faqTitle: "Fragen zur Zahlung",
    faqs: [
      {
        q: "Wird die Zahlung wiederholt?",
        a: "Das Wochenabo verlängert sich nach drei Testtagen für $3.99 pro Woche bis zur Kündigung. Der aktuelle Plus-Annual-Checkout zeigt eine Einmalzahlung von $49.99 ohne automatische Verlängerung.",
      },
      {
        q: "Wie kündige ich ein Abo?",
        a: "Verwalte es über Abrechnung in deinem Konto oder das Lemon-Squeezy-Kundenportal. Prüfe dort die nächste Zahlung und Kündigungsbedingungen.",
      },
      {
        q: "Enthält Free echtes Feedback?",
        a: "Ja. Free enthält Transkripte, Sprechfeedback und Schreibübungen im Tageskontingent. Plus erhöht das Kontingent und ermöglicht PDF-Export.",
      },
      {
        q: "Sind die Ergebnisse offiziell?",
        a: "Nein. Es sind KI-generierte Übungseinschätzungen. SpeakAce ist unabhängig von IELTS und TOEFL und garantiert kein Prüfungsergebnis.",
      },
    ],
    portal: "Kundenportal öffnen",
    schools: "Für Schulen",
    schoolTitle: "Mit einer Lerngruppe und einem echten Lehrablauf beginnen.",
    schoolBody:
      "Besprechen wir Lernende, Lehrkräfte und Pilotbedarf vor einer Entscheidung.",
    schoolCta: "Schulpiloten ansehen",
    closing: "Dein nächster Versuch beginnt mit einer Frage.",
    closingBody: "Teste Free ohne Zahlungsdaten.",
  },
  es: {
    eyebrow: "Planes de práctica",
    title: "Empieza con tu respuesta. Elige más espacio cuando lo necesites.",
    intro:
      "Prueba speaking y writing con Free. Plus amplía el límite diario y permite descargar informes.",
    offer: "Elige una oferta Plus",
    weekly: "Suscripción semanal",
    annual: "Plus Annual · pago único",
    free: "Free",
    forever: "Sin pago",
    week: "/ semana",
    once: "pago único",
    trial: "3 días gratis; después $3.99 cada semana hasta cancelar.",
    annualTerms:
      "Un pago de $49.99. El checkout actual no se renueva automáticamente. Esta oferta no muestra prueba gratuita.",
    freeNote: "Conoce el ciclo de práctica.",
    plusNote: "Más intentos. Más tiempo para trabajar el feedback.",
    sessions: "Sesiones diarias",
    minutes: "Minutos diarios de speaking",
    feedback: "Feedback de speaking y transcripción",
    writing: "Práctica de writing y feedback",
    export: "Informe PDF descargable",
    included: "Incluido",
    unavailable: "No incluido",
    freeCta: "Empezar gratis",
    plusCta: "Continuar al pago",
    manage: "Gestionar plan actual",
    account:
      "Usa el mismo correo de tu cuenta SpeakAce para vincular la compra.",
    paid: "Ya tienes un plan de pago. Gestiona sus detalles en Facturación.",
    comparison: "La diferencia real",
    comparisonTitle: "El mismo ciclo. Más capacidad diaria.",
    quotaNote:
      "El límite diario de sesiones también se aplica al writing. El feedback de IA orienta la práctica; no es un resultado oficial.",
    demoEyebrow: "Explora la diferencia",
    demoTitle: "Conserva el feedback. Añade espacio para practicar.",
    demoBody:
      "Ambos planes incluyen feedback sobre tu respuesta. Plus ofrece más tiempo diario de práctica y exportación de informes PDF.",
    sample: "Ejemplo ilustrativo · sin evaluación en directo",
    samplePrompt: en.samplePrompt,
    sampleAnswer: en.sampleAnswer,
    sampleFeedback:
      "Añade un lugar o recuerdo concreto para desarrollar la respuesta.",
    report: "Informe PDF",
    reportNote: "Plus incluye exportar tu informe.",
    checkoutEyebrow: "Antes de pagar",
    checkoutTitle: "Conoce las condiciones que eliges.",
    checkoutSteps: [
      {
        title: "Elige tu oferta",
        body: "El plan semanal es recurrente con tres días de prueba. Plus Annual es actualmente un pago único, pese a su nombre.",
      },
      {
        title: "Revisa Lemon Squeezy",
        body: "Confirma la oferta, total final, impuestos si corresponden y condiciones antes de pagar. No hay cobros en esta página.",
      },
      {
        title: "Vuelve a tu cuenta",
        body: "Guarda el recibo y usa el mismo correo. El plan se actualiza tras la confirmación del proveedor.",
      },
    ],
    faqTitle: "Preguntas sobre pagos",
    faqs: [
      {
        q: "¿Se repetirá el pago?",
        a: "El semanal se renueva por $3.99 cada semana tras los tres días de prueba hasta cancelar. El checkout actual de Plus Annual muestra $49.99 en un pago sin renovación automática.",
      },
      {
        q: "¿Cómo cancelo una suscripción?",
        a: "Abre Facturación o el portal de clientes de Lemon Squeezy para gestionar tu suscripción. Revisa allí el próximo cobro y las condiciones de cancelación.",
      },
      {
        q: "¿Free incluye feedback real?",
        a: "Sí. Incluye transcripción, feedback de speaking y práctica de writing dentro del límite diario. Plus amplía el límite y permite exportar PDF.",
      },
      {
        q: "¿Son resultados oficiales?",
        a: "No. Son estimaciones de práctica con IA. SpeakAce es independiente de los proveedores de exámenes y no garantiza una puntuación.",
      },
    ],
    portal: "Abrir portal de clientes",
    schools: "Para escuelas",
    schoolTitle: "Empieza con un grupo y un flujo docente real.",
    schoolBody:
      "Hablemos de alumnos, profesores y necesidades del piloto antes de decidir.",
    schoolCta: "Explorar pilotos escolares",
    closing: "Tu próximo intento empieza con una pregunta.",
    closingBody: "Puedes probar Free sin datos de pago.",
  },
  fr: {
    eyebrow: "Offres de pratique",
    title: "Commencez par votre réponse. Choisissez plus d’espace au besoin.",
    intro:
      "Essayez l’oral et l’écrit avec Free. Plus augmente le quota quotidien et permet de télécharger les rapports.",
    offer: "Choisir une offre Plus",
    weekly: "Abonnement hebdomadaire",
    annual: "Plus Annual · paiement unique",
    free: "Free",
    forever: "Aucun paiement requis",
    week: "/ semaine",
    once: "paiement unique",
    trial: "3 jours gratuits, puis $3.99 chaque semaine jusqu’à résiliation.",
    annualTerms:
      "Un paiement de $49.99. Le checkout actuel ne se renouvelle pas automatiquement. Aucun essai n’est affiché pour cette offre.",
    freeNote: "Découvrez la boucle de pratique.",
    plusNote: "Plus d’essais. Plus de temps pour travailler le feedback.",
    sessions: "Quota quotidien de sessions",
    minutes: "Minutes d’oral par jour",
    feedback: "Feedback oral et transcription",
    writing: "Pratique écrite et feedback",
    export: "Rapport PDF téléchargeable",
    included: "Inclus",
    unavailable: "Non inclus",
    freeCta: "Commencer gratuitement",
    plusCta: "Continuer vers le paiement",
    manage: "Gérer l’offre actuelle",
    account:
      "Utilisez l’adresse e-mail de votre compte SpeakAce pour relier l’achat.",
    paid: "Vous avez déjà une offre payante. Gérez-la dans Facturation.",
    comparison: "La différence réelle",
    comparisonTitle: "La même boucle. Un quota quotidien plus grand.",
    quotaNote:
      "La limite quotidienne de sessions s’applique aussi à l’écrit. Le feedback IA est une aide à la pratique, pas un résultat officiel.",
    demoEyebrow: "Voir la différence",
    demoTitle: "Gardez le feedback. Ajoutez de l’espace pour pratiquer.",
    demoBody:
      "Les deux offres incluent le feedback sur votre réponse. Plus offre plus de temps de pratique quotidien et l’export de rapports PDF.",
    sample: "Exemple illustratif · sans évaluation en direct",
    samplePrompt: en.samplePrompt,
    sampleAnswer: en.sampleAnswer,
    sampleFeedback:
      "Ajoutez un lieu ou un souvenir précis pour développer votre réponse.",
    report: "Rapport PDF",
    reportNote: "Plus inclut l’export de votre rapport.",
    checkoutEyebrow: "Avant de payer",
    checkoutTitle: "Comprenez les conditions choisies.",
    checkoutSteps: [
      {
        title: "Choisissez votre offre",
        body: "L’hebdomadaire est récurrent avec trois jours d’essai. Plus Annual est actuellement un achat unique malgré son nom.",
      },
      {
        title: "Vérifiez Lemon Squeezy",
        body: "Vérifiez l’offre, le total final, les taxes éventuelles et les conditions. Aucun paiement n’est effectué sur cette page.",
      },
      {
        title: "Revenez au compte",
        body: "Gardez le reçu et utilisez le même e-mail. L’offre est mise à jour après confirmation de l’achat par le prestataire.",
      },
    ],
    faqTitle: "Questions de facturation",
    faqs: [
      {
        q: "Le paiement se répète-t-il ?",
        a: "L’hebdomadaire se renouvelle à $3.99 par semaine après les trois jours d’essai jusqu’à résiliation. Le checkout Plus Annual actuel affiche un paiement de $49.99 sans renouvellement automatique.",
      },
      {
        q: "Comment résilier un abonnement ?",
        a: "Ouvrez Facturation dans votre compte ou le portail client Lemon Squeezy. Vérifiez-y le prochain prélèvement et les conditions de résiliation.",
      },
      {
        q: "Free inclut-il du vrai feedback ?",
        a: "Oui. Free inclut transcription, feedback oral et pratique écrite dans son quota quotidien. Plus augmente le quota et permet l’export PDF.",
      },
      {
        q: "Les scores sont-ils officiels ?",
        a: "Non. Ce sont des estimations de pratique par IA. SpeakAce est indépendant des organismes d’examen et ne garantit aucun score.",
      },
    ],
    portal: "Ouvrir le portail client",
    schools: "Pour les écoles",
    schoolTitle: "Commencez par un groupe et un vrai flux pédagogique.",
    schoolBody:
      "Discutons des élèves, des enseignants et des besoins du pilote avant de décider.",
    schoolCta: "Explorer les pilotes scolaires",
    closing: "Votre prochain essai commence par une question.",
    closingBody: "Essayez Free sans coordonnées de paiement.",
  },
};
