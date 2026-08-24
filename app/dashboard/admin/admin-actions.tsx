'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, PackageCheck, AlertTriangle } from 'lucide-react';
import { adminOverrideStatusAction } from '@/server/actions/shipment-actions';

interface AdminActionsProps {
  shipmentId: string;
  status: string;
}

export default function AdminActions({ shipmentId, status }: AdminActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleOverride = (nextStatus: 'delivered' | 'delayed') => {
    startTransition(async () => {
      const res = await adminOverrideStatusAction(shipmentId, nextStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Shipment marked as ${nextStatus}.`);
      }
    });
  };

  return (
    <div className="flex gap-2 justify-end">
      {status !== 'delivered' && (
        <button
          disabled={isPending}
          onClick={() => handleOverride('delivered')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PackageCheck className="h-3 w-3" />}
          Mark Delivered
        </button>
      )}
      {status !== 'delayed' && status !== 'delivered' && (
        <button
          disabled={isPending}
          onClick={() => handleOverride('delayed')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
          Mark Delayed
        </button>
      )}
    </div>
  );
}