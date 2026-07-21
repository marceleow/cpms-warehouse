import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { ConvexError } from "convex/values";

const createSupplierSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi").max(70, "Nama terlalu panjang"),
});

type CreateSupplierForm = z.infer<typeof createSupplierSchema>;

export default function CreateSupplierDrawer() {
  const [open, setOpen] = useState(false);
  const createSupplier = useMutation(api.suppliers.create);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<CreateSupplierForm>({
    resolver: zodResolver(createSupplierSchema),
  });

  const onSubmit = async (data: CreateSupplierForm) => {
    try {
      await createSupplier({ name: data.name });
      toast.success(`Supplier "${data.name}" berhasil dibuat`);
      reset();
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ConvexError ? (err.data as string) : "Gagal membuat supplier, coba lagi";

      toast.error(message);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button size="icon">
            <PlusIcon />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader className="flex-row justify-between">
          <Button
            type="button"
            size="icon-lg"
            variant="ghost"
            className="text-red-500 hover:text-red-700"
            onClick={() => setOpen(false)}
          >
            <XIcon strokeWidth={3} />
          </Button>

          <DrawerTitle className="text-xl font-bold">Create New Supplier</DrawerTitle>

          <Button
            form="create-supplier-form"
            type="submit"
            size="icon-lg"
            variant="ghost"
            className="text-green-500 hover:text-green-700"
            disabled={isSubmitting}
          >
            <CheckIcon strokeWidth={3} />
          </Button>
        </DrawerHeader>

        <form id="create-supplier-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} className="bg-muted" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </DrawerContent>
    </Drawer>
  );
}
