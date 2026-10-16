import { Suspense } from "react";
import Pipeline from "@/views/Pipeline";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Pipeline />
    </Suspense>
  );
}
