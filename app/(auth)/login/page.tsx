import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { auth } from "@/utils/action/auth.get";

async function RedirectIfLoggedIn() {
  const session = await auth();
  if (session) redirect("/dashboard");
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





// import LoginCard from '@/components/auth/LoginCard';
// import { auth } from '@/utils/action/auth.get';
// import { redirect } from 'next/navigation';

// async function page() {
//     const session = await auth();
//     if (session) {
//         redirect("/dashboard")
//     }
//     return <LoginCard />
    
// }

// export default page
