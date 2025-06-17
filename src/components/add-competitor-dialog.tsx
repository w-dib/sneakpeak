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
import { PlusCircle, XCircle } from "lucide-react";

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
  const [pdpUrls, setPdpUrls] = useState<string[]>([""]);

  useEffect(() => {
    if (!state?.formErrors && state?.message) {
      formRef.current?.reset();
      setPdpUrls([""]);
      setIsOpen(false);
    }
  }, [state]);

  const addPdpUrlInput = () => {
    if (pdpUrls.length < 10) {
      setPdpUrls([...pdpUrls, ""]);
    }
  };

  const removePdpUrlInput = (index: number) => {
    const newPdpUrls = pdpUrls.filter((_, i) => i !== index);
    setPdpUrls(newPdpUrls);
  };

  const handlePdpUrlChange = (index: number, value: string) => {
    const newPdpUrls = [...pdpUrls];
    newPdpUrls[index] = value;
    setPdpUrls(newPdpUrls);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Competitor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Competitor</DialogTitle>
          <DialogDescription>
            Add a new competitor to this project.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch}>
          <input type="hidden" name="projectId" value={projectId} />
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
              <Label htmlFor="homepage">Homepage URL</Label>
              <Input
                id="homepage"
                name="homepage"
                placeholder="https://competitor.com"
              />
              {state?.formErrors?.homepage && (
                <p className="text-sm font-medium text-destructive">
                  {state.formErrors.homepage}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop">Shop URL</Label>
              <Input
                id="shop"
                name="shop"
                placeholder="https://competitor.com/shop"
              />
              {state?.formErrors?.shop && (
                <p className="text-sm font-medium text-destructive">
                  {state.formErrors.shop}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Product Page URLs (PDPs)</Label>
              {pdpUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    name="pdps"
                    value={url}
                    onChange={(e) => handlePdpUrlChange(index, e.target.value)}
                    placeholder={`https://competitor.com/product/${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePdpUrlInput(index)}
                    disabled={pdpUrls.length === 1 && url === ""}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {state?.formErrors?.pdps && (
                <p className="text-sm font-medium text-destructive">
                  {state.formErrors.pdps}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addPdpUrlInput}
                disabled={pdpUrls.length >= 10}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add PDP URL
              </Button>
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
