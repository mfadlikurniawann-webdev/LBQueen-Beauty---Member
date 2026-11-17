import CustomerLayoutClient from "./layout-client";

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}
