import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn("inline-flex items-center font-display font-black tracking-tight text-2xl select-none", className)}
      aria-label={BRAND.name}
    >
      <span className="relative text-[#5FA618] font-extrabold tracking-tight">
        {BRAND.nameParts[0]}
        <span className="absolute -top-1.5 right-0.5 flex items-center gap-[2px] pointer-events-none" aria-hidden="true">
          <span className="w-1 h-1 rounded-full bg-[#8CC63F]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#5FA618] -translate-y-0.5" />
          <span className="w-1 h-1 rounded-full bg-[#3B6A0E]" />
        </span>
      </span>
      <span className="text-[#17170F] font-extrabold tracking-tight">{BRAND.nameParts[1]}</span>
    </div>
  );
}


