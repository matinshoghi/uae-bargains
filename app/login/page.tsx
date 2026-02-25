import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthModalContent } from "@/components/auth/AuthModalContent";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join HalaSaves</CardTitle>
          <CardDescription>
            Sign in to share and discover deals in the UAE
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}
          <AuthModalContent />
        </CardContent>
      </Card>
    </div>
  );
}
