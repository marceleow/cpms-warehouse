import { useQuery } from "convex/react";
import { XIcon } from "lucide-react";
import { useRef, useState } from "react";
import {
  useController,
  useWatch,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MaterialPicker } from "./MaterialPicker";

type MaterialItemsForm = FieldValues & {
  items: {
    materialId: Id<"materials">;
    quantity: number;
    unit: string;
  }[];
};

interface MaterialItemRowProps<TForm extends MaterialItemsForm> {
  control: Control<TForm>;
  index: number;
  onRemove: () => void;
  allowedTrackingModes?: Doc<"materials">["trackingMode"][];
  showStock?: boolean;
}

export function MaterialItemRow<TForm extends MaterialItemsForm>({
  control,
  index,
  onRemove,
  allowedTrackingModes,
  showStock,
}: MaterialItemRowProps<TForm>) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const quantityRef = useRef<HTMLInputElement>(null);

  const materials = useQuery(api.materials.list);

  const materialIdName = `items.${index}.materialId` as FieldPathByValue<TForm, Id<"materials">>;
  const quantityName = `items.${index}.quantity` as FieldPathByValue<TForm, number>;
  const unitName = `items.${index}.unit` as FieldPathByValue<TForm, string>;

  const materialId = useWatch({
    control,
    name: materialIdName,
  });

  const selectedMaterial = materials?.find((m) => m._id === materialId);

  const materialIdField = useController({
    control,
    name: materialIdName,
  });

  const quantityField = useController({
    control,
    name: quantityName,
  });

  const unitField = useController({
    control,
    name: unitName,
  });

  const isLocked = selectedMaterial?.trackingMode === "calculated";

  return (
    <>
      <div className="relative flex flex-col gap-2 rounded-lg border p-3 bg-muted/50">
        <button type="button" className="text-left" onClick={() => setPickerOpen(true)}>
          {selectedMaterial ? (
            <div>
              <div className="font-medium">{selectedMaterial.name}</div>

              {showStock && selectedMaterial.trackingMode === "calculated" && (
                <div className="text-sm text-muted-foreground">
                  Available {selectedMaterial.currentStock ?? 0} {selectedMaterial.unit}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">Tap to select material</div>
          )}
        </button>

        <div className="flex gap-2">
          <Input
            ref={quantityRef}
            type="number"
            inputMode="decimal"
            placeholder="Qty"
            value={quantityField.field.value ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              quantityField.field.onChange(raw === "" ? undefined : Number(raw));
            }}
            className="flex-1 bg-muted"
          />

          <Input
            disabled={isLocked}
            value={unitField.field.value ?? selectedMaterial?.unit ?? ""}
            onChange={unitField.field.onChange}
            className="flex-1 bg-muted"
          />
        </div>

        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2"
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <MaterialPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        allowedTrackingModes={allowedTrackingModes}
        onSelect={(material) => {
          materialIdField.field.onChange(material._id);
          unitField.field.onChange(material.unit);

          setTimeout(() => {
            quantityRef.current?.focus();
          }, 150);
        }}
      />
    </>
  );
}
