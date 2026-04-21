export type SeoGrowthEntry = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  bullets: string[];
  cta: string;
  actionLabel?: string;
};

export const comparisonPages: SeoGrowthEntry[] = [
  {
    slug: "speakace-vs-elsa-speak",
    title: "SpeakAce vs ELSA Speak",
    description: "Compare SpeakAce vs ELSA Speak for IELTS speaking practice, transcript review, and exam-focused score improvement.",
    intro: "ELSA is strong for pronunciation-focused speaking practice, while SpeakAce is built more directly around IELTS and TOEFL test-style response improvement.",
    bullets: [
      "SpeakAce puts transcript review and retry loops closer to the center.",
      "IELTS task flow is easier to map inside SpeakAce than in a generic speaking app.",
      "Schools and teachers have a clearer class-management layer inside SpeakAce."
    ],
    cta: "Try a free IELTS-style speaking session and compare the workflow yourself."
  },
  {
    slug: "speakace-vs-talkpal",
    title: "SpeakAce vs Talkpal",
    description: "Compare SpeakAce vs Talkpal for AI English speaking practice, IELTS preparation, and speaking feedback.",
    intro: "Talkpal is useful for broader conversational practice, but SpeakAce is more exam-shaped for learners who care about IELTS speaking structure and score movement.",
    bullets: [
      "SpeakAce is more targeted for speaking-test preparation.",
      "The product is stronger when the user wants transcript-based exam practice.",
      "Teacher and institution workflows are more explicit inside SpeakAce."
    ],
    cta: "Open the free IELTS speaking test page and see how the practice flow feels."
  },
  {
    slug: "speakace-vs-smalltalk2me",
    title: "SpeakAce vs SmallTalk2Me",
    description: "See how SpeakAce compares with SmallTalk2Me for IELTS speaking, confidence building, and retry-based feedback.",
    intro: "Both products help learners practice speaking with AI, but SpeakAce leans more into repeatable IELTS and TOEFL improvement loops.",
    bullets: [
      "SpeakAce gives a stronger record-review-retry habit structure.",
      "The app is easier to position for schools and teachers.",
      "Topic pages and resource hubs help learners enter through search and convert to practice."
    ],
    cta: "Start with a free prompt, then decide if the exam focus matches your needs."
  },
  {
    slug: "best-ielts-speaking-app",
    title: "Best IELTS Speaking App",
    description: "Find the best IELTS speaking app for transcript review, AI feedback, and score-focused daily practice.",
    intro: "The best IELTS speaking app is not simply the one with AI. It is the one that helps you repeat the right tasks often enough to improve structure, fluency, and confidence.",
    bullets: [
      "Look for IELTS-style tasks instead of generic chat.",
      "Fast transcript review makes weak habits visible sooner.",
      "A daily habit loop matters more than a single impressive feature."
    ],
    cta: "Try SpeakAce as a free IELTS speaking app before deciding to upgrade."
  },
  {
    slug: "best-ai-speaking-practice-tool",
    title: "Best AI Speaking Practice Tool",
    description: "Compare what makes the best AI speaking practice tool for IELTS students, self-study learners, and teachers.",
    intro: "A useful AI speaking practice tool should help learners do more than talk. It should help them notice weak answers, fix them, and come back the next day.",
    bullets: [
      "Look for a stronger feedback loop, not only AI conversation.",
      "The best tools support real study routines and measurable progress.",
      "Exam-specific products often outperform generic speaking bots for test prep."
    ],
    cta: "Use SpeakAce if your goal is daily score-focused speaking practice."
  },
  {
    slug: "ielts-speaking-platform-for-schools",
    title: "IELTS Speaking Platform for Schools",
    description: "See what schools should look for in an IELTS speaking platform with dashboards, assignments, and AI feedback.",
    intro: "Schools need more than a student-facing speaking app. They need reporting, class workflows, and a system that supports progress between lessons.",
    bullets: [
      "Teacher review, class codes, homework, and analytics matter.",
      "Students need enough self-study structure to keep practicing outside class.",
      "A platform becomes more sellable when both B2C and B2B use cases work."
    ],
    cta: "Open the teacher demo page to see how SpeakAce supports class workflows."
  }
];

