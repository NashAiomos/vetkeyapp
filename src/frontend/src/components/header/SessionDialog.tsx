import { Dialog, DialogContent, DialogHeader } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { useAuth } from "@/auth/AuthContext";

type SessionDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function SessionDialog({
  isOpen,
  setIsOpen,
}: SessionDialogProps) {
  const { principal, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!principal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-96">
        <DialogHeader>User</DialogHeader>
        <div className="px-4 py-2 text-xs rounded-lg bg-muted">
          <pre>
            <div>
              Principal ID:{" "}
              {principal.slice(0, 8)}...
              {principal.slice(-8)}
              <br />
            </div>
          </pre>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
            variant="outline"
            className="w-full"
          >
            Back
          </Button>
          <Button onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
