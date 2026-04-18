export type ExamType = "IELTS" | "TOEFL";

export type TaskType =
  | "ielts-part-1"
  | "ielts-part-2"
  | "ielts-part-3"
  | "toefl-task-1"
  | "toefl-task-2"
  | "toefl-task-3"
  | "toefl-task-4"
  | "toefl-independent"
  | "toefl-integrated";

export type Difficulty = "Starter" | "Target" | "Stretch";

export type SubscriptionPlan = "free" | "plus" | "pro" | "lifetime";
export type BillingStatus =
  | "free"
  | "active"
  | "on_trial"
  | "paused"
  | "cancelled"
  | "past_due"
  | "expired"
  | "refunded";
export type UserRole = "guest" | "member";
export type EnrollmentStatus = "pending" | "approved";
export type MemberType = "student" | "teacher" | "school";

export type FeedbackCategory =
  | "fluency"
  | "coherence"
  | "lexicalResource"
  | "grammar"
  | "delivery"
  | "languageUse"
  | "topicDevelopment";

export interface ScoreCategory {
  category: FeedbackCategory;
  score: number;
  label: string;
}

export interface ScoreReport {
  overall: number;
  scaleLabel: string;
  categories: ScoreCategory[];
  strengths: string[];
  improvements: string[];
  nextExercise: string;
  caution: string;
  fillerWords: string[];
  improvedAnswer: string;
}

export interface PromptTemplate {
  id: string;
  examType: ExamType;
  taskType: TaskType;
  title: string;
  prompt: string;
  prepSeconds: number;
  speakingSeconds: number;
  difficulty: Difficulty;
}

export interface SpeakingSession {
  id: string;
  userId: string;
  examType: ExamType;
  taskType: TaskType;
  difficulty: Difficulty;
  plan: SubscriptionPlan;
  prompt: PromptTemplate;
  createdAt: string;
  audioUploaded: boolean;
  audioBytes?: number;
  rawTranscript?: string;
  transcript?: string;
  transcriptQualityScore?: number;
  transcriptQualityLabel?: string;
  transcriptSource?: "openai" | "generated";
  transcriptStatus?: string;
  report?: ScoreReport;
}

export interface MemberProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  memberType: MemberType;
  organizationName?: string | null;
  plan: SubscriptionPlan;
  billingStatus?: BillingStatus;
  lemonCustomerId?: string | null;
  lemonSubscriptionId?: string | null;
  trialEndsAt?: string | null;
  referralCodeUsed?: string | null;
  emailVerified?: boolean;
  isAdmin?: boolean;
  isTeacher?: boolean;
  adminAccess?: boolean;
  teacherAccess?: boolean;
  createdAt: string;
}

export interface PlanLimits {
  sessionsPerDay: number;
  speakingMinutesPerDay: number;
  label: string;
  price: number;
}

export interface ProgressSummary {
  totalSessions: number;
  averageScore: number;
  streakDays: number;
  freeSessionsRemaining: number;
  remainingMinutesToday: number;
  currentPlan: SubscriptionPlan;
  recentSessions: SpeakingSession[];
}

export interface TeacherClass {
  id: string;
  teacherId: string;
  name: string;
  joinCode: string;
  createdAt: string;
  approvalRequired?: boolean;
  joinMessage?: string | null;
}

export interface StudentClassMembership {
  classId: string;
  className: string;
  teacherName: string;
  teacherEmail: string;
  joinCode: string;
  joinedAt: string;
  status?: EnrollmentStatus;
}

export interface TeacherNote {
  id: string;
  teacherId: string;
  studentId: string;
  sessionId?: string;
  note: string;
  tags?: string[];
  createdAt: string;
}

export interface TeacherStudentOverview {
  student: MemberProfile;
  totalSessions: number;
  averageScore: number;
  bestScore: number | null;
  weakestSkill: string | null;
  lastSessionTitle: string | null;
  lastExamType?: ExamType | null;
  lastTaskType?: TaskType | null;
  scoreDelta?: number | null;
  lastActiveAt?: string | null;
  riskFlags?: string[];
}

export interface TeacherClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  totalAttempts: number;
  classAverageScore: number;
  classBestScore: number | null;
  mostCommonWeakestSkill: string | null;
  homeworkCompletionRate?: number;
  overdueHomeworkCount?: number;
  dueSoonHomeworkCount?: number;
  pendingApprovalCount?: number;
  atRiskStudentCount?: number;
}

export type InstitutionPlan = "starter" | "team" | "campus";