export const toolPages: SeoGrowthEntry[] = [
  {
    slug: "ielts-band-score-calculator",
    title: "IELTS Band Score Calculator",
    description: "Use this IELTS band score calculator guide to understand how speaking performance can move toward a higher score.",
    intro: "A speaking calculator page attracts strong search intent because students want a simple answer: what might this response score and how do I improve it?",
    bullets: [
      "Band prediction becomes more useful when paired with transcript review.",
      "Students usually need one next step, not only a score.",
      "The fastest improvement comes from score estimate plus retry."
    ],
    cta: "Practice one answer in SpeakAce and see an estimated score with improvement guidance.",
    actionLabel: "Calculate score"
  },
  {
    slug: "ielts-cue-card-generator",
    title: "IELTS Cue Card Generator",
    description: "Get IELTS cue card practice ideas, stronger Part 2 prompts, and a simple way to turn them into speaking practice.",
    intro: "Cue card pages work well because many learners search for fresh Part 2 topics and stronger prompts to practice with every day.",
    bullets: [
      "Good cue cards are easier to answer when the structure is simple.",
      "Part 2 improves quickly when you combine notes, transcript review, and retry.",
      "A generator page can pull search traffic and convert to active practice."
    ],
    cta: "Open the Part 2 topic hub and turn a cue card into a real speaking attempt.",
    actionLabel: "Generate cue card"
  },
  {
    slug: "ielts-part-1-question-generator",
    title: "IELTS Part 1 Question Generator",
    description: "Explore IELTS Part 1 question ideas and use them as a simple daily fluency drill.",
    intro: "Part 1 is one of the easiest places to build confidence because the answers are short, repeatable, and ideal for daily practice.",
    bullets: [
      "Short questions reduce the friction of starting.",
      "Part 1 is perfect for consistency and natural opening sentences.",
      "A simple question generator helps learners come back more often."
    ],
    cta: "Open Part 1 questions and start a short daily speaking drill.",
    actionLabel: "Generate questions"
  },
  {
    slug: "ielts-follow-up-question-generator",
    title: "IELTS Follow-up Question Generator",
    description: "Generate stronger follow-up question practice for IELTS Speaking Part 3 and discussion-style answers.",
    intro: "Follow-up questions are useful because they help learners move beyond simple opinions into more developed Part 3 answers.",
    bullets: [
      "Part 3 needs deeper examples and clearer logic.",
      "Follow-up style practice helps learners think under pressure.",
      "A question generator can turn blog traffic into real exam prep."
    ],
    cta: "Open the Part 3 question guide and practice with a stronger answer structure.",
    actionLabel: "Generate follow-ups"
  },
  {
    slug: "english-speaking-topic-generator",
    title: "English Speaking Topic Generator",
    description: "Use an English speaking topic generator to find daily ideas for IELTS-style practice and confidence building.",
    intro: "Topic generators are strong top-of-funnel pages because many visitors are not ready to buy yet, but they are ready to try one prompt.",
    bullets: [
      "Low-friction prompts increase the chance of first practice.",
      "Topic hubs work well for organic discovery.",
      "Daily prompt content creates a return habit."
    ],
    cta: "Open the IELTS topic hub and pick one prompt for today.",
    actionLabel: "Generate topic"
  },
  {
    slug: "ielts-study-plan-generator",
    title: "IELTS Study Plan Generator",
    description: "Build an IELTS speaking study plan with daily prompts, challenge-style repetition, and transcript review.",
    intro: "Study plan pages convert because they help visitors organize effort before they trust a product enough to pay.",
    bullets: [
      "A short routine beats irregular long sessions.",
      "The best study plans include repeat attempts, not only new questions.",
      "A daily minutes goal makes habit formation easier."
    ],
    cta: "Use the onboarding flow and weekly challenge to build a stronger speaking plan.",
    actionLabel: "Build plan"
  }
];

