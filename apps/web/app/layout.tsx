import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiligenceOps Console",
  description: "An evidence-to-diligence operator workbench for fundraising preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
