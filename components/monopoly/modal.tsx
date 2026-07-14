"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose?: () => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl border bg-card shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close dialog"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
