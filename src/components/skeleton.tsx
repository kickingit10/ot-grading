'use client';

import { useTheme } from '@/lib/theme';

export function Skeleton({ className = '' }: { className?: string }) {
  const { isTaylorSwift: ts } = useTheme();
  return <div className={`animate-pulse rounded-lg ${ts ? 'bg-white/[0.06]' : 'bg-slate-200'} ${className}`} />;
}

export function SkeletonCard() {
  const { isTaylorSwift: ts } = useTheme();
  return (
    <div className={`p-5 rounded-xl border ${ts ? 'border-white/[0.06]' : 'border-slate-200'}`}>
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-8" /></div>
        <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /></div>
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => (<div key={i}><Skeleton className="h-3 w-12 mb-2" /><Skeleton className="h-9 w-full" /></div>))}
      </div>
      <Skeleton className="h-9 w-24 ml-auto" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map((i) => (<div key={i} className="flex items-center gap-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-12" /></div>))}
    </div>
  );
}
