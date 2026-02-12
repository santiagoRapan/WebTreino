import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground",
        "flex field-sizing-content min-h-16 w-full rounded-md border-2 px-3 py-2 text-base shadow-sm transition-all outline-none",
        "bg-background/50 dark:bg-background/80 border-border/60 dark:border-border/40",
        "hover:border-border dark:hover:border-border/60",
        "focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-2 focus-visible:bg-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
