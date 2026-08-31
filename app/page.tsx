import PublicHeader from '@/components/public-header';
import LandingHero from '@/components/landing/hero';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-page)] font-sans text-[var(--color-text)]">
      <PublicHeader />
      <main className="grow flex flex-col">
        <LandingHero />
      </main>
      <footer className="lt-footer">
        <p>
          © 2026 LiveTrack logistics simulator. For demonstration and portfolio purposes
          only.
        </p>
      </footer>
    </div>
  );
}
