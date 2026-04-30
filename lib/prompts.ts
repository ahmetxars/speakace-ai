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
  "What do you usually do on weekends?",
  "What kind of place do you go to when you need to think clearly?",
  "Do you enjoy cooking, and how often do you cook for yourself or others?",
  "What kind of shop do you visit most often, and why?",
  "Do you prefer spending time indoors or outdoors? Why?",
  "How often do you exercise or do physical activity?",
  "What kind of food do you enjoy eating most?",
  "Do you enjoy watching sports? Which ones?",
  "How do you usually get to work or school?",
  "Do you prefer chatting with friends online or meeting in person?",
  "What do you usually do to relax after a long day?",
  "How important is fashion or clothing style to you?",
  "Do you prefer watching films at home or going to the cinema?",
  "What kind of music do you like listening to?",
  "How often do you spend time with your family?",
  "Do you enjoy drawing or painting? Why or why not?",
  "What is one thing you do every morning without fail?",
  "Are you a morning person or a night person? Why?",
  "How do you usually spend your lunch break?",
  "What is the most useful app on your phone right now?",
  "Do you enjoy learning new languages? Why?",
  "How often do you go shopping, and what do you usually buy?",
  "Do you prefer living alone or with others? Why?",
  "What is your favorite time of year? Why?",
  "Have you ever volunteered for anything? Tell me about it.",
  "How important is having a daily routine to you?",
  "Do you enjoy taking photographs? Why or why not?",
  "What kind of television programmes do you watch?",
  "Do you prefer reading news online or in print?",
  "How do you usually celebrate special occasions?",
  "What do you think is the most important quality in a friend?",
  "Do you enjoy visiting museums or art galleries?",
  "How has your hometown changed in recent years?",
  "What skill would you like to learn in the future?",
  "Do you prefer working in a team or independently?",
  "How important is it for you to be on time?",
  "What do you usually talk about with your friends?",
  "Do you enjoy gardening or taking care of plants?",
  "What was the last trip or journey you took?",
  "Do you have any pets, or would you like to have one? Why?",
  "What do you think is the best way to learn a new skill?",
  "How important is colour to you when choosing clothes or decorating your home?",
  "Do you prefer hot drinks or cold drinks? When do you drink each?",
  "What do you usually do on public holidays?",
  "How often do you use social media, and what platforms do you use most?",
  "Do you prefer living in an apartment or a house? Why?",
  "What local food from your country would you recommend to a visitor?",
  "Do you enjoy being in large crowds? Why or why not?",
  "What kind of music did you listen to when you were younger?",
  "Is there a particular festival or holiday you enjoy celebrating? Tell me about it.",
  "How do you usually keep in touch with people you don't see very often?",
  "Would you say you are an organised person? Why or why not?",
  "Do you prefer spending time at home or going out? Why?",
  "What changes have you noticed in your city or neighbourhood recently?",
  "How important is it for you to have a quiet workspace?",
  "Do you enjoy watching the news? Why or why not?",
  "What do you think is a fair price to pay for a meal at a restaurant?",
  "Do you like handwriting or do you prefer typing? Why?",
  "Have you ever tried any extreme sports or activities?",
  "What kind of art do you find most interesting, and why?",
  "Do you think people in your country are generally friendly to tourists?",
  "How do you usually prepare for an important meeting or event?",
  "Do you think it is important to have hobbies outside of work or study?",
  "What do you usually do when you have a day off with no plans?",
  "Would you prefer to work early in the morning or late at night? Why?",
  "How has the way people communicate changed during your lifetime?",
  "What kind of environment do you find most inspiring for creative work?",
  "Do you think people read enough books nowadays?",
  "What do you think is the most important invention of the last fifty years?",
  "Do you enjoy doing things by yourself, or do you prefer company?",
  "How important is punctuality to you in your daily life?",
  "Have you ever lived or spent time in a different city? What was it like?",
  "What do you think makes a good teacher?",
  "Do you prefer visiting the countryside or the coast when you travel?",
  "What do you like most about the place where you grew up?",
  "How often do you try new restaurants or types of food?",
  "Do you enjoy competitive activities? Why or why not?",
  "What is something you do now that you didn't do five years ago?",
  "How do you usually deal with stress or pressure?",
  "Do you think online learning is as effective as classroom learning?",
  "What is one habit you would like to develop or improve?",
  "Do you enjoy giving gifts to people? What kinds of gifts do you usually choose?",
  "How important is it to you to keep up with new technology?",
  "What do you think is the best age to start learning a musical instrument?",
  "Do you enjoy working on creative projects? What kind?",
  "How do you decide what to watch when you have free time?",
  "Do you think it is better to know a lot about one topic or a little about many?",
  "What do you think makes a city a great place to live?",
  "How have your interests changed since you were a child?",
  "Do you enjoy making plans, or do you prefer being spontaneous?",
  "What do you consider to be your best personal quality?",
  "How important is sleep to you, and what do you do to ensure you get enough?",
  "Do you think it is important to eat together as a family?",
  "Have you ever learned something unexpected from a stranger?",
  "What is one thing about your culture that you are proud of?",
  "Do you prefer to receive feedback in writing or in person? Why?",
  "What kind of physical activity do you enjoy most?"
];

