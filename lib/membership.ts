import { MemberProfile, PlanLimits, SubscriptionPlan } from "@/lib/types";

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    sessionsPerDay: 4,
    speakingMinutesPerDay: 8,
    label: "Free",
    price: 0
  },
  plus: {
    sessionsPerDay: 18,
    speakingMinutesPerDay: 35,
    label: "Plus",
    price: 9
  },
  pro: {
    sessionsPerDay: 40,
    speakingMinutesPerDay: 90,
    label: "Pro",
    price: 12
  }
};

export function createGuestProfile(): MemberProfile {
  return {
    id: `guest-${crypto.randomUUID()}`,
    email: "guest@speakace.local",
    name: "Guest learner",
    role: "guest",
    plan: "free",
    emailVerified: true,
    createdAt: new Date().toISOString()
  };
}

export function createMemberProfile(email: string, name?: string): MemberProfile {
  const normalizedName = name?.trim() || email.split("@")[0] || "Learner";

  return {
    id: `user-${crypto.randomUUID()}`,
    email,
    name: normalizedName,
    role: "member",
    plan: "free",
    emailVerified: false,
    createdAt: new Date().toISOString()
  };
}
