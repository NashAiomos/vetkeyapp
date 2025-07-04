import Header from "./components/header/Header";
import ReceivedFiles from "./components/ReceivedFiles";
import SendFile from "./components/SendFile";
import { Skeleton } from "./components/ui/skeleton";
import useRegisterUser from "./user/hooks/useRegisterUser";

function AppInner() {
  // 调用此hook会"注册"用户到后端actor，
  // 即确保后端actor知道该用户，并将用户的Principal ID与用户关联。
  const { data: registeredPrincipal, isPending } = useRegisterUser();

  if (isPending) {
    return (
      <>
        <Skeleton className="rounded-lg w-full max-w-2xl h-96" />
        <Skeleton className="rounded-lg w-full max-w-2xl h-40" />
      </>
    );
  }

  if (!registeredPrincipal) {
    return (
      <div className="w-full bg-destructive/50 rounded p-5 text-primary/50">
        注册用户失败，请尝试使用 Cmd+Shift+R 刷新页面。
      </div>
    );
  }

  return (
    <>
      <SendFile />
      <ReceivedFiles />
    </>
  );
}

function App() {
  return (
    <div className="flex flex-col items-center w-full dark h-lvh">
      <Header />
      <div className="flex flex-grow flex-col items-center justify-center w-full gap-10 p-5 mb-20 max-w-2xl">
        <div className="flex w-full">
          <img alt="ic" className="w-40" src="/icp-logo.png" />
        </div>
        <AppInner />
      </div>
    </div>
  );
}

export default App;