const IELTS_PART_2 = [
  "Describe a person who gave you useful advice. You should say who the person was, what the advice was, when you received it, and explain why it was useful.",
  "Describe a place you visited that was very crowded. You should say where it was, when you went there, what you did there, and explain how you felt about the experience.",
  "Describe a skill you learned outside school or work. You should say what the skill was, how you learned it, how long it took, and explain why it was valuable.",
  "Describe a time when you solved a problem successfully. You should say what the problem was, what you did, who was involved, and explain why the solution was effective.",
  "Describe a book, film, or video that taught you something useful. You should say what it was, when you encountered it, what you learned, and explain why it stayed in your mind.",
  "Describe a time when you had to wait for something important. You should say what you were waiting for, how long you waited, what you did while waiting, and explain how you felt in the end.",
  "Describe a useful object you own. You should say what it is, how often you use it, why you got it, and explain why it is important to you.",
  "Describe a memorable conversation you had recently. You should say who you spoke to, what you talked about, where it happened, and explain why you remember it clearly.",
  "Describe a piece of technology that helps you in daily life. You should say what it is, how you use it, when you started using it, and explain why it is so useful.",
  "Describe an event in your life that made you more confident. You should say what happened, who was involved, how you felt at the time, and explain why it changed you.",
  "Describe a time you helped someone in need. You should say who the person was, what the situation was, what you did to help, and explain how you felt about it afterwards.",
  "Describe a place in your city or town that you enjoy visiting. You should say where it is, what you do there, how often you visit, and explain why you like it.",
  "Describe a hobby or activity you enjoy in your free time. You should say what it is, when you started, how often you do it, and explain what you find enjoyable about it.",
  "Describe a time when you had to learn something new very quickly. You should say what it was, why you needed to learn it fast, how you did it, and explain how you felt.",
  "Describe a person in your life who is very successful. You should say who they are, what they do, how long you have known them, and explain what makes them successful.",
  "Describe a meal you particularly enjoyed. You should say what the meal was, where you had it, who you were with, and explain what made it special.",
  "Describe a gift you received that was very meaningful to you. You should say what it was, who gave it to you, when you received it, and explain why it was meaningful.",
  "Describe a time when you learned something important from a mistake. You should say what the mistake was, what happened, what you learned, and explain how it changed you.",
  "Describe an interesting documentary or news story you saw recently. You should say what it was about, where you saw it, why it interested you, and explain what you learned from it.",
  "Describe a sport or physical activity you enjoy or would like to try. You should say what it is, when you became interested in it, how often you do it, and explain why you enjoy it.",
  "Describe a person from history you find interesting. You should say who the person was, what they are known for, how you learned about them, and explain why you find them interesting.",
  "Describe a time when you made a decision that turned out to be very good. You should say what the decision was, when you made it, what happened as a result, and explain why it was a good one.",
  "Describe a language other than English that you would like to learn. You should say what the language is, why you want to learn it, how you would study it, and explain how useful you think it would be.",
  "Describe a famous building or structure you have visited or would like to visit. You should say where it is, what it looks like, why it is famous, and explain what interests you about it.",
  "Describe a situation where you had to be very patient. You should say what the situation was, how long it took, how you managed your patience, and explain what the outcome was.",
  "Describe a website or app you use regularly. You should say what it is, how often you use it, what you mainly use it for, and explain why you find it useful.",
  "Describe a time when you worked as part of a successful team. You should say what the task was, who was in the team, what your role was, and explain what made the teamwork successful.",
  "Describe a piece of art or music that moved you emotionally. You should say what it was, when you experienced it, how it made you feel, and explain why it had such an effect on you.",
  "Describe a journey or trip that was memorable but difficult. You should say where you went, what made it difficult, how you handled the problems, and explain what you remember most.",
  "Describe a tradition or custom in your country that you find interesting. You should say what it is, when it happens, what people do, and explain why you find it interesting.",
  "Describe a time when you received very helpful feedback. You should say who gave it, what the feedback was, what you did with it, and explain why it was valuable.",
  "Describe an ambition you have had since you were young. You should say what it is, when you first had it, whether you have made progress, and explain why it matters to you.",
  "Describe a time when you had to speak in front of a group. You should say where it was, what you talked about, how you prepared, and explain how you felt during and after.",
  "Describe a shop or market you enjoy visiting. You should say where it is, how often you go, what you buy there, and explain what makes it enjoyable.",
  "Describe a historical event in your country that you find significant. You should say what it was, when it happened, how you learned about it, and explain why it matters.",
  "Describe a challenge you faced in your studies or career. You should say what it was, when you experienced it, how you overcame it, and explain what it taught you.",
  "Describe someone who has always supported and encouraged you. You should say who they are, how long you have known them, what they have done for you, and explain why their support matters.",
  "Describe a time when you felt very proud of yourself. You should say what you did, when it happened, who else was involved, and explain why it made you feel proud.",
  "Describe an experience in nature that you found memorable. You should say where it was, when you went, what you did there, and explain what made it special.",
  "Describe a time when you changed your opinion about something important. You should say what the topic was, why you changed your mind, what influenced you, and explain how you feel about it now.",
  "Describe a city or country you would like to visit in the future. You should say where it is, why you want to go there, what you would do there, and explain what makes it appealing to you.",
  "Describe a time when you taught someone a skill. You should say who the person was, what you taught them, how you did it, and explain how you felt about the experience.",
  "Describe a piece of clothing or an item you own that has special meaning to you. You should say what it is, how you got it, how often you use it, and explain why it is important.",
  "Describe a time when you visited a place in nature that impressed you. You should say where it was, when you went, what you saw there, and explain why it made such an impression.",
  "Describe a project or piece of work you completed that you are proud of. You should say what it was, how long it took, who else was involved, and explain why you are proud of it.",
  "Describe a time you heard some exciting news. You should say what the news was, when and how you heard it, how you felt when you heard it, and explain why it was exciting.",
  "Describe a rule or law in your country that you think is particularly fair or useful. You should say what the rule is, who it applies to, why it exists, and explain why you support it.",
  "Describe a person you know who has a very positive attitude to life. You should say who this person is, how you know them, what they are like, and explain how their attitude affects the people around them.",
  "Describe something you own that you would not want to lose. You should say what it is, how you got it, how you use it, and explain why it would be difficult to replace.",
  "Describe a time when you felt very nervous. You should say what the situation was, what caused your nerves, what happened in the end, and explain how you managed your feelings.",
  "Describe a park or public space you enjoy visiting. You should say where it is, what facilities or features it has, how often you go, and explain what makes it a good place to spend time.",
  "Describe a time when you changed a plan at the last minute. You should say what the original plan was, what made you change it, what you did instead, and explain how it worked out.",
  "Describe a book or story you read as a child. You should say what the story was about, when you read it, who introduced you to it, and explain why it stands out in your memory.",
  "Describe a time when you helped to organise an event. You should say what the event was, what your role was, what challenges you faced, and explain whether the event was successful.",
  "Describe an animal you find interesting. You should say what the animal is, where it lives, what it looks like, and explain what makes it interesting to you.",
  "Describe a memorable birthday celebration. You should say whose birthday it was, where it was held, who was there, and explain what made it special.",
  "Describe a time when you visited a museum or art gallery. You should say where it was, when you went, what you saw, and explain what you found most interesting about the experience.",
  "Describe a type of weather you particularly enjoy. You should say what it is, when this weather occurs where you live, what you like to do in this weather, and explain why you enjoy it.",
  "Describe a time when you received unexpectedly good service. You should say where it was, what happened, who helped you, and explain why the service was so impressive.",
  "Describe something you do to look after your health. You should say what it is, when you started doing it, how often you do it, and explain why you think it is important.",
  "Describe a social occasion that you enjoyed. You should say what the occasion was, where it was held, who was there, and explain what made it enjoyable.",
  "Describe a time when you had to make a difficult choice. You should say what the situation was, what the options were, what you decided, and explain how you feel about that decision now.",
  "Describe a building in your city or town that you find architecturally interesting. You should say what type of building it is, where it is located, why it stands out, and explain why you find it interesting.",
  "Describe a time when technology helped you solve a problem. You should say what the problem was, what technology you used, how you used it, and explain why it was effective.",
  "Describe a person who made a positive difference in your education. You should say who the person was, how they helped you, when this happened, and explain what you learned from them.",
  "Describe a time when you tried food from another culture for the first time. You should say what the food was, how you came to try it, what you thought of it, and explain whether you would eat it again.",
  "Describe a time when you overcame a fear. You should say what the fear was, when you decided to face it, what you did, and explain how you felt after overcoming it.",
  "Describe a time when someone apologised to you. You should say who it was, why they apologised, how you reacted, and explain whether their apology changed how you felt.",
  "Describe a person in your family who has influenced you the most. You should say who the person is, what they are like, how they have influenced you, and explain why their influence has been significant."
];

