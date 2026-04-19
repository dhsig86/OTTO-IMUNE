import { Suspense } from "react";
import EligibilityForm from "@/components/EligibilityForm/index";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <EligibilityForm />
    </Suspense>
  );
}
