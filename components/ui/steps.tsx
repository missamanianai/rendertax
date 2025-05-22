"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  onChange?: (value: number) => void
  children: React.ReactNode
}

export function Steps({ value, onChange, children, className, ...props }: StepsProps) {
  const childrenArray = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step,
  ) as React.ReactElement[]

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center">
        {childrenArray.map((child, index) => {
          const isActive = index === value
          const isCompleted = index < value
          const isLast = index === childrenArray.length - 1

          return (
            <React.Fragment key={index}>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/20 bg-background text-muted-foreground",
                )}
                onClick={() => onChange?.(index)}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-[2px] flex-1 transition-colors",
                    index < value ? "bg-primary" : "bg-muted-foreground/20",
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="flex items-center justify-between">
        {childrenArray.map((child, index) => {
          const isActive = index === value
          const isCompleted = index < value
          const isLast = index === childrenArray.length - 1

          return (
            <div
              key={index}
              className={cn(
                "text-center text-xs font-medium",
                isActive || isCompleted ? "text-foreground" : "text-muted-foreground",
                isLast ? "text-right" : isActive ? "text-center" : "text-left",
              )}
              style={{ width: `${100 / childrenArray.length}%` }}
            >
              {child.props.title}
            </div>
          )
        })}
      </div>
      <div className="mt-2">{childrenArray[value]}</div>
    </div>
  )
}

interface StepProps {
  title: string
  children: React.ReactNode
}

export function Step({ children }: StepProps) {
  return <div>{children}</div>
}
