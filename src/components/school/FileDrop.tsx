import { Upload, CheckCircle2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FileDropProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onFile: (file: File) => Promise<void> | void;
  currentUrl?: string | null;
  currentName?: string | null;
  hint?: string;
}

export function FileDrop({
  accept = "image/jpeg,image/png,image/jpg",
  maxSizeMB = 2,
  onFile,
  currentUrl,
  currentName,
  hint = "JPG, PNG or JPEG",
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxSizeMB}MB`);
      return;
    }
    setBusy(true);
    try {
      await onFile(file);
      toast.success("Uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) void handleFile(f);
      }}
      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-4 py-6 text-center transition hover:bg-primary/[0.06]"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      {busy ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : currentUrl ? (
        <CheckCircle2 className="size-6 text-success" />
      ) : (
        <Upload className="size-6 text-primary" />
      )}
      <p className="mt-2 text-sm font-medium text-foreground">
        {currentUrl ? currentName ?? "File uploaded" : "Click to upload or drag and drop"}
      </p>
      <p className="text-xs text-muted-foreground">
        {hint} (Max. {maxSizeMB}MB)
      </p>
      {currentUrl && (
        <p className="mt-1 text-xs text-primary underline">Click to replace</p>
      )}
    </div>
  );
}
