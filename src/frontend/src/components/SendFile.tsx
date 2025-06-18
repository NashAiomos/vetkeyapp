import { FormEvent, useState, useRef } from "react";
import { Button } from "./ui/Button";
import { useActor } from "../ic/Actors";
import useTransferCreate from "../transfer/hooks/useTransferCreate";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { queryClient } from "@/main";

export default function SendFile() {
  const { actor } = useActor();
  const { mutateAsync: createTransfer } = useTransferCreate();
  const { toast } = useToast();

  // Local state
  const [recipientPrincipal, setRecipientPrincipal] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actor || !file) return;

    setSaving(true);
    try {
      await createTransfer({ recipientPrincipal, file });
      toast({ description: "文件发送成功！" });
      void queryClient.invalidateQueries({ queryKey: ["transfer_list"] });
      setFile(null); // Reset file after successful transfer
      setRecipientPrincipal(""); // Reset recipient
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "发送文件失败，请重试。",
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
        description: "一次只能上传一个文件。",
      });
      return;
    }

    const droppedFile = droppedFiles[0];
    if (droppedFile.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        description: "文件大小超过1MB的最大限制。",
      });
      return;
    }
    setFile(droppedFile);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 1) {
      toast({
        variant: "destructive",
        description: "一次只能上传一个文件。",
      });
      return;
    }

    const selectedFile = selectedFiles?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          description: "文件大小超过1MB的最大限制。",
        });
        return;
      }
      setFile(selectedFile);
    }
  }

  const submitIcon = saving ? (
    <LoaderCircle className="animate-spin" />
  ) : undefined;
  const submitText = saving ? "发送中..." : "发送文件";
  const submitDisabled = saving || !recipientPrincipal || !file;

  return (
    <div className="p-6 border rounded-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">发送文件</h2>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-2">
            接收者 Principal ID
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
            <p className="text-primary/50">拖拽文件到这里</p>
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
            选择文件
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
