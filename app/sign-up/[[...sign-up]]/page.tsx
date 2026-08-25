import { ClerkProvider, SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <ClerkProvider>
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <SignUp />
      </main>
    </ClerkProvider>
  );
}