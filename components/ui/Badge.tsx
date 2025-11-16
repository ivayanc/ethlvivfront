import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600",
        success:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700",
        warning:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700",
        danger:
          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700",
        info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700",
        purple:
          "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700",
        gradient:
          "bg-gradient-to-r from-purple-500 to-blue-500 text-white border border-purple-400 shadow-md",
      },
      size: {
        default: "px-3 py-1 text-sm",
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
      pulse: {
        true: "animate-pulse-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pulse: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, pulse, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, pulse }), className)} {...props}>
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </div>
  )
}

// Dot indicator for status
export function StatusDot({
  variant = "success",
  className = "",
}: {
  variant?: "success" | "warning" | "danger" | "info"
  className?: string
}) {
  const colorClasses = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  }

  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          colorClasses[variant]
        )}
      />
      <span className={cn("relative inline-flex rounded-full h-2 w-2", colorClasses[variant])} />
    </span>
  )
}

export { Badge, badgeVariants }
