import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:border-[var(--violet)] focus-visible:ring-[3px] focus-visible:ring-[rgba(111,86,199,.15)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-[var(--ink)] bg-[var(--ink)] text-white hover:bg-[var(--violet)]",
        destructive: "border border-red-300 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white",
        outline: "border border-[var(--line)] bg-white text-[var(--ink)] shadow-xs hover:border-[var(--ink)] hover:bg-[var(--highlight)]",
        secondary: "bg-[#eeeafe] text-[#4f399f] hover:bg-[#ddd5f8]",
        ghost: "text-[var(--violet)] hover:bg-[#f1effb]",
        link: "text-[var(--violet)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
