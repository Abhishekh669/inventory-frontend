import { Suspense } from "react";
import LoginCard from "@/components/auth/LoginCard";
import { auth } from "@/utils/action/auth.get";
import RestoreLastRoute from "@/components/auth/RestoreLastRoute";

async function RedirectIfLoggedIn() {
  const session = await auth();
  if (session) return <RestoreLastRoute />;
  return null;
}

export default function Page() {
  return (
    <>
      <LoginCard />
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
    </>
  );
}