export const guidePages: SeoGrowthEntry[] = [
  {
    slug: "ielts-speaking-band-6-to-7",
    title: "IELTS Speaking Band 6 to 7",
    description: "Practical guidance to move IELTS speaking from band 6 to band 7 with cleaner structure and stronger examples.",
    intro: "The jump from band 6 to 7 usually comes from cleaner response control rather than dramatic vocabulary changes.",
    bullets: [
      "More direct answers matter.",
      "Examples should support the point instead of replacing it.",
      "Retrying the same prompt often reveals the fastest path to improvement."
    ],
    cta: "Practice one answer, check the transcript, and retry with a stronger structure."
  },
  {
    slug: "improve-ielts-speaking-pronunciation",
    title: "Improve IELTS Speaking Pronunciation",
    description: "Learn how to improve IELTS speaking pronunciation with clearer stress, rhythm, and daily focused drills.",
    intro: "Pronunciation gets easier to improve when the learner slows down slightly and focuses on clarity rather than sounding advanced.",
    bullets: [
      "Word endings matter more than many learners expect.",
      "Stress and rhythm often improve before accent changes do.",
      "Short focused drills are usually better than long forced answers."
    ],
    cta: "Use SpeakAce pronunciation mode for more focused clarity work."
  },
  {
    slug: "how-to-reduce-pauses-in-ielts-speaking",
    title: "How to Reduce Pauses in IELTS Speaking",
    description: "Reduce long pauses in IELTS speaking with easier answer frameworks and more repeat-based speaking practice.",
    intro: "Most long pauses come from idea planning problems, not from a total lack of English ability.",
    bullets: [
      "Simple answer shapes reduce hesitation.",
      "Part 1 and weekly challenge drills are good for pause reduction.",
      "Transcript review helps learners spot where the answer broke down."
    ],
    cta: "Use daily prompt practice to make your speaking flow more automatic."
  },
  {
    slug: "ielts-speaking-answer-structure",
    title: "IELTS Speaking Answer Structure",
    description: "Build better IELTS speaking answer structure for Part 1, Part 2, and Part 3 with repeatable frameworks.",
    intro: "A strong answer often sounds easier because the structure is doing more of the work.",
    bullets: [
      "Part 1 needs directness.",
      "Part 2 needs a simple story arc.",
      "Part 3 needs a clear point plus one reason or example."
    ],
    cta: "Use transcript review to see whether your answer shape feels clear."
  },
  {
    slug: "ielts-speaking-fluency-tips",
    title: "IELTS Speaking Fluency Tips",
    description: "Use practical IELTS speaking fluency tips to sound more connected, less hesitant, and more natural.",
    intro: "Fluency improves when learners stop chasing perfect sentences and start aiming for steady, understandable flow.",
    bullets: [
      "Natural linking is stronger than memorized connectors.",
      "Repeated topic practice builds fluency faster than random topics.",
      "Short daily speaking is better than occasional intense practice."
    ],
    cta: "Use the weekly challenge and Part 1 practice to build steadier fluency."
  },
  {
    slug: "ielts-speaking-vocabulary-tips",
    title: "IELTS Speaking Vocabulary Tips",
    description: "Improve IELTS speaking vocabulary by replacing repeated words with clearer, more natural topic language.",
    intro: "Better vocabulary in speaking is usually about precision, not about sounding complicated.",
    bullets: [
      "One stronger word can change the quality of an answer.",
      "Topic-specific expressions are often more useful than advanced synonyms.",
      "Transcript review helps learners catch repeated words quickly."
    ],
    cta: "Check your transcript after each attempt and replace one weak repeated word."
  }
];

