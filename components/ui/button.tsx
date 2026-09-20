import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-[background,color,border-color,transform,box-shadow] duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] disabled:pointer-events-none disabled:text-[var(--muted)]",
  {
    variants: {
      variant: {
        default: "border border-[var(--action)] bg-[var(--action)] text-[var(--on-action)] shadow-[0_2px_0_var(--action-hover)] hover:-translate-y-0.5 hover:bg-[var(--action-hover)] hover:shadow-[0_4px_0_var(--action-hover)]",
        destructive: "border border-red-300 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white",
        outline: "border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--highlight)]",
        secondary: "border border-[var(--line)] bg-[var(--highlight)] text-[var(--ink)] hover:border-[var(--ink)]",
        ghost: "text-[var(--violet)] hover:bg-[color-mix(in_srgb,var(--highlight)_40%,transparent)]",
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
