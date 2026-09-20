import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-[var(--paper-shadow)]", className)}
      {...props}
    />
  );
}

export { Card };