const extraComparisonPages: SeoGrowthEntry[] = [
  {
    slug: "speakace-vs-loora",
    title: "SpeakAce vs Loora",
    description: "Compare SpeakAce vs Loora for IELTS-style speaking practice, transcript feedback, and score-focused repetition.",
    intro: "Loora is useful for conversational speaking, but SpeakAce is more exam-shaped for students who want a score-focused daily workflow.",
    bullets: [
      "SpeakAce keeps the transcript and retry loop closer to exam preparation.",
      "The product is stronger when the learner wants IELTS and TOEFL structure instead of free conversation.",
      "Teacher and school workflows make SpeakAce easier to position for classes."
    ],
    cta: "Open a free speaking session and compare the learning loop yourself."
  },
  {
    slug: "speakace-vs-speak-app",
    title: "SpeakAce vs Speak App",
    description: "See how SpeakAce compares with Speak for IELTS speaking practice, feedback loops, and exam-style confidence building.",
    intro: "Speak is strong for conversational repetition, while SpeakAce is more directly organized around speaking-test preparation.",
    bullets: [
      "SpeakAce is easier to use when exam task types matter.",
      "Transcript review, sample answers, and retry logic are more score-oriented.",
      "Schools can use homework and reporting more explicitly."
    ],
    cta: "Use one free task and see whether exam focus matters more for your preparation."
  },
  {
    slug: "speakace-vs-chatgpt-for-ielts-speaking",
    title: "SpeakAce vs ChatGPT for IELTS Speaking",
    description: "Compare SpeakAce with ChatGPT for IELTS speaking practice, test simulation, and transcript-based improvement.",
    intro: "ChatGPT is flexible, but a dedicated speaking product can reduce setup friction and create a more repeatable test-prep loop.",
    bullets: [
      "SpeakAce removes prompt-writing friction for students.",
      "The product keeps test timing, transcript review, and retry structure in one place.",
      "Exam-focused UX often leads to more consistent daily use than a blank chat interface."
    ],
    cta: "Try one structured speaking flow before deciding if you need a general AI chat or a focused practice product."
  },
  {
    slug: "speakace-vs-testglider-speaking",
    title: "SpeakAce vs TestGlider Speaking",
    description: "Compare SpeakAce vs TestGlider for IELTS speaking simulation, practice frequency, and speaking feedback.",
    intro: "TestGlider is useful for broader test prep, while SpeakAce goes deeper into repeated speaking attempts, retries, and ongoing student practice.",
    bullets: [
      "SpeakAce is stronger when the goal is frequent speaking repetition.",
      "Topic hubs and tools create more top-of-funnel entry points for learners.",
      "Teacher workflows are easier to integrate into small-group course models."
    ],
    cta: "Use the free speaking test and see if the practice loop fits your style better."
  },
  {
    slug: "speakace-vs-cambly-for-speaking-practice",
    title: "SpeakAce vs Cambly for Speaking Practice",
    description: "Compare SpeakAce vs Cambly for IELTS speaking practice, feedback speed, and cost-efficient daily speaking repetition.",
    intro: "Cambly gives live tutoring, but SpeakAce is built for cheaper daily repetition, transcript review, and retry-based improvement between lessons.",
    bullets: [
      "AI practice is cheaper and easier to repeat every day.",
      "Transcript review helps learners carry feedback into the next attempt immediately.",
      "A mixed tutor + AI workflow often works better than tutor-only practice."
    ],
    cta: "Use SpeakAce for daily repetition and save human sessions for bigger corrections."
  },
  {
    slug: "best-ielts-speaking-platform-for-self-study",
    title: "Best IELTS Speaking Platform for Self Study",
    description: "Find what makes the best IELTS speaking platform for self-study learners who want faster feedback and less friction.",
    intro: "Self-study learners need a product that creates structure without adding complexity. The best platform is the one that gets them practicing again tomorrow.",
    bullets: [
      "Fast setup matters more than feature quantity.",
      "Clear score signals and retry guidance reduce wasted effort.",
      "Topic hubs, sample answers, and daily prompts support consistency."
    ],
    cta: "Try SpeakAce if you want a self-study speaking routine that feels repeatable."
  },
  {
    slug: "best-toefl-speaking-practice-platform",
    title: "Best TOEFL Speaking Practice Platform",
    description: "Compare what makes the best TOEFL speaking practice platform for integrated tasks, timing, and transcript review.",
    intro: "The best TOEFL speaking platform should help learners organize source material, speak under time pressure, and retry weak integrated answers.",
    bullets: [
      "Integrated task support matters more than generic speaking prompts.",
      "A transcript can reveal where summary logic breaks down.",
      "A stable retry loop helps learners improve source-transfer skill much faster."
    ],
    cta: "Open TOEFL speaking practice and see how the structure feels in SpeakAce."
  },
  {
    slug: "best-ai-speaking-tool-for-language-schools",
    title: "Best AI Speaking Tool for Language Schools",
    description: "See what language schools should look for in an AI speaking tool with classes, homework, analytics, and student practice tracking.",
    intro: "Schools need more than a learner-facing app. They need reporting, assignments, reminders, and a clear way to keep speaking active between lessons.",
    bullets: [
      "Analytics and homework matter as much as AI scoring.",
      "Approval flows and study lists help schools operationalize the product.",
      "A product becomes more valuable when students and teachers both use it regularly."
    ],
    cta: "Open the teacher and school pages to see how SpeakAce fits class workflows."
  }
];

