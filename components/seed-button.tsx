'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Database, Loader2 } from 'lucide-react';
import { seedMockShipmentsAction } from '@/server/actions/seed-actions';

export function SeedButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedMockShipmentsAction();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Successfully seeded 5 mock packages in various status lifecycles!');
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleSeed}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 whitespace-nowrap cursor-pointer"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Seeding Database...
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          Seed Demo Shipments
        </>
      )}
    </button>
  );
}
