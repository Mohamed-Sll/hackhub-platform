'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, rightElement, id, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const { t } = useI18n()
    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t(label)}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={error ? [ariaDescribedBy, errorId].filter(Boolean).join(' ') : ariaDescribedBy}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              icon && 'pl-10',
              rightElement && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            {...props}
            placeholder={props.placeholder ? t(String(props.placeholder)) : undefined}
            aria-label={props['aria-label'] ? t(String(props['aria-label'])) : undefined}
          />
          {rightElement}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-destructive">{t(error)}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
