// import React from "react";
// import clsx from "clsx";

// export function Card({ className, ...props }) {
//   return (
//     <div
//       className={clsx("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}
//       {...props}
//     />
//   );
// }

// export function CardHeader({ className, ...props }) {
//   return <div className={clsx("border-b border-slate-100 p-4", className)} {...props} />;
// }

// export function CardContent({ className, ...props }) {
//   return <div className={clsx("p-4", className)} {...props} />;
// }

import React from "react";
import clsx from "clsx";

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={clsx(
        "border-b border-slate-100 px-5 py-4",
        "bg-slate-50/60",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={clsx(
        "px-5 py-4",
        className
      )}
      {...props}
    />
  );
}