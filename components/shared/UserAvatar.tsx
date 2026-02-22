import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16" };

export function UserAvatar({
  src,
  name,
  size = "sm",
  className,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], "rounded-sm", className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="rounded-sm bg-primary/15 text-sm font-medium text-foreground">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
