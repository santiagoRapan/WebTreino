import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "flex h-9 w-full min-w-0 rounded-md border-2 px-3 py-1 text-base shadow-sm transition-all outline-none",
        "bg-background/50 dark:bg-background/80 border-border/60 dark:border-border/40",
        "hover:border-border dark:hover:border-border/60",
        "focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-2 focus-visible:bg-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
