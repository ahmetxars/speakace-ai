import { Difficulty, ExamType, PromptTemplate, TaskType } from "@/lib/types";

const IELTS_PART_1 = [
  "What kind of place do you live in now, and what do you like most about it?",
  "What do you usually do when you have a free evening, and why?",
  "How often do you use public transport, and what is your experience of it?",
  "What kind of weather do you enjoy most, and how does it affect your mood?",
  "What do you usually use your phone for during a normal day?",
  "Is reading a common habit for people in your country, in your opinion?",
  "What do you usually do to stay healthy during a busy week?",
  "Do you enjoy visiting new places in your city, and why?",
  "What subject did you enjoy the most at school, and what made it interesting?",
  "Do you prefer studying alone or with other people? Why?",
  "How important is music in your daily life?",
  "What do you usually do on weekends?"
];

const IELTS_PART_2 = [
  "Describe a person who gave you useful advice. You should say who the person was, what the advice was, when you received it, and explain why it was useful.",
  "Describe a place you visited that was very crowded. You should say where it was, when you went there, what you did there, and explain how you felt about the experience.",
  "Describe a skill you learned outside school or work. You should say what the skill was, how you learned it, how long it took, and explain why it was valuable.",
  "Describe a time when you solved a problem successfully. You should say what the problem was, what you did, who was involved, and explain why the solution was effective.",
  "Describe a book, film, or video that taught you something useful. You should say what it was, when you encountered it, what you learned, and explain why it stayed in your mind.",
  "Describe a time when you had to wait for something important. You should say what you were waiting for, how long you waited, what you did while waiting, and explain how you felt in the end.",
  "Describe a useful object you own. You should say what it is, how often you use it, why you got it, and explain why it is important to you.",
  "Describe a memorable conversation you had recently. You should say who you spoke to, what you talked about, where it happened, and explain why you remember it clearly."
];

const IELTS_PART_3 = [
  "Why do some people make decisions quickly while others need much more time?",
  "How has technology changed the way people maintain friendships?",
  "Do you think cities should invest more in public spaces than private entertainment venues? Why?",
  "Why do some people enjoy learning practical skills more than academic subjects?",
  "What are the long-term effects of spending too much time on mobile apps?",
  "How important is it for children to learn how to manage money?",
  "Why do some workers prefer remote work while others prefer the office?",
  "Do you think people today have better opportunities to improve their lives than in the past?"
];

const TOEFL_TASK_1 = [
  "Some people prefer to start important tasks early in the morning. Others prefer to work late at night. Which approach do you think is better? Explain your opinion using reasons and details.",
  "Do you agree or disagree with the following statement: University students should be required to take classes outside their main field of study. Explain your opinion using reasons and examples.",
  "Some people think it is better to spend money on experiences, while others think it is better to save money for the future. Which do you think is better? Explain why.",
  "Do you agree or disagree that teamwork is more valuable than individual achievement in most jobs? Use details and examples to support your opinion.",
  "Some students like courses that give frequent small assignments. Others prefer courses with one major final project. Which do you prefer and why?"
];

const TOEFL_TASK_2 = [
  {
    title: "TOEFL Task 2 Campus Announcement 1",
    prompt: "Campus notice: The university plans to extend library hours until midnight during exam periods so students can stay on campus longer. Conversation: The woman supports the change because it gives students a quiet place to study and makes group work easier. The man is worried it will increase staffing costs. Summarize the announcement and explain the speakers' opinions.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 2",
    prompt: "Campus notice: The school will replace printed course catalogs with a mobile app. Conversation: The man likes the idea because the information will be updated faster, but the woman prefers printed catalogs because they are easier to compare. Summarize the announcement and explain the two students' views.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 3",
    prompt: "Campus notice: First-year students will not be allowed to park cars on campus. Conversation: The woman supports the policy because parking is limited, but the man argues it will make commuting much harder. Summarize the announcement and explain the students' reactions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 4",
    prompt: "Campus notice: The university will move more office hours online. Conversation: The man thinks this will be more convenient for busy students, but the woman feels in-person meetings are more effective. Summarize the announcement and explain the speakers' positions.",
    difficulty: "Starter" as Difficulty
  }
];

const TOEFL_TASK_3 = [
  {
    title: "TOEFL Task 3 Academic Concept 1",
    prompt: "Reading: Scarcity marketing is a strategy in which businesses make a product seem limited in order to increase demand. Lecture: The professor gives an example of a clothing brand that releases small batches of new designs. Customers buy quickly because they think the items may disappear soon. Explain scarcity marketing and how the example illustrates it.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 2",
    prompt: "Reading: Social facilitation is a psychological effect in which people perform simple tasks better when other people are present. Lecture: The professor describes a runner who practices alone but runs faster during a public race because the audience increases motivation. Explain social facilitation and how the example illustrates it.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 3",
    prompt: "Reading: Niche construction happens when organisms change their environment in ways that also affect their survival. Lecture: The professor explains how beavers build dams, creating ponds that protect them and change the habitat for other species. Explain niche construction using the professor's example.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 4",
    prompt: "Reading: Opportunity cost is the value of the best alternative that is given up when a choice is made. Lecture: The professor gives an example of a student choosing a part-time job instead of an unpaid internship and losing the chance to build experience. Explain opportunity cost and how the example shows it.",
    difficulty: "Target" as Difficulty
  }
];

