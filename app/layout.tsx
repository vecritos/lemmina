import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lemmina",
  description: "Trace claims, evidence, dependencies, and unresolved risks in technical research.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
