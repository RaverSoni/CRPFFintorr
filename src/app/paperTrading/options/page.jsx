import { Suspense } from "react";
import OptionsPage from "./OptionsPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-gray-500 text-center">Loading options data...</p>}>
      <OptionsPage />
    </Suspense>
  );
}
