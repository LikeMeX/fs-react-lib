import { createContext, useContext, type ReactNode } from "react";

type Lang = "en" | "th";
type Messages = Record<Lang, Record<string, string>>;

const Ctx = createContext<{ lang: Lang; messages: Messages } | null>(null);

export function I18nProvider({
  lang,
  messages,
  children,
}: {
  lang: Lang;
  messages: Messages;
  children: ReactNode;
}) {
  return <Ctx.Provider value={{ lang, messages }}>{children}</Ctx.Provider>;
}

export function useT() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return (key: string) => ctx.messages[ctx.lang]?.[key] ?? key;
}
