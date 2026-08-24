import { ClerkProvider } from '@clerk/nextjs';

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}