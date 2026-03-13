// import React from "react";
// import clsx from "clsx";

// export default function Select({ className, children, ...props }) {
//   return (
//     <select
//       className={clsx(
//         "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400",
//         className
//       )}
//       {...props}
//     >
//       {children}
//     </select>
//   );
// }

import React from "react";
import clsx from "clsx";

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={clsx(
        "w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800",
        "outline-none transition-all duration-150",
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
        "disabled:bg-slate-100 disabled:cursor-not-allowed",
        "pr-8",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}