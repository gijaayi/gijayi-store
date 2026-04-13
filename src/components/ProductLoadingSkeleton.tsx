'use client';

export default function ProductLoadingSkeleton() {
  return (
    <div className="min-h-[80vh] grid xl:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-12">
      {/* Image Skeleton */}
      <div className="space-y-3">
        {/* Main image placeholder */}
        <div className="relative bg-gradient-to-br from-slate-200 to-slate-100 aspect-square rounded-2xl animate-pulse" />
        
        {/* Thumbnail placeholders */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-slate-200 to-slate-100 aspect-square rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Category */}
        <div className="h-3 w-24 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 w-3/4 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
          <div className="h-6 w-1/2 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="h-7 w-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
        </div>

        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <div className="flex-1 h-12 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse" />
          <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse" />
          <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse" />
        </div>

        {/* Highlights */}
        <div className="space-y-2 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse shrink-0" />
              <div className="h-4 flex-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
