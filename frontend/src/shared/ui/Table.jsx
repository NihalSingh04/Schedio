import React from "react";

export default function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={columns.length}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={rowKey(r)} className="border-t border-slate-100">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-top">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// import React from "react";

// export default function Table({ columns, rows, rowKey }) {
//   return (
//     <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//       <div className="overflow-auto">
//         <table className="min-w-full text-left text-sm">
//           <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
//             <tr>
//               {columns.map((c) => (
//                 <th
//                   key={c.key}
//                   className="whitespace-nowrap px-4 py-3.5 font-semibold"
//                 >
//                   {c.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-100">
//             {rows.length === 0 ? (
//               <tr>
//                 <td
//                   className="px-4 py-10 text-center text-sm text-slate-500"
//                   colSpan={columns.length}
//                 >
//                   No data available
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r, index) => (
//                 <tr
//                   key={rowKey(r)}
//                   className={[
//                     "transition-colors hover:bg-slate-50/80",
//                     index % 2 === 0 ? "bg-white" : "bg-slate-50/30",
//                   ].join(" ")}
//                 >
//                   {columns.map((c) => (
//                     <td key={c.key} className="px-4 py-3.5 align-top text-slate-700">
//                       {c.render ? c.render(r) : r[c.key]}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }