// import React, { Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";

// const OptionsInfo = dynamic(() => import("./OptionsInfo"), { ssr: false });
// const OptionsChart = dynamic(() => import("./OptionsChart"), { ssr: false });
// const OptionsTradingPanel = dynamic(() => import("./OptionsTradingPanel"), { ssr: false });

// const OptionsTradingPageContent = () => {
//     const searchParams = useSearchParams();
//     const ticker = searchParams.get("ticker") || "COALINDIA";
//     const strike = searchParams.get("strike") || "6000";

//     return (
//         <div className="bg-black text-white min-h-screen p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Left - Option Info */}
//             <Suspense fallback={<div className="text-white">Loading Option Info...</div>}>
//                 <OptionsInfo ticker={ticker} strike={strike} />
//             </Suspense>

//             {/* Middle - Chart */}
//             <Suspense fallback={<div className="text-white">Loading Chart...</div>}>
//                 <OptionsChart ticker={ticker} strike={strike} />
//             </Suspense>

//             {/* Right - Trading Panel */}
//             <Suspense fallback={<div className="text-white">Loading Trading Panel...</div>}>
//                 <OptionsTradingPanel ticker={ticker} strike={strike} />
//             </Suspense>
//         </div>
//     );
// };

// export default OptionsTradingPageContent;

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const OptionsInfo = dynamic(() => import("./OptionsInfo"), { ssr: false });
const OptionsChart = dynamic(() => import("./OptionsChart"), { ssr: false });
const OptionsTradingPanel = dynamic(() => import("./OptionsTradingPanel"), { ssr: false });

const OptionsTradingPageContent = () => {
    const searchParams = useSearchParams();
    const ticker = searchParams.get("ticker") || "COALINDIA";
    const strike = searchParams.get("strike") || "6000";

    return (
        <div className="bg-black text-white min-h-screen p-6 flex flex-col gap-6">
            {/* Row 1 - Options Info & Trading Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left - Option Info */}
                <Suspense fallback={<div className="text-white">Loading Option Info...</div>}>
                    <OptionsInfo ticker={ticker} strike={strike} />
                </Suspense>

                {/* Right - Trading Panel */}
                <Suspense fallback={<div className="text-white">Loading Trading Panel...</div>}>
                    <OptionsTradingPanel ticker={ticker} strike={strike} />
                </Suspense>
            </div>

            {/* Row 2 - Chart */}
            <div className="w-full">
                <Suspense fallback={<div className="text-white">Loading Chart...</div>}>
                    <OptionsChart ticker={ticker} strike={strike} />
                </Suspense>
            </div>
        </div>
    );
};

export default OptionsTradingPageContent;
