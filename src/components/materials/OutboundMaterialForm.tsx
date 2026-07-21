import { useMutation, useQuery } from "convex/react";
import z from "zod";
import { api } from "../../../convex/_generated/api";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { Id } from "../../../convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { MaterialItemRow } from "./ItemRow";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

export const outboundMaterialSchema = z.object({
  houseUnitId: z.custom<Id<"units">>((val) => typeof val === "string" && val.length > 0, {
    message: "Unit rumah wajib dipilih",
  }),
  takenBy: z.string().min(1, "Nama pengambil wajib diisi"),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        materialId: z.custom<Id<"materials">>((val) => typeof val === "string" && val.length > 0, {
          message: "Material wajib dipilih",
        }),
        quantity: z.number().positive("Qty harus lebih dari 0"),
        unit: z.string().min(1, "Unit wajib diisi"),
      }),
    )
    .min(1, "Minimal 1 item"),
});

export type OutboundMaterialForm = z.infer<typeof outboundMaterialSchema>;
export type InboundMaterialFormInput = z.input<typeof outboundMaterialSchema>;

export default function OutboundMaterialForm() {
  const createUsage = useMutation(api.materialUsages.create);
  const navigate = useNavigate();

  const units = useQuery(api.units.list);

  const form = useForm<InboundMaterialFormInput>({
    resolver: zodResolver(outboundMaterialSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(data: OutboundMaterialForm) {
    try {
      const items = data.items.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      await createUsage({
        houseUnitId: data.houseUnitId,
        takenBy: data.takenBy,
        note: data.note || undefined,
        items,
      });

      toast.success("Material usage recorded");
      form.reset({ houseUnitId: undefined, takenBy: "", note: "", items: [] });
      await navigate({ to: "/" }); // sesuaikan tujuan redirect
    } catch (err) {
      const message =
        err instanceof ConvexError
          ? (err.data as string)
          : "Failed to record material usage, please try again";
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
        name="houseUnitId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Unit</FieldLabel>
            <NativeSelect {...field}>
              {units?.map((unit) => (
                <NativeSelectOption key={unit._id} value={unit._id}>
                  {unit.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="takenBy"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Taken By</FieldLabel>
            <Input {...field} aria-invalid={fieldState.invalid} className="bg-muted" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="note"
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
