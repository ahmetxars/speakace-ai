import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AdSenseUnit } from "@/components/adsense-unit";
import { BlogAudioExample } from "@/components/blog-audio-example";
import { BlogReadingEnhancements } from "@/components/blog-reading-enhancements";
import { getBlogChromeCopy, getLocalizedBlogPost, getLocalizedBlogPosts } from "@/lib/blog-content";
import { getBlogPublicDescription, getBlogPublicTitle, getBlogSeoEntry } from "@/lib/blog-seo";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { getPublishedCustomBlogPostBySlug, listPublishedCustomBlogPosts } from "@/lib/server/custom-blog";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const language = await getServerLanguage();
  const post = getLocalizedBlogPost(language, slug) ?? (await getPublishedCustomBlogPostBySlug(slug, language));
  if (!post) {
    return {};
  }
  const seoTitle = getBlogPublicTitle(slug, post.title);
  const seoDescription = getBlogPublicDescription(slug, post.description);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    keywords: post.keywords,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `${siteConfig.domain}/blog/${post.slug}`,
      siteName: siteConfig.name,
      type: "article"
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const language = await getServerLanguage();
  const chrome = getBlogChromeCopy(language);
  const pageLabels = {
    en: { resources: "Resources", guides: "Guides", readNext: "Read next" },
    tr: { resources: "Kaynaklar", guides: "Rehberler", readNext: "Sıradaki okunacak yazılar" },
    de: { resources: "Ressourcen", guides: "Leitfäden", readNext: "Als Nächstes lesen" },
    es: { resources: "Recursos", guides: "Guías", readNext: "Sigue leyendo" },
    fr: { resources: "Ressources", guides: "Guides", readNext: "À lire ensuite" },
    it: { resources: "Risorse", guides: "Guide", readNext: "Leggi dopo" },
    pt: { resources: "Recursos", guides: "Guias", readNext: "Ler a seguir" },
    nl: { resources: "Bronnen", guides: "Gidsen", readNext: "Lees hierna" },
    pl: { resources: "Materiały", guides: "Przewodniki", readNext: "Czytaj dalej" },
    ru: { resources: "Материалы", guides: "Гайды", readNext: "Читайте дальше" },
    ar: { resources: "المصادر", guides: "الأدلة", readNext: "اقرأ بعد ذلك" },
    ja: { resources: "リソース", guides: "ガイド", readNext: "次に読む" },
    ko: { resources: "리소스", guides: "가이드", readNext: "다음 글" }
  }[language];
  const ctaLabels = {
    en: { title: "Practice this topic with AI", description: "Get an IELTS-style score, instant feedback, and a clearer next attempt." },
    tr: { title: "Bu konuyu AI ile çalış", description: "IELTS benzeri skor, anında geri bildirim ve daha güçlü bir sonraki denemeyi gör." },
    de: { title: "Übe dieses Thema mit KI", description: "Sieh einen IELTS-ähnlichen Score, direktes Feedback und einen stärkeren nächsten Versuch." },
    es: { title: "Practica este tema con IA", description: "Obtén una puntuación estilo IELTS, feedback instantáneo y un intento más fuerte." },
    fr: { title: "Travaille ce sujet avec l’IA", description: "Obtiens un score type IELTS, un retour immédiat et une meilleure nouvelle tentative." },
    it: { title: "Lavora su questo tema con l’IA", description: "Ottieni un punteggio stile IELTS, feedback immediato e un tentativo successivo più forte." },
    pt: { title: "Pratique este tema com IA", description: "Receba uma pontuação estilo IELTS, feedback instantâneo e uma nova tentativa melhor." },
    nl: { title: "Oefen dit onderwerp met AI", description: "Krijg een IELTS-achtige score, directe feedback en een sterkere volgende poging." },
    pl: { title: "Ćwicz ten temat z AI", description: "Zobacz wynik w stylu IELTS, natychmiastowy feedback i mocniejszą kolejną próbę." },
    ru: { title: "Практикуйте эту тему с ИИ", description: "Получите балл в стиле IELTS, мгновенную обратную связь и более сильную следующую попытку." },
    ar: { title: "تدرّب على هذا الموضوع بالذكاء الاصطناعي", description: "احصل على درجة شبيهة بـ IELTS وملاحظات فورية ومحاولة أقوى بعد ذلك." },
    ja: { title: "このテーマをAIで練習する", description: "IELTS風スコア、即時フィードバック、より強い次の回答を確認できます。" },
    ko: { title: "이 주제를 AI로 연습해 보세요", description: "IELTS 스타일 점수, 즉시 피드백, 더 강한 다음 답변을 확인하세요." }
  }[language];
  const post = getLocalizedBlogPost(language, slug) ?? (await getPublishedCustomBlogPostBySlug(slug, language));
  if (!post) {
    notFound();
  }
  const practiceCta = getBlogPracticeCta({ slug: post.slug, title: post.title, language });
  const seoTitle = getBlogPublicTitle(slug, post.title);
  const seoDescription = getBlogPublicDescription(slug, post.description);
  const seoEntry = getBlogSeoEntry(slug);
  const audioTranscript = buildBlogAudioTranscript(post);

  const relatedPosts = [
    ...(await listPublishedCustomBlogPosts(language)),
    ...getLocalizedBlogPosts(language)
  ].filter((item, index, arr) => item.slug !== post.slug && arr.findIndex((candidate) => candidate.slug === item.slug) === index).slice(0, 3);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: breadcrumbLabels[language].home, item: siteConfig.domain },
      { "@type": "ListItem", position: 2, name: breadcrumbLabels[language].blog, item: `${siteConfig.domain}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${siteConfig.domain}/blog/${post.slug}` }
    ]
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seoTitle,
    datePublished: seoEntry?.datePublished ?? "2026-03-01",
    description: seoDescription,
    mainEntityOfPage: `${siteConfig.domain}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "SpeakAce",
      url: siteConfig.domain
    },
    publisher: {
      "@type": "Organization",
      name: "SpeakAce",
      url: siteConfig.domain
    }
  };

  return (
    <>
      <BlogReadingEnhancements
        ctaLabel={ctaLabels.title}
        ctaDescription={ctaLabels.description}
        ctaHref={practiceCta.href as Route}
      />
      <main className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{chrome.cta.blog}</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 0.98 }}>{seoTitle}</h1>
          <p>{seoDescription}</p>
        </div>

        <article className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link href="/blog" className="pill">{chrome.cta.blog}</Link>
            <Link href="/resources" className="pill">{pageLabels.resources}</Link>
            <Link href="/guides" className="pill">{pageLabels.guides}</Link>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.85 }}>{post.intro}</p>

          <BlogAudioExample
            title={audioLabels[language]}
            transcript={audioTranscript}
            tr={language === "tr"}
          />

          <div className="card spotlight-card" style={{ marginTop: "1.2rem" }}>
            <strong>{ctaLabels.title}</strong>
            <p style={{ marginTop: "0.55rem" }}>{ctaLabels.description}</p>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
              <Link className="button button-primary" href={practiceCta.href as Route}>
                {practiceCta.primaryLabel}
              </Link>
              <Link className="button button-secondary" href={practiceCta.secondaryHref as Route}>
                {practiceCta.secondaryLabel}
              </Link>
              <Link className="button button-secondary" href={relatedPosts[0] ? `/blog/${relatedPosts[0].slug}` : "/ielts-speaking-topics"}>
                {relatedPosts[0] ? pageLabels.readNext : fallbackTopicLabels[language]}
              </Link>
            </div>
          </div>

          {post.sections.map((section) => (
            <section key={section.title} style={{ marginTop: "1.8rem" }}>
              <h2 style={{ marginBottom: "0.7rem" }}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={{ color: "var(--muted)", lineHeight: 1.85 }}>
                  {linkParagraph(paragraph)}
                </p>
              ))}
              {section.title === post.sections[2]?.title ? (
                <div className="card quick-pitch" style={{ marginTop: "1.1rem" }}>
                  <h3 style={{ marginBottom: "0.55rem" }}>{practiceCta.inlineTitle}</h3>
                  <p className="practice-copy" style={{ marginBottom: "0.9rem" }}>
                    {practiceCta.inlineDescription}
                  </p>
                  <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                    <Link className="button button-primary" href={practiceCta.href as Route}>
                      {practiceCta.primaryLabel}
                    </Link>
                    <Link className="button button-secondary" href={practiceCta.secondaryHref as Route}>
                      {practiceCta.secondaryLabel}
                    </Link>
                    <Link className="button button-secondary" href="/pricing">
                      {unlockFeedbackLabels[language]}
                    </Link>
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </article>

        <AdSenseUnit />

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{chrome.cta.latest}</span>
            <h2>{pageLabels.readNext}</h2>
          </div>
          <div className="marketing-grid">
            {relatedPosts.map((item) => (
              <article key={item.slug} className="card feature-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link className="button button-secondary" href={`/blog/${item.slug}`}>
                  {chrome.cta.read}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>
    </>
  );
}

const internalLinkMap = [
  { phrase: "IELTS Part 1", href: "/ielts-speaking-part-1-questions" },
  { phrase: "IELTS Part 2", href: "/ielts-speaking-part-2-topics" },
  { phrase: "IELTS Part 3", href: "/ielts-speaking-part-3-questions" },
  { phrase: "IELTS speaking topics", href: "/ielts-speaking-topics" },
  { phrase: "free IELTS speaking test", href: "/free-ielts-speaking-test" },
  { phrase: "TOEFL speaking", href: "/app/practice" },
  { phrase: "IELTS speaking", href: "/app/practice?quickStart=1" }
];

function linkParagraph(paragraph: string): ReactNode {
  for (const item of internalLinkMap) {
    const index = paragraph.indexOf(item.phrase);
    if (index >= 0) {
      const before = paragraph.slice(0, index);
      const after = paragraph.slice(index + item.phrase.length);
      return (
        <>
          {before}
          <a href={item.href} style={{ color: "var(--primary)", fontWeight: 700 }}>
            {item.phrase}
          </a>
          {after}
        </>
      );
    }
  }

  return paragraph;
}

function buildBlogAudioTranscript(post: { intro: string; sections: Array<{ body: string[] }> }) {
  const segments = [post.intro, ...post.sections.flatMap((section) => section.body).slice(0, 2)]
    .map((item) => item.trim())
    .filter(Boolean);
  return segments.join(" ").slice(0, 700);
}

const breadcrumbLabels: Record<Language, { home: string; blog: string }> = {
  en: { home: "Home", blog: "Blog" },
  tr: { home: "Ana sayfa", blog: "Blog" },
  de: { home: "Startseite", blog: "Blog" },
  es: { home: "Inicio", blog: "Blog" },
  fr: { home: "Accueil", blog: "Blog" },
  it: { home: "Home", blog: "Blog" },
  pt: { home: "Início", blog: "Blog" },
  nl: { home: "Home", blog: "Blog" },
  pl: { home: "Start", blog: "Blog" },
  ru: { home: "Главная", blog: "Блог" },
  ar: { home: "الرئيسية", blog: "المدونة" },
  ja: { home: "ホーム", blog: "ブログ" },
  ko: { home: "홈", blog: "블로그" }
};

const audioLabels: Record<Language, string> = {
  en: "Band 8-9 sample flow",
  tr: "Band 8-9 örnek akış",
  de: "Band-8-9-Beispielfluss",
  es: "Flujo de muestra de banda 8-9",
  fr: "Exemple de réponse niveau 8-9",
  it: "Esempio fluido livello 8-9",
  pt: "Exemplo de fluxo banda 8-9",
  nl: "Voorbeeldverloop band 8-9",
  pl: "Przykładowa odpowiedź na poziomie 8-9",
  ru: "Пример ответа уровня 8-9",
  ar: "نموذج تدفق بدرجة 8-9",
  ja: "Band 8-9 の回答例",
  ko: "Band 8-9 예시 흐름"
};

const fallbackTopicLabels: Record<Language, string> = {
  en: "IELTS Speaking Topics",
  tr: "IELTS speaking konuları",
  de: "IELTS-Speaking-Themen",
  es: "Temas de IELTS speaking",
  fr: "Sujets IELTS speaking",
  it: "Argomenti IELTS speaking",
  pt: "Tópicos de IELTS speaking",
  nl: "IELTS-speakingonderwerpen",
  pl: "Tematy IELTS speaking",
  ru: "Темы IELTS speaking",
  ar: "موضوعات IELTS speaking",
  ja: "IELTS Speaking トピック",
  ko: "IELTS Speaking 주제"
};

const unlockFeedbackLabels: Record<Language, string> = {
  en: "Unlock full feedback",
  tr: "Tam geri bildirimi aç",
  de: "Vollständiges Feedback freischalten",
  es: "Desbloquear feedback completo",
  fr: "Débloquer le retour complet",
  it: "Sblocca il feedback completo",
  pt: "Desbloquear feedback completo",
  nl: "Volledige feedback ontgrendelen",
  pl: "Odblokuj pełny feedback",
  ru: "Открыть полный фидбек",
  ar: "افتح الملاحظات الكاملة",
  ja: "完全なフィードバックを開放",
  ko: "전체 피드백 열기"
};

const practiceCtaLabels: Record<
  Language,
  {
    part1Primary: string;
    part1Secondary: string;
    part1InlineTitle: string;
    part1InlineDescription: string;
    part2Primary: string;
    part2Secondary: string;
    part2InlineTitle: string;
    part2InlineDescription: string;
    part3Primary: string;
    part3Secondary: string;
    part3InlineTitle: string;
    part3InlineDescription: string;
    defaultPrimary: string;
    defaultSecondary: string;
    defaultInlineTitle: string;
    defaultInlineDescription: string;
  }
> = {
  en: {
    part1Primary: "Practice this Part 1 question now",
    part1Secondary: "More Part 1 questions",
    part1InlineTitle: "Practice this Part 1 topic with AI now",
    part1InlineDescription: "Give one short answer, see your score signal instantly, and retry the same Part 1 question with better fluency.",
    part2Primary: "Practice this Part 2 topic now",
    part2Secondary: "More Part 2 topics",
    part2InlineTitle: "Practice this topic with AI now",
    part2InlineDescription: "See your score first, then retry the same cue card with a stronger example and cleaner structure.",
    part3Primary: "Practice this Part 3 question now",
    part3Secondary: "More Part 3 questions",
    part3InlineTitle: "Practice this discussion question with AI",
    part3InlineDescription: "Develop your opinion, add reasons, then retry the same question with stronger logic.",
    defaultPrimary: "Practice this topic with AI now",
    defaultSecondary: "Free IELTS speaking test",
    defaultInlineTitle: "Turn this guide into practice now",
    defaultInlineDescription: "Give one answer, see your estimated score, and retry the same topic with clearer fluency and stronger structure."
  },
  tr: {
    part1Primary: "Bu Part 1 sorusunu şimdi dene",
    part1Secondary: "Daha fazla Part 1 sorusu",
    part1InlineTitle: "Bu Part 1 konusunu şimdi AI ile pratik yap",
    part1InlineDescription: "Kısa bir cevap ver, anında skor sinyali gör ve aynı Part 1 sorusunu daha akıcı şekilde tekrar dene.",
    part2Primary: "Bu Part 2 konusunu şimdi dene",
    part2Secondary: "Daha fazla Part 2 konusu",
    part2InlineTitle: "Bu konuyu şimdi AI ile pratik yap",
    part2InlineDescription: "Önce skorunu gör, sonra daha güçlü örnek ve daha net yapı ile aynı cue card'ı tekrar dene.",
    part3Primary: "Bu Part 3 sorusunu şimdi dene",
    part3Secondary: "Daha fazla Part 3 sorusu",
    part3InlineTitle: "Bu tartışma sorusunu AI ile pratik yap",
    part3InlineDescription: "Fikrini geliştir, neden ver, sonra aynı soruyu daha güçlü mantıkla yeniden söyle.",
    defaultPrimary: "Bu konuyu şimdi AI ile pratik yap",
    defaultSecondary: "Ücretsiz IELTS speaking testi",
    defaultInlineTitle: "Okuduğun konuyu şimdi dene",
    defaultInlineDescription: "Bir cevap ver, tahmini skorunu gör ve aynı konuyu daha net akıcılık ve yapı ile tekrar dene."
  },
  de: {
    part1Primary: "Diese Part-1-Frage jetzt üben",
    part1Secondary: "Mehr Part-1-Fragen",
    part1InlineTitle: "Dieses Part-1-Thema jetzt mit KI üben",
    part1InlineDescription: "Gib eine kurze Antwort, sieh sofort dein Score-Signal und versuche dieselbe Part-1-Frage flüssiger erneut.",
    part2Primary: "Dieses Part-2-Thema jetzt üben",
    part2Secondary: "Mehr Part-2-Themen",
    part2InlineTitle: "Dieses Thema jetzt mit KI üben",
    part2InlineDescription: "Sieh zuerst deinen Score und wiederhole dann dieselbe Cue Card mit stärkerem Beispiel und klarerer Struktur.",
    part3Primary: "Diese Part-3-Frage jetzt üben",
    part3Secondary: "Mehr Part-3-Fragen",
    part3InlineTitle: "Diese Diskussionsfrage mit KI üben",
    part3InlineDescription: "Entwickle deine Meinung weiter, füge Gründe hinzu und beantworte dieselbe Frage mit stärkerer Logik erneut.",
    defaultPrimary: "Dieses Thema jetzt mit KI üben",
    defaultSecondary: "Kostenloser IELTS-Speaking-Test",
    defaultInlineTitle: "Setze diesen Leitfaden jetzt in Praxis um",
    defaultInlineDescription: "Gib eine Antwort, sieh deine Schätzung und versuche das Thema mit klarerer Flüssigkeit und stärkerer Struktur erneut."
  },
  es: {
    part1Primary: "Practica ahora esta pregunta de Part 1",
    part1Secondary: "Más preguntas de Part 1",
    part1InlineTitle: "Practica ahora este tema de Part 1 con IA",
    part1InlineDescription: "Da una respuesta corta, ve tu señal de puntuación al instante y repite la misma pregunta con mejor fluidez.",
    part2Primary: "Practica ahora este tema de Part 2",
    part2Secondary: "Más temas de Part 2",
    part2InlineTitle: "Practica este tema con IA ahora",
    part2InlineDescription: "Mira tu puntuación primero y luego repite la misma cue card con un ejemplo más fuerte y una estructura más clara.",
    part3Primary: "Practica ahora esta pregunta de Part 3",
    part3Secondary: "Más preguntas de Part 3",
    part3InlineTitle: "Practica esta pregunta de discusión con IA",
    part3InlineDescription: "Desarrolla tu opinión, añade razones y repite la misma pregunta con una lógica más sólida.",
    defaultPrimary: "Practica este tema con IA ahora",
    defaultSecondary: "Prueba gratis de IELTS speaking",
    defaultInlineTitle: "Convierte esta guía en práctica ahora",
    defaultInlineDescription: "Da una respuesta, ve tu puntuación estimada y repite el mismo tema con más fluidez y mejor estructura."
  },
  fr: {
    part1Primary: "Travailler cette question de Part 1 maintenant",
    part1Secondary: "Plus de questions de Part 1",
    part1InlineTitle: "Travailler ce sujet de Part 1 avec l’IA",
    part1InlineDescription: "Donne une réponse courte, vois immédiatement ton signal de score et refais la même question avec une meilleure fluidité.",
    part2Primary: "Travailler ce sujet de Part 2 maintenant",
    part2Secondary: "Plus de sujets de Part 2",
    part2InlineTitle: "Travailler ce sujet avec l’IA maintenant",
    part2InlineDescription: "Vois d’abord ton score puis refais la même cue card avec un exemple plus fort et une structure plus nette.",
    part3Primary: "Travailler cette question de Part 3 maintenant",
    part3Secondary: "Plus de questions de Part 3",
    part3InlineTitle: "Travailler cette question de discussion avec l’IA",
    part3InlineDescription: "Développe ton opinion, ajoute des raisons, puis refais la même question avec une logique plus solide.",
    defaultPrimary: "Travailler ce sujet avec l’IA maintenant",
    defaultSecondary: "Test IELTS speaking gratuit",
    defaultInlineTitle: "Passe de ce guide à la pratique",
    defaultInlineDescription: "Donne une réponse, vois ton score estimé, puis recommence avec plus de fluidité et une meilleure structure."
  },
  it: {
    part1Primary: "Prova ora questa domanda di Part 1",
    part1Secondary: "Altre domande di Part 1",
    part1InlineTitle: "Allena ora questo tema di Part 1 con l’IA",
    part1InlineDescription: "Dai una risposta breve, guarda subito il tuo segnale di punteggio e riprova la stessa domanda con più fluidità.",
    part2Primary: "Prova ora questo tema di Part 2",
    part2Secondary: "Altri temi di Part 2",
    part2InlineTitle: "Allena questo tema con l’IA ora",
    part2InlineDescription: "Guarda prima il tuo punteggio, poi riprova la stessa cue card con un esempio più forte e una struttura più pulita.",
    part3Primary: "Prova ora questa domanda di Part 3",
    part3Secondary: "Altre domande di Part 3",
    part3InlineTitle: "Allena questa domanda di discussione con l’IA",
    part3InlineDescription: "Sviluppa la tua opinione, aggiungi motivi e riprova la stessa domanda con una logica più forte.",
    defaultPrimary: "Allena questo tema con l’IA ora",
    defaultSecondary: "Test IELTS speaking gratuito",
    defaultInlineTitle: "Trasforma questa guida in pratica",
    defaultInlineDescription: "Dai una risposta, guarda il punteggio stimato e riprova lo stesso tema con più fluidità e una struttura migliore."
  },
  pt: {
    part1Primary: "Pratique esta pergunta da Part 1 agora",
    part1Secondary: "Mais perguntas da Part 1",
    part1InlineTitle: "Pratique este tema da Part 1 com IA agora",
    part1InlineDescription: "Dê uma resposta curta, veja seu sinal de pontuação instantaneamente e refaça a mesma pergunta com mais fluidez.",
    part2Primary: "Pratique este tema da Part 2 agora",
    part2Secondary: "Mais temas da Part 2",
    part2InlineTitle: "Pratique este tema com IA agora",
    part2InlineDescription: "Veja sua pontuação primeiro e depois refaça o mesmo cue card com um exemplo mais forte e uma estrutura mais clara.",
    part3Primary: "Pratique esta pergunta da Part 3 agora",
    part3Secondary: "Mais perguntas da Part 3",
    part3InlineTitle: "Pratique esta pergunta de discussão com IA",
    part3InlineDescription: "Desenvolva sua opinião, adicione razões e refaça a mesma pergunta com uma lógica mais forte.",
    defaultPrimary: "Pratique este tema com IA agora",
    defaultSecondary: "Teste grátis de IELTS speaking",
    defaultInlineTitle: "Transforme este guia em prática agora",
    defaultInlineDescription: "Dê uma resposta, veja sua pontuação estimada e repita o mesmo tema com mais fluidez e estrutura melhor."
  },
  nl: {
    part1Primary: "Oefen deze Part 1-vraag nu",
    part1Secondary: "Meer Part 1-vragen",
    part1InlineTitle: "Oefen dit Part 1-onderwerp nu met AI",
    part1InlineDescription: "Geef een kort antwoord, zie direct je score-signaal en probeer dezelfde vraag opnieuw met betere vloeiendheid.",
    part2Primary: "Oefen dit Part 2-onderwerp nu",
    part2Secondary: "Meer Part 2-onderwerpen",
    part2InlineTitle: "Oefen dit onderwerp nu met AI",
    part2InlineDescription: "Bekijk eerst je score en probeer daarna dezelfde cue card opnieuw met een sterker voorbeeld en een duidelijkere structuur.",
    part3Primary: "Oefen deze Part 3-vraag nu",
    part3Secondary: "Meer Part 3-vragen",
    part3InlineTitle: "Oefen deze discussievraag met AI",
    part3InlineDescription: "Werk je mening verder uit, voeg redenen toe en beantwoord dezelfde vraag opnieuw met sterkere logica.",
    defaultPrimary: "Oefen dit onderwerp nu met AI",
    defaultSecondary: "Gratis IELTS-speakingtest",
    defaultInlineTitle: "Zet deze gids nu om in oefening",
    defaultInlineDescription: "Geef een antwoord, bekijk je geschatte score en probeer hetzelfde onderwerp opnieuw met duidelijkere vloeiendheid en sterkere structuur."
  },
  pl: {
    part1Primary: "Przećwicz teraz to pytanie z Part 1",
    part1Secondary: "Więcej pytań z Part 1",
    part1InlineTitle: "Przećwicz teraz ten temat Part 1 z AI",
    part1InlineDescription: "Udziel krótkiej odpowiedzi, od razu zobacz sygnał wyniku i powtórz to samo pytanie z lepszą płynnością.",
    part2Primary: "Przećwicz teraz ten temat z Part 2",
    part2Secondary: "Więcej tematów z Part 2",
    part2InlineTitle: "Przećwicz ten temat z AI teraz",
    part2InlineDescription: "Najpierw zobacz swój wynik, a potem powtórz tę samą cue card z mocniejszym przykładem i czystszą strukturą.",
    part3Primary: "Przećwicz teraz to pytanie z Part 3",
    part3Secondary: "Więcej pytań z Part 3",
    part3InlineTitle: "Przećwicz to pytanie dyskusyjne z AI",
    part3InlineDescription: "Rozwiń opinię, dodaj powody i odpowiedz ponownie z lepszą logiką.",
    defaultPrimary: "Przećwicz ten temat z AI teraz",
    defaultSecondary: "Bezpłatny test IELTS speaking",
    defaultInlineTitle: "Zamień ten poradnik w praktykę",
    defaultInlineDescription: "Udziel odpowiedzi, zobacz szacowany wynik i powtórz ten sam temat z większą płynnością i lepszą strukturą."
  },
  ru: {
    part1Primary: "Попрактиковать этот вопрос Part 1",
    part1Secondary: "Больше вопросов Part 1",
    part1InlineTitle: "Потренировать эту тему Part 1 с ИИ",
    part1InlineDescription: "Дайте короткий ответ, сразу увидьте сигнал оценки и повторите тот же вопрос с лучшей беглостью.",
    part2Primary: "Попрактиковать эту тему Part 2",
    part2Secondary: "Больше тем Part 2",
    part2InlineTitle: "Потренировать эту тему с ИИ",
    part2InlineDescription: "Сначала посмотрите свой балл, затем повторите ту же cue card с более сильным примером и более чистой структурой.",
    part3Primary: "Попрактиковать этот вопрос Part 3",
    part3Secondary: "Больше вопросов Part 3",
    part3InlineTitle: "Потренировать этот вопрос для обсуждения с ИИ",
    part3InlineDescription: "Развивайте мнение, добавляйте причины и повторяйте тот же вопрос с более сильной логикой.",
    defaultPrimary: "Потренировать эту тему с ИИ",
    defaultSecondary: "Бесплатный тест IELTS speaking",
    defaultInlineTitle: "Превратите этот гайд в практику",
    defaultInlineDescription: "Дайте ответ, посмотрите примерный балл и повторите тему с большей беглостью и более сильной структурой."
  },
  ar: {
    part1Primary: "تدرّب الآن على سؤال Part 1 هذا",
    part1Secondary: "المزيد من أسئلة Part 1",
    part1InlineTitle: "تدرّب الآن على موضوع Part 1 هذا بالذكاء الاصطناعي",
    part1InlineDescription: "قدّم إجابة قصيرة، وشاهد إشارة الدرجة فورًا، ثم أعد السؤال نفسه بطلاقة أفضل.",
    part2Primary: "تدرّب الآن على موضوع Part 2 هذا",
    part2Secondary: "المزيد من موضوعات Part 2",
    part2InlineTitle: "تدرّب على هذا الموضوع بالذكاء الاصطناعي الآن",
    part2InlineDescription: "شاهد درجتك أولًا، ثم أعد بطاقة cue card نفسها بمثال أقوى وبنية أوضح.",
    part3Primary: "تدرّب الآن على سؤال Part 3 هذا",
    part3Secondary: "المزيد من أسئلة Part 3",
    part3InlineTitle: "تدرّب على سؤال النقاش هذا بالذكاء الاصطناعي",
    part3InlineDescription: "طوّر رأيك، وأضف أسبابًا، ثم أجب عن السؤال نفسه بمنطق أقوى.",
    defaultPrimary: "تدرّب على هذا الموضوع بالذكاء الاصطناعي الآن",
    defaultSecondary: "اختبار IELTS speaking مجاني",
    defaultInlineTitle: "حوّل هذا الدليل إلى تدريب الآن",
    defaultInlineDescription: "قدّم إجابة، وشاهد درجتك التقديرية، ثم أعد الموضوع نفسه بطلاقة أوضح وبنية أقوى."
  },
  ja: {
    part1Primary: "この Part 1 の質問を今すぐ練習",
    part1Secondary: "Part 1 の質問をもっと見る",
    part1InlineTitle: "この Part 1 テーマを AI で練習",
    part1InlineDescription: "短く答えてすぐにスコアの兆候を確認し、同じ質問により流暢に答え直しましょう。",
    part2Primary: "この Part 2 テーマを今すぐ練習",
    part2Secondary: "Part 2 のテーマをもっと見る",
    part2InlineTitle: "このテーマを AI で今すぐ練習",
    part2InlineDescription: "まずスコアを見てから、同じ cue card をより強い例と明確な構成でやり直しましょう。",
    part3Primary: "この Part 3 の質問を今すぐ練習",
    part3Secondary: "Part 3 の質問をもっと見る",
    part3InlineTitle: "このディスカッション質問を AI で練習",
    part3InlineDescription: "意見を広げ、理由を加え、同じ質問により強い論理で答え直しましょう。",
    defaultPrimary: "このテーマを AI で今すぐ練習",
    defaultSecondary: "無料 IELTS speaking テスト",
    defaultInlineTitle: "このガイドを今すぐ練習に変える",
    defaultInlineDescription: "1 回答えて推定スコアを確認し、同じテーマでもっと流暢に、より良い構成で再挑戦しましょう。"
  },
  ko: {
    part1Primary: "이 Part 1 질문을 지금 연습하세요",
    part1Secondary: "더 많은 Part 1 질문",
    part1InlineTitle: "이 Part 1 주제를 AI로 연습하세요",
    part1InlineDescription: "짧게 답하고 즉시 점수 신호를 확인한 뒤, 같은 질문에 더 유창하게 다시 답해 보세요.",
    part2Primary: "이 Part 2 주제를 지금 연습하세요",
    part2Secondary: "더 많은 Part 2 주제",
    part2InlineTitle: "이 주제를 AI로 지금 연습하세요",
    part2InlineDescription: "먼저 점수를 확인한 다음, 같은 cue card를 더 강한 예시와 더 깔끔한 구조로 다시 시도해 보세요.",
    part3Primary: "이 Part 3 질문을 지금 연습하세요",
    part3Secondary: "더 많은 Part 3 질문",
    part3InlineTitle: "이 토론 질문을 AI로 연습하세요",
    part3InlineDescription: "의견을 발전시키고 이유를 더한 뒤, 같은 질문에 더 강한 논리로 다시 답해 보세요.",
    defaultPrimary: "이 주제를 AI로 지금 연습하세요",
    defaultSecondary: "무료 IELTS speaking 테스트",
    defaultInlineTitle: "이 가이드를 바로 연습으로 바꾸세요",
    defaultInlineDescription: "한 번 답하고 예상 점수를 확인한 뒤, 같은 주제를 더 나은 유창성과 더 강한 구조로 다시 시도해 보세요."
  }
};

function getBlogPracticeCta(input: { slug: string; title: string; language: Language }) {
  const source = `${input.slug} ${input.title}`.toLowerCase();
  const labels = practiceCtaLabels[input.language] ?? practiceCtaLabels.en;

  if (source.includes("part-1")) {
    return {
      href: "/app/practice?examType=IELTS&taskType=ielts-part-1&quickStart=1",
      secondaryHref: "/ielts-speaking-part-1-questions",
      primaryLabel: labels.part1Primary,
      secondaryLabel: labels.part1Secondary,
      inlineTitle: labels.part1InlineTitle,
      inlineDescription: labels.part1InlineDescription
    };
  }

  if (source.includes("part-2") || source.includes("cue card") || source.includes("hometown")) {
    return {
      href: "/app/practice?examType=IELTS&taskType=ielts-part-2&quickStart=1",
      secondaryHref: "/ielts-speaking-part-2-topics",
      primaryLabel: labels.part2Primary,
      secondaryLabel: labels.part2Secondary,
      inlineTitle: labels.part2InlineTitle,
      inlineDescription: labels.part2InlineDescription
    };
  }

  if (source.includes("part-3")) {
    return {
      href: "/app/practice?examType=IELTS&taskType=ielts-part-3&quickStart=1",
      secondaryHref: "/ielts-speaking-part-3-questions",
      primaryLabel: labels.part3Primary,
      secondaryLabel: labels.part3Secondary,
      inlineTitle: labels.part3InlineTitle,
      inlineDescription: labels.part3InlineDescription
    };
  }

  return {
    href: "/app/practice?quickStart=1",
    secondaryHref: "/free-ielts-speaking-test",
    primaryLabel: labels.defaultPrimary,
    secondaryLabel: labels.defaultSecondary,
    inlineTitle: labels.defaultInlineTitle,
    inlineDescription: labels.defaultInlineDescription
  };
}
