import { Suspense } from "react";
import ResetPassword from "@/views/ResetPassword";

export const metadata = { title: "Reset password — RicozRecruit" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
