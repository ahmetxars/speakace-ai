import { Difficulty, WritingPromptTemplate } from "@/lib/types";

const writingTask2Prompts: WritingPromptTemplate[] = [
  {
    id: "wt2-education-online-learning",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Online learning vs classroom learning",
    prompt:
      "Some people think online education is more effective than classroom learning, while others believe traditional classrooms are still better. Discuss both views and give your own opinion.",
    difficulty: "Starter",
    recommendedMinutes: 40
  },
  {
    id: "wt2-technology-children",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Technology use for children",
    prompt:
      "Children are using technology more than ever before. Do the advantages of this trend outweigh the disadvantages?",
    difficulty: "Starter",
    recommendedMinutes: 40
  },
  {
    id: "wt2-environment-government-individual",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Environmental responsibility",
    prompt:
      "Some people believe environmental problems should be solved by governments, while others think individuals should take more responsibility. Discuss both views and give your own opinion.",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-work-remote",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Remote work and productivity",
    prompt:
      "Working from home is becoming more common. Do you think this is a positive or negative development?",
    difficulty: "Starter",
    recommendedMinutes: 40
  },
  {
    id: "wt2-public-transport-investment",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Public transport investment",
    prompt:
      "Governments should spend more money on public transportation than on building new roads. To what extent do you agree or disagree?",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-university-vs-work",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "University or work after school",
    prompt:
      "Some people think all young people should go to university, while others believe they should be encouraged to work instead. Discuss both views and give your own opinion.",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-health-fast-food",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Taxing unhealthy food",
    prompt:
      "Some people think that governments should tax unhealthy food in order to improve public health. To what extent do you agree or disagree?",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-crime-rehabilitation",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Punishment or rehabilitation",
    prompt:
      "Some people believe the purpose of prison is to punish criminals, while others think it should help them return to society. Discuss both views and give your own opinion.",
    difficulty: "Stretch",
    recommendedMinutes: 40
  },
  {
    id: "wt2-advertising-consumerism",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Advertising and unnecessary spending",
    prompt:
      "Advertising encourages consumers to buy things they do not really need. To what extent do you agree or disagree?",
    difficulty: "Starter",
    recommendedMinutes: 40
  },
  {
    id: "wt2-cities-countryside",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "City life or countryside life",
    prompt:
      "More and more people are moving from the countryside to cities. Why is this happening, and what problems can it cause?",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-history-schools",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "The value of history",
    prompt:
      "Some people think history is one of the most important school subjects, while others think science and technology are more important. Discuss both views and give your own opinion.",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-space-exploration",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Space exploration spending",
    prompt:
      "Governments spend a lot of money on space exploration. Some people believe this money should be spent on solving problems on Earth instead. To what extent do you agree or disagree?",
    difficulty: "Stretch",
    recommendedMinutes: 40
  },
  {
    id: "wt2-art-funding",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Funding for arts",
    prompt:
      "Some people think governments should spend money on the arts, while others think this money should be used for public services. Discuss both views and give your own opinion.",
    difficulty: "Target",
    recommendedMinutes: 40
  },
  {
    id: "wt2-social-media-relationships",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Social media and relationships",
    prompt:
      "Social media helps people stay connected, but it also reduces the quality of real relationships. Discuss both views and give your own opinion.",
    difficulty: "Starter",
    recommendedMinutes: 40
  },
  {
    id: "wt2-animal-testing",
    examType: "IELTS",
    taskType: "ielts-writing-task-2",
    title: "Animal testing in research",
    prompt:
      "Animal testing is still widely used for scientific and medical research. Do the benefits of this practice outweigh the drawbacks?",
    difficulty: "Stretch",
    recommendedMinutes: 40
  }
];

export function listWritingPrompts(difficulty?: Difficulty) {
  if (!difficulty) return writingTask2Prompts;
  const filtered = writingTask2Prompts.filter((item) => item.difficulty === difficulty);
  return filtered.length ? filtered : writingTask2Prompts;
}

export function getWritingPrompt(promptId?: string, difficulty: Difficulty = "Target") {
  if (promptId) {
    const exact = writingTask2Prompts.find((item) => item.id === promptId);
    if (exact) return exact;
  }

  const byDifficulty = listWritingPrompts(difficulty);
  return byDifficulty[Math.floor(Math.random() * byDifficulty.length)];
}
