import { Suspense, type ComponentType, type ReactNode } from "react";
import { requireAuth } from "@/utils/action/auth.get";
import type { User } from "@/utils/types/user.types";

export type RoutePageProps = {
  user: User;
};

async function AuthenticatedPage({
  Page,
}: {
  Page: ComponentType<RoutePageProps>;
}) {
  const session = await requireAuth();
  return <Page user={session.user} />;
}

export default function RoutePageWrapper({
  Page,
  fallback = <div className="p-6">Loading...</div>,
}: {
  Page: ComponentType<RoutePageProps>;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <AuthenticatedPage Page={Page} />
    </Suspense>
  );
}
