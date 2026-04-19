import { Suspense } from "react";
import EligibilityForm from "@/components/EligibilityForm";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <EligibilityForm />
    </Suspense>
  );
}
