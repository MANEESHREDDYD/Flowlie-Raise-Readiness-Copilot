import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowlie Raise Readiness Copilot",
  description: "Flowlie Raise Readiness Copilot — operator-reviewed evidence intelligence for fundraising preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
