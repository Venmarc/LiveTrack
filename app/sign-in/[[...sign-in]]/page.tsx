import { ClerkProvider, SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <ClerkProvider>
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <SignIn />
      </main>
    </ClerkProvider>
  );
}