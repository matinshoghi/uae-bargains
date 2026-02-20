import { Separator } from "@/components/ui/separator";

interface ProseLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ProseLayout({ title, subtitle, children }: ProseLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <Separator className="mb-8" />
      <div className="space-y-8 text-sm leading-relaxed text-[#1d1d1f]">
        {children}
      </div>
    </div>
  );
}
