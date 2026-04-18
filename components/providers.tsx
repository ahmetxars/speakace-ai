"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { defaultLanguage, isSupportedLanguage, Language } from "@/lib/copy";
import { createGuestProfile } from "@/lib/membership";
import { trackClientEvent } from "@/lib/analytics-client";
import { MemberProfile, SubscriptionPlan } from "@/lib/types";

export type ThemeMode = "light" | "dark";

interface AppContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  signedIn: boolean;
  signOut: () => Promise<void>;
  currentUser: MemberProfile | null;
  setGuestProfile: (profile: MemberProfile) => Promise<void>;
  refreshSession: () => Promise<void>;
  updatePlan: (plan: SubscriptionPlan) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [signedIn, setSignedInState] = useState(false);
  const [currentUser, setCurrentUser] = useState<MemberProfile | null>(null);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("speakace-language", nextLanguage);
    document.cookie = `speakace-language=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
    window.setTimeout(() => {
      window.location.reload();
    }, 10);
  };

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    window.localStorage.setItem("speakace-theme", nextTheme);
    document.body.dataset.theme = nextTheme;
  };

  const initializeUser = useCallback(async (storedUser: string | null) => {
    const sessionResponse = await fetch("/api/auth/session");
    const sessionData = (await sessionResponse.json()) as { profile: MemberProfile | null };

    if (sessionData.profile) {
      setCurrentUser(sessionData.profile);
      setSignedInState(true);
      window.localStorage.setItem("speakace-user", JSON.stringify(sessionData.profile));
      return;
    }

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as MemberProfile;
      if (parsedUser.role === "guest") {
        setCurrentUser(parsedUser);
        setSignedInState(false);
        return;
      }
    }

    const guest = createGuestProfile();
    setCurrentUser(guest);
    setSignedInState(false);
    window.localStorage.setItem("speakace-user", JSON.stringify(guest));
  }, []);

  useEffect(() => {
    if (!currentUser?.id || !pathname) return;
    if (!signedIn && !pathname.startsWith("/app")) return;
    void trackClientEvent({
      userId: currentUser.id,
      event: "page_view",
      path: pathname
    });
  }, [currentUser?.id, pathname, signedIn]);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("speakace-language");
    const storedTheme = window.localStorage.getItem("speakace-theme");
    const storedUser = window.localStorage.getItem("speakace-user");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (isSupportedLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
      document.cookie = `speakace-language=${storedLanguage}; path=/; max-age=31536000; samesite=lax`;
    } else {
      document.cookie = `speakace-language=${defaultLanguage}; path=/; max-age=31536000; samesite=lax`;
    }

    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeState(storedTheme);
      document.body.dataset.theme = storedTheme;
    } else {
      const systemTheme: ThemeMode = mediaQuery.matches ? "dark" : "light";
      setThemeState(systemTheme);
      document.body.dataset.theme = systemTheme;
    }

    void initializeUser(storedUser);
  }, [initializeUser]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      const storedTheme = window.localStorage.getItem("speakace-theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        return;
      }
      const nextTheme: ThemeMode = event.matches ? "dark" : "light";
      setThemeState(nextTheme);
      document.body.dataset.theme = nextTheme;
    };

    mediaQuery.addEventListener("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, []);

  const setGuestProfile = async (profile: MemberProfile) => {
    setCurrentUser(profile);
    setSignedInState(false);
    window.localStorage.setItem("speakace-user", JSON.stringify(profile));
  };

  const refreshSession = async () => {
    const sessionResponse = await fetch("/api/auth/session");
    const sessionData = (await sessionResponse.json()) as { profile: MemberProfile | null };

    if (sessionData.profile) {
      setCurrentUser(sessionData.profile);
      setSignedInState(true);
      window.localStorage.setItem("speakace-user", JSON.stringify(sessionData.profile));
      return;
    }

    setSignedInState(false);
  };

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    const guest = createGuestProfile();
    setCurrentUser(guest);
    setSignedInState(false);
    window.localStorage.setItem("speakace-user", JSON.stringify(guest));
  };

  const updatePlan = async (plan: SubscriptionPlan) => {
    if (!currentUser) {
      return;
    }

    if (signedIn) {
      const response = await fetch("/api/account/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const raw = await response.text();
      let data: { profile?: MemberProfile } = {};
      try {
        data = raw ? (JSON.parse(raw) as { profile?: MemberProfile }) : {};
      } catch {
        data = {};
      }
      if (response.ok && data.profile) {
        setCurrentUser(data.profile);
        window.localStorage.setItem("speakace-user", JSON.stringify(data.profile));
      }
      return;
    }

    const nextUser = { ...currentUser, plan };
    setCurrentUser(nextUser);
    window.localStorage.setItem("speakace-user", JSON.stringify(nextUser));
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, signedIn, signOut, currentUser, setGuestProfile, refreshSession, updatePlan }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within Providers");
  }
  return context;
}
