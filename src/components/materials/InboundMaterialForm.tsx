import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { MATERIAL_UNITS, type MaterialUnit } from "../../../convex/constants";
import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { MaterialItemRow } from "./ItemRow";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useNavigate } from "@tanstack/react-router";

export const inboundMaterialSchema = z.object({
  notes: z.string().optional(),
  items: z.array(
    z.object({
      materialId: z.custom<Id<"materials">>(),
      quantity: z.number().positive("Qty harus lebih dari 0"),
      unit: z.enum(MATERIAL_UNITS.map((u) => u.value) as [MaterialUnit, ...MaterialUnit[]]),
    }),
  ),
});

export type InboundMaterialFormInput = z.input<typeof inboundMaterialSchema>;

export type InboundMaterialForm = z.output<typeof inboundMaterialSchema>;

export default function InboundMaterialForm() {
  const createDeliveries = useMutation(api.deliveries.create);
  const navigate = useNavigate();

  const form = useForm<InboundMaterialFormInput>({
    resolver: zodResolver(inboundMaterialSchema),
    defaultValues: {
      notes: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(data: InboundMaterialForm) {
    console.log(data);
    try {
      const items = data.items.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      await createDeliveries({
        notes: data.notes || undefined,
        items,
      });

      toast.success("Material delivery recorded");
      form.reset({ notes: "", items: [] });
      await navigate({ to: "/" });
    } catch (err) {
      const message =
        err instanceof ConvexError
          ? (err.data as string)
          : "Failed to record delivery, please try again";
      toast.error(message);
    }
  }
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log("Validation errors:", errors);
      })}
      className="flex flex-col gap-6 px-6"
    >
      <Controller
        name="notes"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Notes <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input {...field} aria-invalid={fieldState.invalid} className="bg-muted" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex flex-col gap-3">
        <FieldLabel>Items</FieldLabel>

        {fields.map((field, index) => (
          <MaterialItemRow
            key={field.id}
            control={form.control}
            index={index}
            onRemove={() => remove(index)}
            allowedTrackingModes={["calculated", "log_only"]}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              materialId: "" as Id<"materials">,
              quantity: 0,
              unit: "lembar",
            })
          }
        >
          <PlusIcon className="mr-2 size-4" />
          Add Item
        </Button>
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
