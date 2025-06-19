import { FormEvent, useState, useRef } from "react";
import { Button } from "./ui/Button";
import { useActor } from "../ic/Actors";
import useTransferCreate from "../transfer/hooks/useTransferCreate";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { queryClient } from "@/main";

export default function SendFile() {
  const { actor } = useActor();
  const { mutateAsync } = useTransferCreate();
  const { toast } = useToast();

  // Local state
  const [recipientPrincipal, setRecipientPrincipal] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actor || !file || !recipientPrincipal) return;

    console.log("🚀 [发送文件] 开始发送文件流程");
    console.log("📁 [发送文件] 文件信息:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    console.log("👤 [发送文件] 接收者Principal:", recipientPrincipal);

    setSaving(true);
    try {
      await mutateAsync({ recipientPrincipal, file });
      console.log("✅ [发送文件] 文件发送成功");
      toast({ description: "File sent successfully!" });
      void queryClient.invalidateQueries({ queryKey: ["transfer_list"] });
      setFile(null); // Reset file after successful transfer
      setRecipientPrincipal(""); // Reset recipient
    } catch (error) {
      console.error("❌ [发送文件] 文件发送失败:", error);
      toast({
        variant: "destructive",
        description: "File sending failed, please try again",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 1) {
      toast({
        variant: "destructive",
        description: "Only one file can be sent at a time",
      });
      return;
    }

    const droppedFile = droppedFiles[0];
    if (droppedFile.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        description: "File size cannot exceed 1MB",
      });
      return;
    }
    console.log("📁 [发送文件] 通过拖拽选择文件:", droppedFile.name);
    setFile(droppedFile);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 1) {
      toast({
        variant: "destructive",
        description: "Only one file can be uploaded at a time",
      });
      return;
    }

    const selectedFile = selectedFiles?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          description: "File size cannot exceed 1MB",
        });
        return;
      }
      console.log("📁 [发送文件] 通过选择器选择文件:", selectedFile.name);
      setFile(selectedFile);
    }
  }

  const submitIcon = saving ? (
    <LoaderCircle className="animate-spin" />
  ) : undefined;
  const submitText = saving ? "Sending..." : "Send File";
  const submitDisabled = saving || !recipientPrincipal || !file;

  return (
    <div className="p-6 border rounded-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Send File</h2>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-2">
            Recipient Principal ID
          </label>
          <input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            onChange={(e) => {
              setRecipientPrincipal(e.target.value);
            }}
            placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx"
            type="text"
            value={recipientPrincipal}
          />
        </div>
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg ${
            isDragging ? "border-primary bg-muted" : "border-muted"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <p className="text-primary/50">{file.name}</p>
          ) : (
            <p className="text-primary/50">Drag file here</p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="*"
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select File
          </Button>
        </div>
        <Button className="w-full" disabled={submitDisabled} type="submit">
          {submitIcon}
          {submitText}
        </Button>
      </form>
    </div>
  );
}
