// Authored, illustrative examples. No live score is generated here.
export const homeExamples = [
  {
    tag: "IELTS SPEAKING · PART 1",
    title: "The place <br>you call home.",
    question: "What do you like most about your hometown?",
    first:
      "“I like my hometown because it is <mark>very nice</mark> and the people are friendly. There are <mark>many things</mark> to do.”",
    retry:
      '“What I love most is the <mark class="improved">riverside market on Sunday mornings</mark>. I go there with my sister for breakfast, so it always feels like home.”',
    heading: "You have a point. Give it a picture.",
    feedback:
      "“Very nice” tells us how you feel. A specific place or memory tells us why. Add one example to develop your answer.",
    next: "Describe one place you enjoy visiting in your hometown.",
    retryHeading: "Now we can see what you mean.",
    retryFeedback:
      "A specific place, a personal detail, and a clear reason develop the answer. Keep that structure when you try a different question.",
    retryNext: "Try the same idea with another place you know well.",
  },
  {
    tag: "IELTS SPEAKING · PART 2",
    title: "A skill <br>worth learning.",
    question: "Describe a skill you would like to learn and explain why.",
    first:
      "“I want to learn cooking. It is <mark>useful</mark>. I think cooking is <mark>good</mark> and I want to be better at it.”",
    retry:
      '“I’d like to learn to cook <mark class="improved">a few simple meals from scratch</mark>. I’m moving away for university, so being able to make dinner would help me feel more independent.”',
    heading: "Go beyond naming the skill.",
    feedback:
      "Your answer gives a topic but little personal context. Explain when you would use the skill and what it would change for you.",
    next: "Connect the skill to a real situation in your life.",
    retryHeading: "Your reason gives the answer direction.",
    retryFeedback:
      "The university move gives a concrete reason for learning. A few simple meals also makes the goal easier to picture.",
    retryNext: "Add how you plan to learn this skill.",
  },
  {
    tag: "TOEFL-STYLE · OPINION PRACTICE",
    title: "Your view. <br>Your reasons.",
    question: "Do you prefer to study alone or with other people? Why?",
    first:
      "“I prefer to study alone because it is <mark>better for me</mark>. I can study more and I think it is <mark>a good way</mark>.”",
    retry:
      '“I prefer studying alone because <mark class="improved">I can spend more time on topics I find difficult</mark>. For example, before my last maths test, I repeated the same exercises until I understood them.”',
    heading: "Make your reason do the work.",
    feedback:
      "You have stated a preference. Now explain one benefit and support it with an example rather than repeating that it is better.",
    next: "Give one reason, followed by a short personal example.",
    retryHeading: "A reason plus an example makes it clear.",
    retryFeedback:
      "You explain the benefit of studying alone and show what it looked like before a test. That makes the opinion easier to follow.",
    retryNext:
      "Practise explaining the opposite preference with the same structure.",
  },
];
export const homeRoles = {
  students: {
    notes: [
      "One question, on my schedule.",
      "Feedback on my actual answer.",
      "One thing to try differently.",
    ],
    caption: "A little more confident, every time.",
    title: "Your practice. At your pace.",
    description:
      "Make room for speaking between everything else. Practise independently, review your attempts, and find a rhythm that works for you.",
    link: "Explore student practice",
    url: "https://speakace.org/for-students",
    label: "MY PRACTICE NOTES",
  },
  teachers: {
    notes: [
      "A speaking task for my class.",
      "Student attempts in one place.",
      "A clearer focus for our next lesson.",
    ],
    caption: "Keep the conversation going.",
    title: "Practice beyond the lesson.",
    description:
      "Assign speaking homework, review attempts, and see where your learners need support before the next class begins.",
    link: "Explore the teacher workflow",
    url: "https://speakace.org/for-teachers",
    label: "MY CLASS NOTES",
  },
  schools: {
    notes: [
      "A consistent practice routine.",
      "Teachers who can see the progress.",
      "A pilot before the next step.",
    ],
    caption: "Give every learner a voice.",
    title: "A shared rhythm for your programme.",
    description:
      "Bring a structured speaking practice loop to your programme. Start with a pilot and explore how it fits your teachers and learners.",
    link: "Explore school programmes",
    url: "https://speakace.org/for-schools",
    label: "OUR PROGRAMME NOTES",
  },
};