const extraToolPages: SeoGrowthEntry[] = [
  {
    slug: "ielts-speaking-opening-generator",
    title: "IELTS Speaking Opening Generator",
    description: "Generate cleaner IELTS speaking openings so your answers start more naturally and with less hesitation.",
    intro: "Openings matter because the first sentence often controls the pace of the whole answer.",
    bullets: [
      "A cleaner first sentence reduces panic.",
      "Openings should sound direct, not memorized.",
      "Daily opening drills build confidence faster than random practice."
    ],
    cta: "Use one prompt inside SpeakAce and train your first sentence.",
    actionLabel: "Generate opening"
  },
  {
    slug: "ielts-speaking-idea-generator",
    title: "IELTS Speaking Idea Generator",
    description: "Find IELTS speaking answer ideas faster when you feel blocked or slow to start.",
    intro: "Many learners do not struggle with English first. They struggle with finding a usable idea quickly.",
    bullets: [
      "Simple idea generation reduces long pauses.",
      "Better idea planning often improves fluency more than vocabulary does.",
      "Topic pages work best when paired with a real answer attempt."
    ],
    cta: "Open a topic page and turn one idea into a timed answer.",
    actionLabel: "Generate ideas"
  },
  {
    slug: "ielts-speaking-follow-up-answer-builder",
    title: "IELTS Speaking Follow-up Answer Builder",
    description: "Build stronger follow-up answers for IELTS Speaking Part 3 with clear reasons and examples.",
    intro: "Part 3 feels hard because learners often answer too briefly or without a supporting example.",
    bullets: [
      "One opinion plus one reason is a strong starting shape.",
      "A short supporting example usually beats a vague longer answer.",
      "Repeated follow-up practice improves thinking speed under pressure."
    ],
    cta: "Use a Part 3 page and turn it into a cleaner discussion answer.",
    actionLabel: "Build follow-up"
  },
  {
    slug: "ielts-speaking-topic-of-the-day",
    title: "IELTS Speaking Topic of the Day",
    description: "Use a fresh IELTS speaking topic of the day to create a simple habit and speak every day.",
    intro: "A daily topic gives learners one easy decision: open the prompt and record one answer.",
    bullets: [
      "Daily prompts reduce friction.",
      "Small practice loops are easier to maintain than large study plans.",
      "One topic a day can quietly create a strong speaking habit."
    ],
    cta: "Open the daily prompt page and keep your speaking streak alive.",
    actionLabel: "Open daily topic"
  },
  {
    slug: "ielts-speaking-checklist-generator",
    title: "IELTS Speaking Checklist Generator",
    description: "Create a speaking checklist you can use before every IELTS answer to sound more organized and complete.",
    intro: "Checklists work because they turn improvement into a small repeatable system instead of a vague promise to 'speak better.'",
    bullets: [
      "A checklist reduces random mistakes.",
      "It is easier to repeat a framework than to improvise under pressure.",
      "Good checklists improve confidence because they narrow the focus."
    ],
    cta: "Use SpeakAce with a short checklist and compare your next answer.",
    actionLabel: "Build checklist"
  },
  {
    slug: "ielts-speaking-transition-phrase-builder",
    title: "IELTS Speaking Transition Phrase Builder",
    description: "Build simpler transition phrases for IELTS speaking so your answers sound smoother but not memorized.",
    intro: "Transition phrases should help the listener follow the answer, not make the speaker sound scripted.",
    bullets: [
      "Natural linking beats long memorized connector lists.",
      "Short transitions are easier to use in real-time speaking.",
      "A cleaner answer rhythm often follows better transitions."
    ],
    cta: "Use one short set of natural transitions in your next answer.",
    actionLabel: "Build transitions"
  },
  {
    slug: "ielts-speaking-mock-schedule-builder",
    title: "IELTS Speaking Mock Schedule Builder",
    description: "Build a weekly IELTS speaking mock schedule with easy repetition and review blocks.",
    intro: "Many students practice too randomly. A schedule page creates structure before the user commits to a full paid plan.",
    bullets: [
      "A good schedule includes repeat attempts, not only new tasks.",
      "Short review blocks are as important as new recordings.",
      "Mock rhythm matters more when the exam date is close."
    ],
    cta: "Use onboarding, study lists, and weekly challenge to structure your next week.",
    actionLabel: "Build schedule"
  },
  {
    slug: "toefl-speaking-note-template",
    title: "TOEFL Speaking Note Template",
    description: "Use a simple TOEFL speaking note template to organize integrated task answers faster and more clearly.",
    intro: "TOEFL speaking often feels chaotic because note-taking is too loose. A small structure fixes that quickly.",
    bullets: [
      "Main point plus support notes are usually enough.",
      "The best template is short enough to use under time pressure.",
      "Clearer notes often lead to calmer delivery."
    ],
    cta: "Practice one TOEFL task and use a clearer note structure.",
    actionLabel: "Open template"
  }
];

