'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { selectUserRoleAction, ensureProfile } from '@/server/actions/auth-actions';
import { PackagePlus, Truck, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type RoleOption = 'shipper' | 'driver' | 'recipient';

export default function OnboardPage() {
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      ensureProfile().catch((err) => console.error('Failed to sync profile fallback:', err));
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handleSelectRole = (role: RoleOption) => {
    setSelectedRole(role);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue.');
      return;
    }

    setIsSubmitting(true);
    const result = await selectUserRoleAction(selectedRole);

    if (result.success) {
      toast.success(`Role set to ${selectedRole} successfully!`);
      // Reload the Clerk user token claims so middleware sees the new role
      await user?.reload();
      router.refresh();
      router.push(`/dashboard/${selectedRole}`);
    } else {
      toast.error(result.error || 'Failed to update your role. Please try again.');
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'shipper' as RoleOption,
      title: 'Shipper',
      description: 'Create and dispatch packages, define origins/destinations, and manage your inventory shipments.',
      icon: PackagePlus,
      color: 'border-blue-500/20 hover:border-blue-500/60 text-blue-400 focus-within:ring-blue-500',
      activeColor: 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/20',
    },
    {
      id: 'driver' as RoleOption,
      title: 'Courier Driver',
      description: 'Claim available package deliveries, stream real-time GPS locations, and trigger delivery status changes.',
      icon: Truck,
      color: 'border-emerald-500/20 hover:border-emerald-500/60 text-emerald-400 focus-within:ring-emerald-500',
      activeColor: 'border-emerald-500 ring-2 ring-emerald-500/50 bg-emerald-950/20',
    },
    {
      id: 'recipient' as RoleOption,
      title: 'Recipient',
      description: 'Track incoming package deliveries, view live coordinates on Leaflet maps, and access event history.',
      icon: User,
      color: 'border-indigo-500/20 hover:border-indigo-500/60 text-indigo-400 focus-within:ring-indigo-500',
      activeColor: 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/20',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8 bg-zinc-950">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span>🚚</span>
            <span>Welcome to LiveTrack</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-outfit sm:text-5xl">
            Choose your profile role
          </h1>
          <p className="text-base text-zinc-400 max-w-xl font-sans">
            Select how you would like to participate in the LiveTrack real-time simulation. You can switch accounts or open another window to test multiple roles simultaneously.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`relative flex flex-col text-left p-6 rounded-2xl bg-zinc-900/50 border backdrop-blur-md transition-all duration-300 group ${
                  isSelected ? role.activeColor : role.color
                }`}
              >
                <div className={`p-3 rounded-xl bg-zinc-800/80 mb-4 inline-block`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-outfit mb-2">
                  {role.title}
                </h3>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-zinc-900">
          <div className="text-xs text-zinc-500">
            🔒 Secured using Clerk Authentication & Supabase RLS policies
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg hover:shadow-blue-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up Profile...
              </>
            ) : (
              <>
                Confirm Role
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}