export const homeRolesTurkish: typeof homeRoles = {
  students: {
    notes: [
      "Kendi programımda bir soru.",
      "Kendi cevabıma geri bildirim.",
      "Farklı deneyeceğim bir şey.",
    ],
    caption: "Her seferinde biraz daha güvenle.",
    title: "Senin pratiğin. Senin tempon.",
    description:
      "Günlük hayatın içinde konuşmaya yer aç. Bağımsız çalış, denemelerini incele ve sana uyan ritmi bul.",
    link: "Öğrenci pratiğini keşfet",
    url: "/for-students",
    label: "PRATİK NOTLARIM",
  },
  teachers: {
    notes: [
      "Sınıfım için bir konuşma görevi.",
      "Öğrencilerimin denemeleri bir arada.",
      "Sonraki ders için daha net bir odak.",
    ],
    caption: "Sohbeti dersin ötesine taşı.",
    title: "Dersin ötesinde pratik.",
    description:
      "Konuşma ödevleri ver, denemeleri incele ve bir sonraki dersten önce öğrencilerinin nerede desteğe ihtiyaç duyduğunu gör.",
    link: "Öğretmen araçlarını keşfet",
    url: "/for-teachers",
    label: "SINIF NOTLARIM",
  },
  schools: {
    notes: [
      "Tutarlı bir pratik düzeni.",
      "Gelişimi görebilen öğretmenler.",
      "Sonraki adımdan önce bir pilot.",
    ],
    caption: "Her öğrenciye söz hakkı.",
    title: "Programınız için ortak bir ritim.",
    description:
      "Programınıza yapılandırılmış konuşma pratiği ekleyin. Bir pilotla başlayın; öğretmen ve öğrencilerinize nasıl uyduğunu keşfedin.",
    link: "Okul programlarını keşfet",
    url: "/for-schools",
    label: "PROGRAM NOTLARIMIZ",
  },
};
export const homeFeedbackTurkish = [
  {
    heading: "Bir fikrin var. Şimdi somutlaştır.",
    feedback:
      "“Very nice” hissettiğini anlatır. Belirli bir yer veya anı nedenini gösterir. Cevabını geliştirmek için bir örnek ekle.",
    next: "Memleketinde gitmekten hoşlandığın bir yeri anlat.",
    retryHeading: "Artık ne demek istediğin daha açık.",
    retryFeedback:
      "Belirli bir yer, kişisel bir ayrıntı ve net bir neden cevabını geliştiriyor. Başka bir soruda da bu yapıyı dene.",
    retryNext: "Aynı fikri iyi bildiğin başka bir yerle dene.",
  },
  {
    heading: "Becerinin adını söylemekle kalma.",
    feedback:
      "Konuyu söyledin, ama kişisel bağlam eksik. Beceriyi ne zaman kullanacağını ve hayatında neyi değiştireceğini açıkla.",
    next: "Beceriyi hayatındaki gerçek bir durumla ilişkilendir.",
    retryHeading: "Nedenin cevabına yön veriyor.",
    retryFeedback:
      "Üniversite için taşınmak, bu beceriyi öğrenmeye somut bir neden veriyor. Birkaç basit yemek hedefini de gözümüzde canlandırabiliyoruz.",
    retryNext: "Bu beceriyi nasıl öğreneceğini ekle.",
  },
  {
    heading: "Gerekçen fikrini taşısın.",
    feedback:
      "Tercihini belirttin. Şimdi yalnızca daha iyi olduğunu tekrarlamak yerine bir fayda açıkla ve örnekle destekle.",
    next: "Bir neden söyle, ardından kısa bir kişisel örnek ver.",
    retryHeading: "Bir neden ve bir örnekle daha net.",
    retryFeedback:
      "Yalnız çalışmanın faydasını ve sınav öncesinde nasıl uyguladığını açıklıyorsun. Fikrini takip etmek kolaylaşıyor.",
    retryNext: "Aynı yapıyla ters tercihi savunmayı dene.",
  },
];