const extraGuidePages: SeoGrowthEntry[] = [
  {
    slug: "ielts-speaking-common-mistakes",
    title: "IELTS Speaking Common Mistakes",
    description: "See the most common IELTS speaking mistakes that keep otherwise good students stuck at the same band score.",
    intro: "Students usually repeat a small set of habits: weak openings, rushed structure, vague examples, and repeated filler language.",
    bullets: [
      "Most mistakes are pattern mistakes, not intelligence problems.",
      "Transcript review is the fastest way to spot repeated habits.",
      "One corrected habit can improve multiple future answers."
    ],
    cta: "Review one transcript today and fix just one repeated speaking pattern."
  },
  {
    slug: "ielts-speaking-part-2-ideas",
    title: "IELTS Speaking Part 2 Ideas",
    description: "Learn how to find IELTS Speaking Part 2 ideas faster and turn them into stronger stories with less hesitation.",
    intro: "Part 2 gets easier when the learner stops chasing a perfect story and starts building one simple, believable example.",
    bullets: [
      "One clear memory usually beats several weak ideas.",
      "Simple timelines help the answer feel more organized.",
      "A cleaner story arc often improves fluency too."
    ],
    cta: "Open a cue card and build a shorter, clearer Part 2 plan."
  },
  {
    slug: "ielts-speaking-part-3-examples",
    title: "IELTS Speaking Part 3 Examples",
    description: "Use Part 3 examples better so your IELTS discussion answers sound deeper and more complete.",
    intro: "Part 3 answers improve quickly when the speaker adds one reason and one usable example instead of speaking in general terms.",
    bullets: [
      "Examples make opinions easier to trust.",
      "A short example is enough if it supports the point clearly.",
      "Good examples reduce the feeling of emptiness in longer answers."
    ],
    cta: "Use one Part 3 question and add a cleaner supporting example."
  },
  {
    slug: "how-to-sound-natural-in-ielts-speaking",
    title: "How to Sound Natural in IELTS Speaking",
    description: "Sound more natural in IELTS speaking with steadier rhythm, simpler linking, and less scripted language.",
    intro: "Natural speaking rarely sounds fancy. It usually sounds clear, steady, and easy to follow.",
    bullets: [
      "Simple language often sounds more natural than forced advanced language.",
      "Memorized templates can make good English sound unnatural.",
      "Recording yourself helps you hear what feels scripted."
    ],
    cta: "Record one answer and compare it with a more natural improved version."
  },
  {
    slug: "ielts-speaking-part-1-tips",
    title: "IELTS Speaking Part 1 Tips",
    description: "Use practical IELTS Speaking Part 1 tips to answer faster, more directly, and with cleaner openings.",
    intro: "Part 1 is one of the best places to improve quickly because the answers are short, direct, and easy to repeat.",
    bullets: [
      "Direct answers create better first impressions.",
      "One small reason is often enough in Part 1.",
      "Part 1 practice is ideal for building confidence every day."
    ],
    cta: "Use Part 1 prompts as your low-friction daily speaking warm-up."
  },
  {
    slug: "toefl-speaking-integrated-tips",
    title: "TOEFL Speaking Integrated Tips",
    description: "Improve TOEFL integrated speaking with cleaner note transfer, stronger summaries, and calmer timing control.",
    intro: "Integrated speaking gets easier when the learner simplifies what to carry from the source instead of trying to repeat everything.",
    bullets: [
      "Main point plus one support detail is often enough.",
      "Timing pressure becomes easier when note structure is simple.",
      "Retrying the same task reveals summary problems quickly."
    ],
    cta: "Try one TOEFL integrated task and focus on a cleaner summary structure."
  },
  {
    slug: "ielts-speaking-self-study-plan",
    title: "IELTS Speaking Self Study Plan",
    description: "Build an IELTS speaking self-study plan that is realistic, repeatable, and focused on score growth.",
    intro: "A good self-study plan is short enough to repeat and strong enough to improve fluency, examples, and confidence over time.",
    bullets: [
      "Short daily speaking beats occasional heavy study.",
      "Study plans should mix new prompts with repeat prompts.",
      "Feedback review is part of practice, not separate from it."
    ],
    cta: "Use SpeakAce to turn a simple self-study plan into daily speaking action."
  },
  {
    slug: "ielts-speaking-exam-day-tips",
    title: "IELTS Speaking Exam Day Tips",
    description: "Use simple IELTS speaking exam day tips to stay calmer, start faster, and keep better control over your answers.",
    intro: "Exam day performance improves when the student has already repeated a familiar practice loop enough times to trust it.",
    bullets: [
      "Calm starts matter more than perfect starts.",
      "A direct first sentence can lower nerves quickly.",
      "The best exam-day confidence comes from repeated realistic practice."
    ],
    cta: "Use a mock session this week so exam-day pressure feels less new."
  }
];

