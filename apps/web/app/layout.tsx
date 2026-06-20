import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diligence Readiness Layer",
  description: "Operator-reviewed evidence intelligence for fundraising preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