const IELTS_PART_3 = [
  "Why do some people make decisions quickly while others need much more time?",
  "How has technology changed the way people maintain friendships?",
  "Do you think cities should invest more in public spaces than private entertainment venues? Why?",
  "Why do some people enjoy learning practical skills more than academic subjects?",
  "What are the long-term effects of spending too much time on mobile apps?",
  "How important is it for children to learn how to manage money?",
  "Why do some workers prefer remote work while others prefer the office?",
  "Do you think people today have better opportunities to improve their lives than in the past?",
  "Why do some people become strongly attached to certain products or brands?",
  "How should schools balance academic learning with practical life skills?",
  "In what ways has social media changed the way people communicate with each other?",
  "Do you think governments should do more to protect the environment? Why?",
  "Why is it important for young people to travel to other countries?",
  "How has the role of women in the workplace changed in recent decades?",
  "Do you think it is important for children to study arts and music in school?",
  "Why do some people choose to live in cities while others prefer rural areas?",
  "How can companies encourage their employees to be more creative?",
  "Do you think technology is making people more or less connected to each other?",
  "What are the advantages and disadvantages of studying abroad?",
  "Why do some societies place more value on education than others?",
  "How important is it for older generations to adapt to new technology?",
  "In your opinion, what is the most serious environmental problem facing the world today?",
  "How has the internet changed the way people learn new skills?",
  "Do you think competitive sport teaches children valuable life lessons?",
  "What effects does tourism have on local cultures and communities?",
  "Why do you think some people are more willing to take risks than others?",
  "How should governments deal with the problem of rising housing costs in cities?",
  "Do you think people today have more or less free time than in the past?",
  "What role should schools play in teaching children about mental health?",
  "How might working from home change society in the long term?",
  "Do you think young people today are more or less politically engaged than previous generations?",
  "What are the main advantages of learning a foreign language from a young age?",
  "How has the relationship between employers and employees changed in recent years?",
  "Why do you think so many people find it difficult to maintain a healthy lifestyle?",
  "In what ways can public transport improve the quality of life in a city?",
  "Do you think it is the responsibility of individuals or governments to deal with climate change?",
  "How has globalisation changed the way people think about national identity?",
  "What are the potential risks of relying too heavily on artificial intelligence?",
  "Why do you think some countries are more successful at sports than others?",
  "How important is it for businesses to be socially responsible? Why?",
  "Do you think people today are more or less patient than they were in the past?",
  "How has the role of the family changed in modern society compared to previous generations?",
  "Should governments invest more in renewable energy even if it raises the cost of electricity? Why?",
  "Do you think it is important to preserve traditional crafts and skills, even if there is little commercial demand for them?",
  "How has increased access to information affected the way people form opinions?",
  "Do you think wearing school uniforms is beneficial for students? Why or why not?",
  "In what ways can communities be made safer without increasing police presence?",
  "Do you think scientists should be more involved in making public policy decisions? Why?",
  "How do you think rising levels of automation will affect the job market over the next decade?",
  "Should students be taught how to manage their personal finances at school? Why?",
  "How do you think international tourism can be made more sustainable?",
  "Do you think it is fair that some professions earn much more than others?",
  "In what ways can people be encouraged to adopt healthier eating habits?",
  "Do you think people today have a stronger or weaker sense of community than in the past?",
  "How important is it for children to experience failure when they are young?",
  "Do you think social media companies have a responsibility to prevent the spread of misinformation?",
  "In your opinion, what is the most effective way for governments to combat obesity?",
  "How has the concept of privacy changed in the era of digital technology?",
  "Do you think it is important for famous people to set a good example to the public?",
  "How can museums and cultural institutions attract younger visitors?",
  "Do you think it is better for children to grow up in large families or small ones?",
  "What responsibilities do employers have towards the mental health of their employees?",
  "Do you think people who live alone are happier or less happy than those who live with others?",
  "How can governments encourage more people to use public transport?",
  "Do you think volunteering should be a compulsory part of secondary school education?",
  "In what ways can the arts benefit a society beyond entertainment value?",
  "Do you think technological development always leads to progress? Why or why not?",
  "How important is it for companies to offer flexible working arrangements to employees?",
  "Should wealthy individuals be required to contribute more to solving social problems?"
];

