import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-gray-400 selection:text-gray-900 dark:selection:bg-gray-600 dark:selection:text-gray-50 dark:bg-input/20 border-gray-300 dark:border-gray-600 h-10 w-full min-w-0 rounded-xl border-2 bg-white/80 dark:bg-gray-900/80 px-4 py-2 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-gray-400 focus-visible:ring-4 focus-visible:ring-gray-200/50 dark:focus-visible:ring-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
