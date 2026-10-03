"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import { createContentSchema, type CreateContentInput } from "@repo/validation";
import { useCreateContentMutation } from "../api/content-api";

interface CreateContentDialogProps {
  trigger?: React.ReactNode;
}

export function CreateContentDialog({ trigger }: CreateContentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { currentWorkspace } = useAppSelector((state) => state.auth);
  const [createContent, { isLoading }] = useCreateContentMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateContentInput>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "youtube-long",
      language: currentWorkspace?.language || "en",
      niche: currentWorkspace?.niche || "",
      platformAccountIds: [],
    },
  });

  const selectedContentType = watch("contentType");

  async function onSubmit(data: CreateContentInput) {
    if (!currentWorkspace) {
      toast.error("Please select a workspace first");
      return;
    }

    try {
      const result = await createContent(data).unwrap();
      toast.success("Content item created successfully!");
      reset();
      setOpen(false);
      router.push(`/dashboard/content/${result.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { error?: { message?: string } } }).data?.error?.message
          : "Failed to create content item";
      toast.error(message || "Failed to create content item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button id="btn-create-content" className="gap-2">
            <Plus className="h-4 w-4" />
            New Content
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogDescription>
            Start a new content piece for your automated pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="content-title">Title *</Label>
            <Input
              id="content-title"
              placeholder="e.g. 10 Mind-Blowing AI Breakthroughs in 2026"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-[var(--destructive)]">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="content-type">Content Type *</Label>
              <Select
                value={selectedContentType}
                onValueChange={(val) =>
                  setValue("contentType", val as CreateContentInput["contentType"], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="content-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube-long">YouTube Long-Form</SelectItem>
                  <SelectItem value="youtube-short">YouTube Short</SelectItem>
                  <SelectItem value="facebook-video">Facebook Video</SelectItem>
                  <SelectItem value="facebook-reel">Facebook Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content-language">Language</Label>
              <Input
                id="content-language"
                placeholder="en"
                maxLength={10}
                {...register("language")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content-niche">Niche / Topic</Label>
            <Input
              id="content-niche"
              placeholder="e.g. Technology, Finance, Fitness"
              {...register("niche")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content-description">Initial Notes / Description</Label>
            <textarea
              id="content-description"
              rows={3}
              className="flex w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Key angles, target audience, or source links..."
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button id="btn-submit-create-content" type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create & Open"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
