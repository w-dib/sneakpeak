"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCompetitor, CompetitorState } from "@/lib/actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Competitor"}
    </Button>
  );
}

export function AddCompetitorDialog({ projectId }: { projectId: string }) {
  const initialState: CompetitorState = { message: null, formErrors: {} };
  const [state, dispatch] = useFormState(createCompetitor, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state?.formErrors && state?.message) {
      formRef.current?.reset();
      setIsOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Competitor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Competitor</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={dispatch}>
          <input type="hidden" name="projectId" value={projectId} />
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Pro Tip!</AlertTitle>
            <AlertDescription>
              Provide the URL to the main Shop or All Products page. The system
              will find all product links on that page.
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Competitor Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Awesome Competitor Inc."
              />
              {state?.formErrors?.name && (
                <p className="text-sm font-medium text-destructive">
                  {state.formErrors.name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop-url">Shop / Collection URL</Label>
              <Input
                id="shop-url"
                name="shop"
                placeholder="https://competitor.com/collections/all"
              />
              {state?.formErrors?.shop && (
                <p className="text-sm font-medium text-destructive">
                  {state.formErrors.shop}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
