interface ProseLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ProseLayout({ title, subtitle, children }: ProseLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <hr className="mb-8 border-foreground/10" />
      <div className="space-y-8 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}
