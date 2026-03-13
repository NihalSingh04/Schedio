// import React from "react";
// import clsx from "clsx";

// export default function Button({
//   children,
//   variant = "primary",
//   size = "md",
//   className,
//   ...props
// }) {
//   return (
//     <button
//       className={clsx(
//         "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed",
//         size === "sm" && "px-3 py-2 text-sm",
//         size === "md" && "px-4 py-2.5 text-sm",
//         size === "lg" && "px-5 py-3 text-base",
//         variant === "primary" && "bg-slate-900 text-white hover:bg-slate-800",
//         variant === "secondary" && "bg-white border border-slate-200 hover:bg-slate-50",
//         variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
//         className
//       )}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }

import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-slate-300",
        "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",

        /* sizes */
        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3 text-base",

        /* variants */
        variant === "primary" &&
        "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",

        variant === "secondary" &&
        "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm",

        variant === "danger" &&
        "bg-red-600 text-white hover:bg-red-500 shadow-sm",

        variant === "ghost" &&
        "bg-transparent text-slate-700 hover:bg-slate-100",

        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}

      {children}
    </button>
  );
}