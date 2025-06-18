import SessionButton from "./SessionButton";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "../ui/badge";

export default function Header() {
  const { principal } = useAuth();
  
  return (
    <div className="flex flex-col justify-between w-full gap-10 p-5 md:flex-row">
      <div className="hidden text-xl font-bold text-center md:block">
        发送加密文件到任何 Principal ID
      </div>
      <div className="flex items-center justify-between md:justify-center gap-5 text-sm md:text-base flex-row">
        {principal && (
          <Badge variant="secondary">
            {principal.slice(0, 8)}...{principal.slice(-4)}
          </Badge>
        )}
        <SessionButton />
      </div>
      <div className="block text-xl font-bold md:hidden">
        发送加密文件到任何 Principal ID
      </div>
    </div>
  );
}