const TOEFL_TASK_1 = [
  "Some people prefer to start important tasks early in the morning. Others prefer to work late at night. Which approach do you think is better? Explain your opinion using reasons and details.",
  "Do you agree or disagree with the following statement: University students should be required to take classes outside their main field of study. Explain your opinion using reasons and examples.",
  "Some people think it is better to spend money on experiences, while others think it is better to save money for the future. Which do you think is better? Explain why.",
  "Do you agree or disagree that teamwork is more valuable than individual achievement in most jobs? Use details and examples to support your opinion.",
  "Some students like courses that give frequent small assignments. Others prefer courses with one major final project. Which do you prefer and why?",
  "Do you agree or disagree that it is better to become very skilled in one area than to be good at many different things?",
  "Some people prefer living in a large city, while others prefer living in a small town. Which do you think offers a better quality of life?",
  "Do you agree or disagree that social media has had a mostly positive impact on society? Use specific reasons and examples to support your position.",
  "Some people believe that children should be allowed to use smartphones freely. Others think there should be strict limits. Which view do you agree with and why?",
  "Do you think it is more important to pursue a career you love or one that pays well? Explain your choice with reasons and examples.",
  "Some people prefer to travel alone. Others prefer to travel with a group. Which do you think is a better way to travel and why?",
  "Do you agree or disagree that schools should ban the use of mobile phones during class? Give reasons and examples to support your view.",
  "Some people believe that success comes mainly from hard work. Others think natural talent is more important. Which view do you agree with?",
  "Is it better to make decisions quickly or to take a long time to decide? Use reasons and examples to support your opinion.",
  "Do you agree or disagree that older people have more wisdom than younger people? Explain your view.",
  "Some people prefer careers with high salaries but long hours. Others prefer lower salaries but more free time. Which would you choose?",
  "Do you think that traditional family meals are important in modern life? Why or why not?",
  "Some people believe that art and music should be compulsory in school. Others disagree. What is your opinion?",
  "Is it better to live near family or to move far away for better opportunities? Explain your position.",
  "Do you agree or disagree that students should choose their own subjects in school rather than following a fixed curriculum?",
  "Some people prefer to plan every detail of a trip. Others like to travel without a fixed plan. Which approach do you prefer and why?",
  "Do you think it is important for everyone to be able to speak more than one language? Why or why not?",
  "Some people think that cities have become too crowded and should limit population growth. Do you agree or disagree?",
  "Is it better to have a few very close friends or many acquaintances? Explain your view with reasons and examples.",
  "Do you agree or disagree that the internet has made people less able to think for themselves?",
  "Some people prefer to read books. Others prefer to watch documentaries. Which do you prefer for learning about the world and why?",
  "Do you think animals should be used in scientific research? Explain your view with reasons and examples.",
  "Is it better for children to grow up in the city or in the countryside? Use specific reasons to support your answer.",
  "Some people think the most important quality in a leader is confidence. Others believe it is empathy. Which do you think matters more?",
  "Do you agree or disagree that technology has made modern life more stressful than it was in the past?",
  "Some people think university education should be free for everyone. Others believe students should pay tuition fees. Which view do you agree with?",
  "Do you agree or disagree that it is better to spend money on public transportation than on building new roads? Give reasons and examples.",
  "Some people believe that working from home is more productive than working in an office. Do you agree or disagree?",
  "Is it more important for a leader to be liked or to be respected? Explain your opinion with reasons and examples.",
  "Do you agree or disagree that people should be required to volunteer in their communities? Give specific reasons.",
  "Some people think that children spend too much time using digital devices. Do you agree or disagree?",
  "Do you agree or disagree that it is better to rent a home than to own one? Support your answer with reasons.",
  "Some people prefer to cook at home rather than eat at restaurants. Which do you prefer and why?",
  "Do you agree or disagree that news media should focus more on positive stories rather than negative events?",
  "Some students prefer to take a gap year before university. Do you think this is a good idea?",
  "Is it better for employees to stay at one company for a long time or to change jobs frequently?",
  "Do you agree or disagree that people should be allowed to keep exotic animals as pets?",
  "Some people believe that zoos should be abolished. Do you agree or disagree? Give reasons.",
  "Is it better for children to play competitive sports or non-competitive sports? Explain your view.",
  "Do you agree or disagree that cities should invest more in green spaces and parks?",
  "Some people think that famous athletes and entertainers are paid too much. Do you agree?",
  "Do you prefer studying with background music or in complete silence? Why?",
  "Is it better to apologize immediately when you are wrong or to wait until you fully understand the situation?",
  "Do you agree or disagree that people learn more from their failures than from their successes?",
  "Some people believe that handwriting skills are no longer important. Do you agree or disagree?",
  "Is it better to set big, ambitious goals or smaller, more achievable goals? Explain why.",
  "Do you agree or disagree that social networking sites do more harm than good for society?",
  "Some people think it is better to learn cooking skills rather than eating out. Which do you prefer?",
  "Do you agree or disagree that young people today have less respect for older people than in the past?",
  "Is it better for companies to hire experienced workers or fresh graduates? Give your opinion.",
  "Some people prefer to read the book before watching the film adaptation. Do you agree this is the better approach?",
  "Do you agree or disagree that museums should charge admission fees to be financially sustainable?",
  "Is it better for students to live on campus or off campus during university? Explain your choice.",
  "Do you agree or disagree that mandatory physical education in school benefits all students equally?"
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
  },
  {
    title: "TOEFL Task 2 Campus Announcement 5",
    prompt: "Campus notice: The student center will close one floor to create a quiet study lounge. Conversation: The woman likes the idea because students need more silent areas, but the man dislikes it because clubs will lose meeting space. Summarize the announcement and explain the students' reactions.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 6",
    prompt: "Campus notice: The university is planning to introduce a mandatory community service requirement of 20 hours per year for all students. Conversation: The man supports this because it builds real-world skills, but the woman argues it adds too much pressure for already busy students. Summarize the announcement and explain both students' views.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 7",
    prompt: "Campus notice: The college bookstore will stop selling physical textbooks and only sell digital versions. Conversation: The woman is happy about the lower cost, but the man prefers physical books and finds digital reading harder. Summarize the announcement and explain the students' reactions.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 8",
    prompt: "Campus notice: The university will close all on-campus cafeterias one day per week to reduce operating costs. Conversation: The man dislikes the idea because many students depend on campus food, but the woman says students can plan ahead. Summarize the announcement and discuss the students' opinions.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 9",
    prompt: "Campus notice: Starting next semester, all students must attend a career planning workshop in their first year. Conversation: The woman thinks this is helpful for undecided students, but the man believes it wastes time for students who already have clear plans. Summarize the announcement and explain the speakers' views.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 10",
    prompt: "Campus notice: The university gym will be open 24 hours a day starting next month. Conversation: The man is excited because he trains late at night, but the woman is concerned about security and whether there will be enough staff. Summarize the announcement and the students' reactions.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 11",
    prompt: "Campus notice: All science labs will require students to complete an online safety course before they can enter. Conversation: The woman supports the requirement for safety reasons, but the man thinks it is unnecessary for students who have already done lab work. Summarize the announcement and explain the students' views.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 12",
    prompt: "Campus notice: The university will no longer offer printed transcripts and will use digital records only. Conversation: The man likes the environmental benefit, but the woman is worried that some employers and institutions may not accept digital transcripts. Summarize the announcement and the speakers' reactions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 13",
    prompt: "Campus notice: Students who maintain a GPA above 3.5 will be given priority scheduling for the following semester. Conversation: The woman is pleased because strong students deserve recognition, but the man argues it puts more stress on students and creates inequality. Summarize the announcement and explain both opinions.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 14",
    prompt: "Campus notice: The university plans to allow dogs on campus in designated outdoor areas. Conversation: The man loves the idea because pets reduce stress, but the woman is concerned about allergies and cleanliness. Summarize the announcement and the students' views.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 15",
    prompt: "Campus notice: All first-year students will be assigned a peer mentor from senior years as part of a new mentoring programme. Conversation: The woman supports this as it helps new students adjust, but the man thinks senior students are too busy and may not take it seriously. Summarize the announcement and explain the speakers' positions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 16",
    prompt: "Campus notice: The university will introduce a shuttle service between the main campus and the new satellite building, running every 20 minutes. Conversation: The man is pleased because commuting between buildings has been difficult, but the woman worries the 20-minute gap will make her late for back-to-back classes. Summarize the announcement and the students' reactions.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 17",
    prompt: "Campus notice: The university is considering replacing all vending machines with healthy food options only. Conversation: The woman supports the change for health reasons, but the man argues that students should have freedom to choose what they eat and that the change is paternalistic. Summarize the announcement and explain the speakers' views.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 18",
    prompt: "Campus notice: Students will no longer be allowed to use laptops or tablets in introductory lecture courses following research showing it reduces engagement. Conversation: The man agrees with the policy because students tend to get distracted, but the woman says she takes all her notes digitally and the ban will hurt her grades. Summarize the announcement and explain both opinions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 19",
    prompt: "Campus notice: The university plans to require all students to take a public speaking course before graduation. Conversation: The woman fully supports this because speaking skills are essential for careers, but the man says it adds unnecessary pressure for students who are already overwhelmed with core coursework. Summarize the announcement and explain the students' reactions.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 20",
    prompt: "Campus notice: The college has decided to install solar panels on the roofs of all campus buildings to reduce energy costs. Conversation: Both students generally support the idea for environmental reasons, but the man questions whether the upfront cost is worth it when the university is already cutting program budgets. Summarize the announcement and the students' views.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 21",
    prompt: "Campus notice: The university will begin grading all writing assignments with AI-assisted software to provide faster feedback. Conversation: The woman likes the idea of getting quicker feedback, but the man is concerned that AI may not understand creative writing or cultural context as well as a human professor. Summarize the announcement and explain the speakers' positions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 22",
    prompt: "Campus notice: The student union has proposed creating a dedicated meditation room in the student centre open 24 hours a day. Conversation: The man supports the initiative because mental wellness resources are lacking on campus, but the woman believes the space could be used more productively for group study or club activities. Summarize the announcement and explain both views.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 23",
    prompt: "Campus notice: The registration system will be updated so that senior students get to pick their courses one week earlier than juniors and sophomores. Conversation: The woman thinks this is fair because seniors have fewer chances to retake missed courses, but the man believes it creates inequality and limits course access for younger students. Summarize the announcement and the speakers' reactions.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 24",
    prompt: "Campus notice: The university is planning to reduce the number of large lecture classes and replace them with smaller discussion-based seminars. Conversation: The man prefers smaller classes because they allow more interaction with professors, but the woman worries that fewer lecture sections means harder course scheduling and more conflicts. Summarize the announcement and explain the students' opinions.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 25",
    prompt: "Campus notice: The university plans to build a new international student center to provide dedicated support services. Conversation: The woman is enthusiastic because international students currently lack focused support, but the man questions why the same funds couldn't improve services for all students instead of a separate facility. Summarize the announcement and explain the speakers' positions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 26",
    prompt: "Campus notice: Students who do not pick up their campus mail within two weeks will have it discarded. Conversation: The man is frustrated because he travels frequently and cannot always collect mail on time, but the woman thinks the rule is reasonable given how limited the mailroom space is. Summarize the announcement and the students' views.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 27",
    prompt: "Campus notice: The university is launching a new 'no single-use plastic' campaign and will ban plastic water bottles in all campus buildings. Conversation: The woman fully supports the environmental initiative, but the man argues that water fountains on campus are too far apart and often out of service, making refillable bottles impractical. Summarize the announcement and explain both perspectives.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 28",
    prompt: "Campus notice: The athletics department will cut funding to three minor sports teams to redirect money to facility upgrades for all students. Conversation: The man is disappointed because the cut teams have strong traditions, but the woman thinks upgraded facilities benefit far more students than three small teams. Summarize the announcement and the students' reactions.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 29",
    prompt: "Campus notice: The university will trial a four-day academic week where classes are condensed to allow Fridays off. Conversation: The woman loves the idea because it provides a longer weekend for rest and internships, but the man worries that squeezing classes into four days will leave students with less time to absorb difficult material. Summarize the announcement and explain the speakers' views.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 2 Campus Announcement 30",
    prompt: "Campus notice: All student clubs will be required to submit a detailed budget proposal to the student union before receiving any funding this year. Conversation: The man supports the proposal because it ensures accountability, but the woman says the process is too bureaucratic and discourages students from starting new clubs. Summarize the announcement and the students' reactions.",
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
  },
  {
    title: "TOEFL Task 3 Academic Concept 5",
    prompt: "Reading: Cognitive mapping is the mental process of creating an internal representation of a space so that a person or animal can navigate it efficiently. Lecture: The professor describes students who quickly learn the layout of a new campus and begin taking shortcuts between buildings even without using a map. Explain cognitive mapping and how the example illustrates it.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 6",
    prompt: "Reading: Loss aversion is the psychological tendency to prefer avoiding losses over acquiring equivalent gains. People typically feel the pain of losing something more strongly than the pleasure of gaining the same thing. Lecture: The professor describes a study in which participants were more motivated to avoid losing $10 than they were to gain $10, even though the outcome was financially equal. Explain loss aversion and how the example illustrates it.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 7",
    prompt: "Reading: Biomimicry is the practice of designing products and systems by copying strategies found in nature. Engineers study how plants and animals solve problems and apply those solutions to human challenges. Lecture: The professor explains how the design of high-speed trains was inspired by the beak of the kingfisher bird, which is shaped to enter water with minimal resistance. Explain biomimicry and how the lecture illustrates it.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 8",
    prompt: "Reading: Confirmation bias is the tendency to search for and interpret information in a way that confirms one's existing beliefs while ignoring information that contradicts them. Lecture: The professor gives the example of a person who believes a certain diet is healthy and only reads studies that support it, dismissing those that raise concerns. Explain confirmation bias and how the example illustrates it.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 9",
    prompt: "Reading: Economies of scale refer to the cost advantages that businesses gain when they increase production, because fixed costs are spread over a larger number of goods. Lecture: The professor describes a small bakery that cuts the price per loaf when it buys flour in bulk rather than in small quantities, reducing its cost per unit. Explain economies of scale using the professor's example.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 10",
    prompt: "Reading: Habituation is a process in which an organism reduces its response to a stimulus after repeated exposure, essentially learning to ignore things that are familiar and non-threatening. Lecture: The professor gives the example of a person who moves near a railway line and initially finds the train noise very disruptive but gradually stops noticing it over several weeks. Explain habituation and how the example illustrates the concept.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 11",
    prompt: "Reading: Planned obsolescence is a design strategy in which a product is intentionally made to become outdated or non-functional after a certain period, encouraging consumers to buy a new version. Lecture: The professor discusses how some technology companies release new software that slows down older devices, pushing users to upgrade to newer models. Explain planned obsolescence and how the lecture example illustrates it.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 12",
    prompt: "Reading: Altruism refers to actions taken to benefit others at a cost to oneself, without expectation of personal reward. Evolutionary biologists debate why altruistic behaviour exists if individual survival is the primary drive. Lecture: The professor gives the example of vervet monkeys that give alarm calls when predators approach, drawing attention to themselves and putting themselves at risk to warn the group. Explain altruism using the professor's example.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 13",
    prompt: "Reading: Price elasticity of demand describes how much the quantity demanded of a good changes when its price changes. When demand is elastic, a small price increase leads to a large drop in purchases. Lecture: The professor compares two products: luxury handbags and petrol. He explains that demand for luxury goods drops sharply with a price rise, while petrol demand changes very little because it is a necessity. Explain price elasticity using the professor's comparison.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 14",
    prompt: "Reading: The placebo effect occurs when a patient experiences a real improvement in symptoms after receiving a treatment with no active ingredients, simply because they believe it will work. Lecture: The professor describes a clinical trial in which patients who received sugar pills reported significant pain reduction because they were told the pills were strong painkillers. Explain the placebo effect and how the example illustrates it.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 15",
    prompt: "Reading: Greenwashing is the practice of making misleading claims about the environmental benefits of a product or company in order to attract consumers who prefer sustainable options. Lecture: The professor gives the example of a company that marketed its plastic bottles as eco-friendly because they used slightly less plastic than before, while the bottles were still not recyclable in most areas. Explain greenwashing and how the example illustrates it.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 16",
    prompt: "Reading: Reciprocity is a social norm in which people feel compelled to return a favour after receiving one, even when the original favour was unsolicited. Lecture: The professor describes a charity that sent small free gifts with donation requests. Recipients felt obligated to give money even though they hadn't asked for the gift. Explain reciprocity and how the lecture example illustrates it.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 17",
    prompt: "Reading: Keystone species are organisms that have a disproportionately large effect on their ecosystem relative to their abundance. Removing them causes dramatic changes that affect many other species. Lecture: The professor explains how sea otters control sea urchin populations. Without otters, urchins multiply and destroy kelp forests, collapsing the entire marine ecosystem. Explain the concept of keystone species using this example.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 18",
    prompt: "Reading: Anchoring bias is a cognitive tendency where people rely too heavily on the first piece of information they encounter when making decisions. Lecture: The professor describes an experiment in which participants estimated a jar's worth after being shown either a high or low number first. Those shown higher numbers consistently gave higher estimates. Explain anchoring bias and how the experiment illustrates it.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 19",
    prompt: "Reading: Carrying capacity refers to the maximum population size of a species that an environment can sustain indefinitely given available resources. Lecture: The professor describes deer introduced to an island with no predators. Their population grew rapidly, then crashed sharply when vegetation was overgrazed, demonstrating how exceeding carrying capacity leads to population collapse. Explain carrying capacity using the example.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 20",
    prompt: "Reading: The bystander effect describes the tendency for individuals to be less likely to offer help in an emergency when other people are present, because responsibility is diffused among the group. Lecture: The professor recounts a study where participants alone in a room quickly reported smoke under a door, but when others (who were actors ignoring the smoke) were present, most participants did nothing. Explain the bystander effect using this example.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 21",
    prompt: "Reading: Convergent evolution occurs when unrelated species independently develop similar traits because they face similar environmental pressures or occupy similar ecological roles. Lecture: The professor compares dolphins and sharks: though one is a mammal and the other a fish, both evolved streamlined bodies and fins to navigate water efficiently. Explain convergent evolution using this example.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 22",
    prompt: "Reading: The sunk cost fallacy is the tendency to continue investing time, money, or effort into something simply because you have already invested resources in it, rather than based on future returns. Lecture: The professor describes a company that kept funding a failing software project because millions had already been spent, even when it became clear the product would never be profitable. Explain the sunk cost fallacy and how this example demonstrates it.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 23",
    prompt: "Reading: Commensalism is a type of relationship between two species in which one species benefits while the other is neither helped nor harmed. Lecture: The professor explains how cattle egrets follow large grazing animals. The birds eat insects stirred up by the cattle's movements. The cattle gain nothing and lose nothing from the arrangement. Explain commensalism and how the example illustrates it.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 24",
    prompt: "Reading: Nudge theory is an approach in behavioural economics that uses small, indirect suggestions to influence people's decisions without restricting their freedom of choice. Lecture: The professor explains how placing fruit at eye level in school cafeterias increased student consumption of healthy food, without removing any unhealthy options. Explain nudge theory and how the cafeteria example illustrates it.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 25",
    prompt: "Reading: Competitive exclusion is an ecological principle stating that two species competing for exactly the same limited resources cannot coexist indefinitely in the same habitat. Lecture: The professor describes two species of paramecia grown in the same container. One species consistently outcompeted the other for food, eventually causing the weaker competitor to die out. Explain competitive exclusion using this example.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 26",
    prompt: "Reading: Code switching is the practice of alternating between two or more languages or dialects in a single conversation, often in response to the social context or audience. Lecture: The professor describes a bilingual employee who speaks formal English in business meetings but switches to Spanish when talking with colleagues from the same cultural background. Explain code switching and how the example illustrates it.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 27",
    prompt: "Reading: Operant conditioning is a learning method in which behaviour is shaped through the use of rewards and punishments. Desirable behaviours are reinforced and undesirable ones are discouraged. Lecture: The professor describes training a dog to sit on command by giving it a treat each time it sits correctly, and withholding treats when it does not comply. Over time the dog reliably performs the behaviour on cue. Explain operant conditioning using this example.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 28",
    prompt: "Reading: Resource partitioning is a process by which competing species avoid direct competition by using different parts of a shared habitat or consuming different types of food. Lecture: The professor describes multiple species of warblers nesting in the same spruce tree. Each species feeds at a different height and part of the tree, reducing competition and allowing all species to coexist. Explain resource partitioning using this example.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 29",
    prompt: "Reading: Defensive architecture refers to design choices in urban spaces that intentionally prevent certain uses, often discouraging homeless people from resting or sleeping in public areas. Lecture: The professor describes benches with armrests placed in the middle to prevent lying down and sloped seats in bus shelters. He notes that while these designs address property owner concerns, critics argue they remove public space from vulnerable people. Explain defensive architecture using the examples.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 3 Academic Concept 30",
    prompt: "Reading: Foreshadowing is a literary technique in which an author provides early hints or clues about events that will occur later in the story, creating suspense and preparing the reader for what is to come. Lecture: The professor discusses a novel in which a character mentions a gun hanging on the wall in chapter one. Later, the gun becomes central to the climax of the story. Explain foreshadowing and how the example illustrates the technique.",
    difficulty: "Starter" as Difficulty
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
  },
  {
    title: "TOEFL Task 4 Lecture Summary 5",
    prompt: "Lecture summary: The professor explains two ways companies improve employee motivation. One is giving workers more autonomy over how they complete tasks. The other is providing regular feedback so progress becomes visible. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 6",
    prompt: "Lecture summary: The professor describes two ways in which cities can reduce traffic congestion. The first is congestion pricing, which charges drivers a fee for entering busy areas during peak hours. The second is investment in fast, reliable public transport that offers a practical alternative to driving. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 7",
    prompt: "Lecture summary: The professor explains two reasons why sleep is essential for learning. First, during deep sleep the brain consolidates memories, transferring information from short-term to long-term storage. Second, adequate sleep improves concentration and decision-making the following day. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 8",
    prompt: "Lecture summary: The professor discusses two strategies used by retailers to increase sales. The first is product placement, which positions high-profit items at eye level so shoppers notice them first. The second is bundling, which groups related products together at a slight discount to encourage larger purchases. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 9",
    prompt: "Lecture summary: The professor explains two ways oceans regulate the Earth's climate. First, the ocean absorbs large amounts of heat from the sun, preventing extreme temperature increases on land. Second, ocean currents distribute heat around the planet, keeping many coastal regions warmer than their latitude would suggest. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 10",
    prompt: "Lecture summary: The professor describes two methods scientists use to study ancient climates. The first involves analysing ice cores drilled from glaciers, which contain trapped air bubbles from thousands of years ago. The second is examining tree rings, where wider rings indicate warmer or wetter growing seasons. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 11",
    prompt: "Lecture summary: The professor explains two ways that animals communicate without sound. First, some species use bioluminescence, producing light signals to attract mates or warn predators. Second, many insects release chemical signals called pheromones that convey messages about food sources or danger to members of the same species. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 12",
    prompt: "Lecture summary: The professor discusses two factors that influence how quickly a language changes over time. First, contact with other languages introduces new vocabulary and grammar structures. Second, social prestige plays a role, as people often adopt the speech patterns of groups they admire. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 13",
    prompt: "Lecture summary: The professor explains two advantages of urban green spaces such as parks and community gardens. The first is the environmental benefit of absorbing pollution and reducing the heat island effect in cities. The second is the social benefit of providing shared spaces where residents meet and build community connections. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 14",
    prompt: "Lecture summary: The professor describes two ways that microplastics enter the food chain. First, small marine organisms such as fish and shellfish ingest plastic particles in the water. Second, microplastics are absorbed through the roots of some plants grown in contaminated soil, eventually reaching humans through vegetables and crops. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 15",
    prompt: "Lecture summary: The professor explains two strategies companies use to build customer loyalty. The first is a rewards programme that gives customers points for each purchase, which can be exchanged for discounts or free items. The second is personalisation, where companies use data to recommend products tailored to individual preferences, making customers feel valued. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 16",
    prompt: "Lecture summary: The professor explains two ways in which coral reefs are damaged by human activity. First, agricultural runoff introduces excess nutrients into the water, promoting algae growth that smothers coral. Second, physical damage from boat anchors and irresponsible diving breaks fragile coral structures that take decades to recover. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 17",
    prompt: "Lecture summary: The professor discusses two techniques that novelists use to develop character. The first is direct characterization, in which the narrator explicitly describes a character's traits. The second is indirect characterization, in which traits are revealed through the character's actions, speech, and reactions to events. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 18",
    prompt: "Lecture summary: The professor explains two reasons why the price of goods can rise even without increased consumer demand. The first is cost-push inflation, where rising production costs such as wages or raw materials force companies to charge more. The second is supply chain disruption, where shortages in key materials reduce output and push prices up. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 19",
    prompt: "Lecture summary: The professor describes two challenges that space exploration agencies face when planning long-duration missions to Mars. The first is the physical effect of prolonged weightlessness on astronauts' bones and muscles. The second is the psychological toll of extended isolation and the impossibility of real-time communication with Earth. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 20",
    prompt: "Lecture summary: The professor explains two ways that cities are adapting to the increasing threat of flooding. One strategy involves constructing raised flood barriers along rivers and coastlines. Another approach is the creation of green infrastructure, such as urban wetlands and permeable pavements, that absorb and slow water runoff naturally. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 21",
    prompt: "Lecture summary: The professor discusses two reasons why some languages are disappearing at an accelerating rate. The first is urbanisation, which draws young speakers away from rural communities into cities where dominant languages are used. The second is the absence of written literature or formal education in minority languages, making intergenerational transmission difficult. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 22",
    prompt: "Lecture summary: The professor explains two ways that packaging influences consumer purchasing decisions. First, colour psychology plays a strong role, with warm colours like red and orange creating urgency and cool colours suggesting trustworthiness. Second, packaging shape affects perceived value, with taller containers often appearing to hold more than shorter ones of equal volume. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 23",
    prompt: "Lecture summary: The professor describes two methods historians use to verify the authenticity of ancient documents. The first is chemical analysis of the ink and parchment to establish the materials' age. The second is cross-referencing the document's content with other known historical records to check for consistency in names, events, and dates. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 24",
    prompt: "Lecture summary: The professor explains two reasons why childhood exposure to multiple languages produces cognitive advantages. First, bilingual children develop stronger executive function because managing two language systems exercises attention control. Second, early multilingual exposure creates flexible mental frameworks for learning additional languages later in life. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 25",
    prompt: "Lecture summary: The professor discusses two ways that architects can design buildings to reduce their environmental impact. The first involves incorporating passive solar design, orienting and shading windows to reduce heating and cooling needs. The second is the use of recycled or low-carbon building materials that require less energy to produce. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 26",
    prompt: "Lecture summary: The professor explains two reasons why migratory animals sometimes get disoriented and travel in the wrong direction. One cause is light pollution from cities, which interferes with animals' ability to navigate by stars at night. Another is magnetic field anomalies near large concentrations of iron ore or industrial equipment, which disrupt animals' internal magnetic compass. Summarize the lecture.",
    difficulty: "Starter" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 27",
    prompt: "Lecture summary: The professor describes two disadvantages of remote work for organisations. The first is reduced spontaneous collaboration, since chance conversations in offices often spark creative ideas that structured video calls do not replicate. The second is difficulty in monitoring productivity, as managers have less visibility into how work time is being used. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 28",
    prompt: "Lecture summary: The professor explains two ways that social insects such as ants organise their colonies without any central leadership. The first is the use of chemical signals called pheromones that direct workers toward food sources or threats. The second is stigmergy, in which each worker responds to changes in the environment left by previous workers, producing coordinated group behaviour without direct communication. Summarize the lecture.",
    difficulty: "Stretch" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 29",
    prompt: "Lecture summary: The professor discusses two ways that advertisers use narrative storytelling to make their messages more persuasive. First, stories create emotional engagement that makes brand messages more memorable than factual claims. Second, audiences who identify with a story's characters are more likely to adopt the values or behaviours those characters model. Summarize the lecture.",
    difficulty: "Target" as Difficulty
  },
  {
    title: "TOEFL Task 4 Lecture Summary 30",
    prompt: "Lecture summary: The professor explains two types of symbiotic relationships that help plants survive in nutrient-poor soils. The first is a partnership with mycorrhizal fungi, which extend the plant's root system and improve mineral absorption. The second is nitrogen fixation, in which bacteria living in the roots of legume plants convert atmospheric nitrogen into a form the plant can use as fertiliser. Summarize the lecture.",
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

export function getUnseenPromptTemplate(
  examType: ExamType,
  taskType: TaskType,
  difficulty: Difficulty,
  seenIds: string[],
  promptId?: string
): PromptTemplate {
  if (promptId) {
    const exact = templates.find((t) => t.id === promptId);
    if (exact) return exact;
  }

  const seenSet = new Set(seenIds);

  const exactUnseen = templates.filter(
    (t) => t.examType === examType && t.taskType === taskType && t.difficulty === difficulty && !seenSet.has(t.id)
  );
  if (exactUnseen.length) return pickRandom(exactUnseen);

  const taskUnseen = templates.filter(
    (t) => t.examType === examType && t.taskType === taskType && !seenSet.has(t.id)
  );
  if (taskUnseen.length) return pickRandom(taskUnseen);

  // All seen — fall back to random (cycle through)
  return getPromptTemplate(examType, taskType, difficulty, promptId);
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
