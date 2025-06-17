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
import { createProject, ProjectState } from "@/lib/actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Project"}
    </Button>
  );
}

export function AddProjectDialog() {
  const initialState: ProjectState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state.errors && state.message) {
      formRef.current?.reset();
      setIsOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project to start tracking competitors.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Your Awesome Project"
                className="col-span-3"
              />
            </div>
            {state?.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="text-sm font-medium text-destructive" key={error}>
                  {error}
                </p>
              ))}
            {state?.message && !state.errors && (
              <p className="text-sm font-medium text-destructive">
                {state.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
