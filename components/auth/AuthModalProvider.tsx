"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthModalContent } from "./AuthModalContent";

type AuthModalOptions = {
  message?: string;
};

type AuthModalContextValue = {
  openAuthModal: (opts?: AuthModalOptions) => void;
};

const AuthModalContext = createContext<AuthModalContextValue>({
  openAuthModal: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const wasOpenRef = useRef(false);

  const openAuthModal = useCallback((opts?: AuthModalOptions) => {
    setMessage(opts?.message);
    setOpen(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && wasOpenRef.current) {
        setOpen(false);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    wasOpenRef.current = open;
  }, [open]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center text-2xl">Join HalaSaves</DialogTitle>
            <DialogDescription className="text-center">
              {message || "Sign in to share and discover deals in the UAE"}
            </DialogDescription>
          </DialogHeader>
          <AuthModalContent />
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}
