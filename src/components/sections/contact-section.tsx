"use client";

import { useActionState } from 'react';
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { useLocale } from "@/contexts/locale-provider";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { submitContactForm } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Sending..." : t("contact.submit")}
    </Button>
  );
}

export default function ContactSection() {
  const { t } = useLocale();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState = { message: null, errors: {}, isSuccess: false };
  const [state, dispatch] = useActionState(submitContactForm, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.isSuccess) {
        toast({
          title: "Success",
          description: state.message,
        });
        formRef.current?.reset();
      } else {
        toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  return (
    <section id="contact">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline font-bold text-center">
            {t("contact.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={dispatch} className="space-y-4">
            <div>
              <Input
                name="name"
                placeholder={t("contact.name")}
                aria-label={t("contact.name")}
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>
              )}
            </div>
            <div>
              <Input
                name="email"
                type="email"
                placeholder={t("contact.email")}
                aria-label={t("contact.email")}
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>
              )}
            </div>
            <div>
              <Textarea
                name="message"
                placeholder={t("contact.message")}
                aria-label={t("contact.message")}
                required
              />
              {state.errors?.message && (
                <p className="text-sm text-destructive mt-1">{state.errors.message[0]}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