comparisonPages.push(...extraComparisonPages);
toolPages.push(...extraToolPages);
guidePages.push(...extraGuidePages);

comparisonPages.push(
  {
    slug: "best-ielts-speaking-ai-for-beginners",
    title: "Best IELTS Speaking AI for Beginners",
    description: "Find what makes the best IELTS speaking AI for beginners who need simpler structure and lower-pressure practice.",
    intro: "Beginners need a speaking product that lowers friction instead of raising it. Simpler task entry and clearer feedback usually matter most.",
    bullets: [
      "The best product is easy to start even on a low-energy day.",
      "Transcript review helps beginners understand what they actually said.",
      "Small daily loops are more useful than heavy one-time practice."
    ],
    cta: "Use the free test and daily prompt pages if you want an easier first step."
  },
  {
    slug: "speakace-vs-ielteasy-speaking",
    title: "SpeakAce vs IELTS-specific Speaking Tools",
    description: "Compare SpeakAce with more niche IELTS-specific speaking tools for structure, retries, and daily use.",
    intro: "Niche products win when they remove setup friction and guide the learner into the right task quickly.",
    bullets: [
      "Task clarity improves consistency.",
      "Retry loops often matter more than one-off model answers.",
      "A stronger content ecosystem helps search visitors become users."
    ],
    cta: "Open a real task inside SpeakAce and compare the daily flow yourself."
  }
);