const TOEFL_TASK_4 = [
  {
    title: "TOEFL Task 4 Lecture Summary 1",
    prompt: "Lecture summary: The professor explains two ways desert plants survive long periods without rain. First, some plants store water in thick tissues. Second, others grow very deep roots to reach underground moisture. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 2",
    prompt: "Lecture summary: The professor describes two methods museums use to attract repeat visitors. One method is rotating exhibits regularly. Another is offering interactive programs that allow visitors to participate directly. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 3",
    prompt: "Lecture summary: The professor explains two reasons some cities experience stronger heat island effects than others. One reason is dark building materials that absorb heat. Another is a lack of trees and green spaces that would normally cool the air. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 4",
    prompt: "Lecture summary: The professor discusses two strategies animals use to avoid predators. Some rely on camouflage to blend into their environment. Others travel in groups so they can detect danger earlier. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  }
];

function buildTemplates(
  examType: ExamType,
  taskType: TaskType,
  prompts: string[],
  titlePrefix: string,
  prepSeconds: number,
  speakingSeconds: number
) {
  return prompts.map<PromptTemplate>((prompt, index) => ({
    id: `${taskType}-${index + 1}`,
    examType,
    taskType,
    title: `${titlePrefix} ${index + 1}`,
    prompt,
    prepSeconds,
    speakingSeconds,
    difficulty: index % 3 === 0 ? "Starter" : index % 3 === 1 ? "Target" : "Stretch"
  }));
}

function buildStructuredTemplates(
  examType: ExamType,
  taskType: TaskType,
  prompts: Array<{ title: string; prompt: string; difficulty: Difficulty }>,
  prepSeconds: number,
  speakingSeconds: number
) {
  return prompts.map<PromptTemplate>((item, index) => ({
    id: `${taskType}-${index + 1}`,
    examType,
    taskType,
    title: item.title,
    prompt: item.prompt,
    prepSeconds,
    speakingSeconds,
    difficulty: item.difficulty
  }));
}

const templates: PromptTemplate[] = [
  ...buildTemplates("IELTS", "ielts-part-1", IELTS_PART_1, "IELTS Part 1 Question", 15, 45),
  ...buildTemplates("IELTS", "ielts-part-2", IELTS_PART_2, "IELTS Part 2 Cue Card", 60, 120),
  ...buildTemplates("IELTS", "ielts-part-3", IELTS_PART_3, "IELTS Part 3 Discussion", 15, 75),
  ...buildTemplates("TOEFL", "toefl-task-1", TOEFL_TASK_1, "TOEFL Task 1 Independent", 15, 45),
  ...buildStructuredTemplates("TOEFL", "toefl-task-2", TOEFL_TASK_2, 30, 60),
  ...buildStructuredTemplates("TOEFL", "toefl-task-3", TOEFL_TASK_3, 30, 60),
  ...buildStructuredTemplates("TOEFL", "toefl-task-4", TOEFL_TASK_4, 20, 60),
  ...buildTemplates("TOEFL", "toefl-independent", TOEFL_TASK_1, "TOEFL Task 1 Independent", 15, 45),
  ...buildStructuredTemplates("TOEFL", "toefl-integrated", [...TOEFL_TASK_2, ...TOEFL_TASK_3, ...TOEFL_TASK_4], 30, 60)
];

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function getPromptTemplate(examType: ExamType, taskType: TaskType, difficulty: Difficulty, promptId?: string): PromptTemplate {
  if (promptId) {
    const exactPrompt = templates.find((template) => template.id === promptId);
    if (exactPrompt) {
      return exactPrompt;
    }
  }

  const exactMatches = templates.filter(
    (template) =>
      template.examType === examType &&
      template.taskType === taskType &&
      template.difficulty === difficulty
  );

  if (exactMatches.length) {
    return pickRandom(exactMatches);
  }

  const sameTask = templates.filter((template) => template.examType === examType && template.taskType === taskType);
  if (sameTask.length) {
    return pickRandom(sameTask);
  }

  const sameExam = templates.filter((template) => template.examType === examType);
  return sameExam.length ? pickRandom(sameExam) : pickRandom(templates);
}

export function listPromptsByExam(examType: ExamType): PromptTemplate[] {
  return templates.filter((template) => template.examType === examType);
}

export function listPromptsForTask(examType: ExamType, taskType: TaskType): PromptTemplate[] {
  return templates.filter((template) => template.examType === examType && template.taskType === taskType);
}

export function getPromptById(promptId: string) {
  return templates.find((template) => template.id === promptId) ?? null;
}
