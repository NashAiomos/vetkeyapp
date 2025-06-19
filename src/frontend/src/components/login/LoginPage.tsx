import { useAuth } from "@/auth/AuthContext";
import { Button } from "../ui/Button";
import { LogIn } from "lucide-react";

export default function LoginPage(): React.ReactElement {
  const { login } = useAuth();

  return (
    <div className="flex flex-col gap-5 w-full h-screen items-center justify-center">
      <div className="flex flex-col border rounded px-5 md:px-20 pt-24 pb-10 md:pt-20 md:pb-20 items-center justify-center w-full md:w-[600px] gap-10 bg-muted/30">
        <div className="flex w-full">
          <img alt="ic" className="w-40" src="/icp-logo.png" />
        </div>
        <div className="text-xl font-bold md:text-3xl leading-loose">
        Send encrypted files to any Principal ID
        </div>
        <div className="leading-relaxed">
        Send encrypted files to any Principal ID.
        </div>
        <div className="w-full rounded-xl border bg-card text-card-foreground shadow mt-5">
          <div className="flex flex-col items-center w-full gap-10 p-8">
            <div className="flex items-center justify-center w-full gap-5">
              <Button onClick={login} size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
