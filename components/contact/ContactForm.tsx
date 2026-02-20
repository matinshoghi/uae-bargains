"use client";

import { useActionState, useState } from "react";
import { submitContact, type ContactFormState } from "@/lib/actions/contact";
import { CONTACT_CATEGORIES } from "@/lib/validations/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setCategory("");
    setMessage("");
  }

  const [state, formAction, isPending] = useActionState(
    async (prevState: ContactFormState, formData: FormData) => {
      const result = await submitContact(prevState, formData);
      if (result?.success) {
        toast.success("Message sent! We aim to respond within 48 hours.");
        resetForm();
      }
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {state?.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <input type="hidden" name="category" value={category} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.category && (
          <p className="text-sm text-red-500">{state.errors.category[0]}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Describe your enquiry..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        {state?.errors?.message && (
          <p className="text-sm text-red-500">{state.errors.message[0]}</p>
        )}
      </div>

      {/* Form-level error */}
      {state?.errors?.form && (
        <p className="text-sm text-red-500">{state.errors.form[0]}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