export interface InstitutionBillingSummary {
  teacherId: string;
  plan: InstitutionPlan;
  status: "draft" | "active";
  seatCount: number;
  monthlyPrice: number;
  includedClasses: number;
  includedStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkAssignment {
  id: string;
  teacherId: string;
  studentId: string;
  classId?: string;
  title: string;
  instructions: string;
  focusSkill: string;
  recommendedTaskType: TaskType;
  promptId?: string;
  dueAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface HomeworkAutoAssignRule {
  classId: string;
  teacherId: string;
  enabled: boolean;
  scoreThreshold: number;
  dueDays: number;
  examType?: ExamType | "all";
  taskType?: TaskType | "all";
  focusSkill?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherHomeworkOverview {
  assignment: HomeworkAssignment;
  studentName: string;
  studentEmail: string;
}

export interface StudyListFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface StudyListItem {
  id: string;
  folderId: string;
  promptId: string;
  examType: ExamType;
  taskType: TaskType;
  difficulty: Difficulty;
  title: string;
  createdAt: string;
}

export interface StudyListTask {
  id: string;
  folderId: string;
  title: string;
  note?: string;
  dueAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StudyTaskReminder {
  id: string;
  taskId: string;
  userId: string;
  milestonePercent: number;
  title: string;
  body: string;
  href?: string;
  emailSentAt?: string | null;
  createdAt: string;
}

export interface SharedClassStudyItem {
  id: string;
  classId: string;
  teacherId: string;
  promptId: string;
  examType: ExamType;
  taskType: TaskType;
  difficulty: Difficulty;
  title: string;
  note?: string;
  createdAt: string;
}

export interface TeacherEnrollmentRequest {
  classId: string;
  student: MemberProfile;
  requestedAt: string;
}

export interface StudentProfile {
  userId: string;
  preferredExamType: ExamType;
  targetScore: number | null;
  weeklyGoal: number;
  dailyMinutesGoal?: number;
  studyDays: string[];
  currentLevel: string;
  focusSkill: string;
  examDate?: string | null;
  targetReason?: string;
  discoverySource?: string;
  bio?: string;
  onboardingComplete?: boolean;
  updatedAt: string;
}

export interface AnnouncementItem {
  id: string;
  authorId: string;
  audienceType: "global" | "teacher" | "class";
  classId?: string | null;
  title: string;
  body: string;
  createdAt: string;
}

export interface InstitutionUserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  memberType: MemberType;
  organizationName?: string | null;
  plan: SubscriptionPlan;
  emailVerified?: boolean;
  adminAccess?: boolean;
  teacherAccess?: boolean;
  createdAt: string;
}

export interface InstitutionAnalyticsSummary {
  totalClasses: number;
  totalStudents: number;
  activeStudents: number;
  totalAttempts: number;
  averageScore: number;
  homeworkCompletionRate: number;
  overdueHomeworkCount: number;
  dueSoonHomeworkCount: number;
  pendingApprovalCount: number;
  atRiskStudentCount: number;
  mostCommonWeakestSkill: string | null;
  teacherNoteCoverage: number;
  improvementAverage: number;
  classes: TeacherClassAnalytics[];
}

export interface StudentComparison {
  left: TeacherStudentOverview;
  right: TeacherStudentOverview;
  scoreGap: number;
  sessionGap: number;
  strongerAreas: string[];
}

export interface BillingEventRecord {
  id: string;
  provider: "lemonsqueezy";
  eventName: string;
  userEmail: string | null;
  userId?: string | null;
  plan: SubscriptionPlan;
  billingStatus: BillingStatus;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  createdAt: string;
}

export interface AdminPanelSession {
  adminUserId?: string | null;
  adminLabel: string;
  authMode: "config" | "member";
  expiresAt: string;
}

export interface AdminOverview {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  paidMembers: number;
  trialMembers: number;
  activeSessions: number;
  recentSignIns24h: number;
  classesCount: number;
  monthlyRevenueEstimate: number;
  liveUsers5m: number;
  requests5m: number;
  pageViews1h: number;
  lastRequestAt?: string | null;
  ctaClicks7d: number;
  ctaClicks30d: number;
  checkoutClicks7d: number;
  checkoutClicks30d: number;
  topCtas: Array<{
    path: string;
    event: string;
    count: number;
  }>;
  topCtaPages: Array<{
    page: string;
    clicks: number;
    checkoutClicks: number;
  }>;
  ctaTrend14d: Array<{
    date: string;
    ctaClicks: number;
    signupCount: number;
    checkoutClicks: number;
    paidCount: number;
  }>;
  funnel7d: {
    ctaClicks: number;
    signupCount: number;
    checkoutClicks: number;
    paidCount: number;
    clickToSignupRate: number;
    signupToCheckoutRate: number;
    checkoutToPaidRate: number;
    clickToPaidRate: number;
  };
  funnel30d: {
    ctaClicks: number;
    signupCount: number;
    checkoutClicks: number;
    paidCount: number;
    clickToSignupRate: number;
    signupToCheckoutRate: number;
    checkoutToPaidRate: number;
    clickToPaidRate: number;
  };
}

export interface AdminMemberRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberType: MemberType;
  organizationName?: string | null;
  plan: SubscriptionPlan;
  billingStatus: BillingStatus;
  trialEndsAt?: string | null;
  referralCodeUsed?: string | null;
  emailVerified: boolean;
  passwordStatus: "protected" | "no_password";
  createdAt: string;
  monthlyValue: number;
  activeSessionCount: number;
  lastSignInAt?: string | null;
  lastSignOutAt?: string | null;
  totalPracticeSessions: number;
  averageScore?: number | null;
  teacherNoteCount: number;
  emailLog?: Array<{
    id: string;
    template: string;
    subject: string;
    status: string;
    sentAt: string;
    errorMessage?: string | null;
  }>;
}

export interface AdminAuthActivityRecord {
  id: string;
  userId?: string | null;
  userName: string;
  userEmail: string;
  memberType?: MemberType | null;
  eventType: "signin" | "signout";
  occurredAt: string;
}

export interface ReferralCodeRecord {
  id: string;
  code: string;
  label?: string | null;
  trialDays: number;
  active: boolean;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: string;
}

export interface AdminInstitutionRecord {
  organizationName: string;
  teachers: number;
  students: number;
  schools: number;
  averageScore?: number | null;
  totalSessions: number;
}

export interface AdminCustomPostRecord {
  id: string;
  slug: string;
  language: string;
  title: string;
  description: string;
  status: "draft" | "published";
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface CustomBlogPost {
  id: string;
  slug: string;
  language: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}
