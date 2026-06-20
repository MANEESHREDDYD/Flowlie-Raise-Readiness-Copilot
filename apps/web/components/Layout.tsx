import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <div><Sidebar/><main className="min-h-screen px-5 py-7 lg:ml-64 lg:px-10 lg:py-10">{children}</main></div>;
}
