"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load all components
const OptionsTradingPageContent = dynamic(() => import("./OptionsTradingPageContent"), {
  ssr: false,
});

const OptionsTradingPage = () => {
  return (
    <Suspense fallback={<div className="text-white">Loading Trading Page...</div>}>
      <OptionsTradingPageContent />
    </Suspense>
  );
};

export default OptionsTradingPage;