toolPages.push(
  {
    slug: "ielts-speaking-answer-checker",
    title: "IELTS Speaking Answer Checker",
    description: "Use a simple IELTS speaking answer checker workflow to spot structure, clarity, and repetition issues faster.",
    intro: "Many learners search for an answer checker because they want a quick signal before they commit to deeper practice.",
    bullets: [
      "A checker is more useful when it points to one next action.",
      "Transcript review turns a generic checker into a learning loop.",
      "Short answer-check pages are strong top-of-funnel assets."
    ],
    cta: "Run one answer through SpeakAce and see the transcript plus feedback.",
    actionLabel: "Check answer"
  },
  {
    slug: "ielts-speaking-daily-goal-builder",
    title: "IELTS Speaking Daily Goal Builder",
    description: "Build a small daily IELTS speaking goal that is realistic enough to repeat and strong enough to improve fluency.",
    intro: "Daily goal pages work because most students need a smaller commitment, not a larger promise.",
    bullets: [
      "A 10 to 15 minute goal is easier to keep.",
      "Good goals mix one prompt with one review action.",
      "Visible goals create a better return habit."
    ],
    cta: "Use onboarding and daily prompt pages to build a realistic practice habit.",
    actionLabel: "Build daily goal"
  },
  {
    slug: "toefl-speaking-timer",
    title: "TOEFL Speaking Timer",
    description: "Use a TOEFL speaking timer with realistic prep and response windows for independent and integrated task practice.",
    intro: "Many TOEFL learners search for a timer first because they want a low-friction way to practice pacing before they trust a full speaking platform.",
    bullets: [
      "The right prep window helps you organize faster under pressure.",
      "Integrated timing gets easier when note structure is shorter.",
      "Timer pages convert better when they also point to transcript-based practice."
    ],
    cta: "Open the speaking timer, then move into TOEFL AI practice for transcript review and retries.",
    actionLabel: "Open TOEFL timer"
  },
  {
    slug: "session-replay-tool",
    title: "Session Replay Tool",
    description: "Use a session replay tool for speaking practice so you can review audio, transcript, notes, and retry decisions after each attempt.",
    intro: "Replay tools matter because students often improve faster when they can revisit one weak answer instead of jumping to a completely new prompt.",
    bullets: [
      "Replay makes pacing mistakes easier to hear.",
      "Transcript review helps the learner connect what they said to what they intended to say.",
      "One replay plus one retry often teaches more than several random new attempts."
    ],
    cta: "Use SpeakAce session review and replay-style feedback to learn more from every attempt.",
    actionLabel: "Review session"
  }
);

guidePages.push(
  {
    slug: "ielts-speaking-time-management",
    title: "IELTS Speaking Time Management",
    description: "Manage speaking time better in IELTS so your answers feel complete instead of rushed or empty.",
    intro: "Time control is often a hidden problem in speaking because students either overtalk or stop too early.",
    bullets: [
      "Simple answer shapes make timing easier.",
      "Mock drills help you feel how long a complete answer really is.",
      "A calmer pace often improves both timing and pronunciation."
    ],
    cta: "Use timed practice inside SpeakAce to feel answer length more naturally."
  },
  {
    slug: "ielts-speaking-confidence-routine",
    title: "IELTS Speaking Confidence Routine",
    description: "Build a confidence routine for IELTS speaking with easy warm-ups, repeat prompts, and calm review loops.",
    intro: "Confidence often grows from familiarity. A good routine makes the process feel known before the exam arrives.",
    bullets: [
      "Short warm-ups lower entry friction.",
      "Repeat prompts reduce surprise and panic.",
      "A calm review loop helps the learner trust improvement."
    ],
    cta: "Use the weekly challenge and daily prompt pages to create a confidence routine."
  },
  {
    slug: "how-to-use-cue-cards",
    title: "How to Use Cue Cards for IELTS Speaking",
    description: "Learn how to use cue cards for IELTS Speaking Part 2 with a simple note system, cleaner story flow, and better timing.",
    intro: "Cue cards work best when the learner treats them as a structure prompt, not as a script to memorize word for word.",
    bullets: [
      "Use the one-minute prep time to choose one clear story, not three ideas.",
      "A cue card answer becomes easier when each bullet point gets one short supporting detail.",
      "Reviewing the transcript after one attempt shows where the story lost focus."
    ],
    cta: "Open a Part 2 prompt, build four quick notes, and turn the cue card into a cleaner speaking answer."
  },
  {
    slug: "fluency-for-ielts-speaking",
    title: "Fluency for IELTS Speaking",
    description: "Improve fluency for IELTS speaking with steadier answer flow, fewer dead pauses, and more repeat-based practice.",
    intro: "Fluency is usually less about speed and more about keeping an answer moving with a clear idea path and simpler sentence control.",
    bullets: [
      "Repeated topics improve fluency faster than random new questions.",
      "One reason plus one example is often enough to keep the answer moving.",
      "A transcript makes hesitation patterns easier to notice and fix."
    ],
    cta: "Use daily speaking drills and retry loops to build steadier IELTS fluency."
  }
);
