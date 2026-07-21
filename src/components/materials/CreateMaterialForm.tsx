import z from "zod";
import { MATERIAL_UNITS, type MaterialUnit } from "../../../convex/constants";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { CalculatorIcon, NotebookPenIcon, UserIcon } from "lucide-react";
import { cn } from "#/lib/utils";
import { Button } from "../ui/button";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

const createMaterialSchema = z.object({
  name: z.string(),
  code: z.optional(z.string()),
  description: z.optional(z.string()),
  unit: z.enum(MATERIAL_UNITS.map((u) => u.value) as [MaterialUnit, ...MaterialUnit[]]),
  trackingMode: z.enum(["calculated", "log_only", "supplier_local"]),
});

type CreateMaterialForm = z.infer<typeof createMaterialSchema>;

const TRACKING_MODE_OPTIONS = [
  {
    value: "calculated",
    label: "Calculated",
    icon: CalculatorIcon,
  },
  {
    value: "log_only",
    label: "Log Only",
    icon: NotebookPenIcon,
  },
  {
    value: "supplier_local",
    label: "Supplier Local",
    icon: UserIcon,
  },
] as const;

export default function CreateMaterialForm() {
  const createMaterial = useMutation(api.materials.create);

  const form = useForm<CreateMaterialForm>({
    resolver: zodResolver(createMaterialSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: CreateMaterialForm) => {
    try {
      await createMaterial({
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        unit: data.unit,
        trackingMode: data.trackingMode,
      });
      toast.success(`Material "${data.name}" berhasil dibuat`);
      form.reset();
      await navigate({
        to: "/materials",
      });
    } catch (err) {
      const message =
        err instanceof ConvexError ? (err.data as string) : "Gagal membuat material, coba lagi";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 px-6">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input {...field} aria-invalid={fieldState.invalid} className="bg-muted" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Description <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input {...field} aria-invalid={fieldState.invalid} className="bg-muted" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-6">
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                Code <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} className="bg-muted" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="unit"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Unit</FieldLabel>
              <NativeSelect {...field}>
                {MATERIAL_UNITS.map((u) => (
                  <NativeSelectOption key={u.value} value={u.value}>
                    {u.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="trackingMode"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Tracking Mode</FieldLabel>
            <div className="grid gap-3">
              {TRACKING_MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border bg-muted",
                    )}
                  >
                    <Icon
                      className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit">Create</Button>
    </form>
  );
}
