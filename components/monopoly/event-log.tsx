"use client"

import { useEffect, useRef } from "react"
import { ScrollText } from "lucide-react"
import type { LogEntry } from "@/lib/monopoly/types"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<LogEntry["tone"], string> = {
  info: "text-foreground/80",
  "money-up": "text-green-700 dark:text-green-400",
  "money-down": "text-red-700 dark:text-red-400",
  alert: "font-semibold text-orange-700 dark:text-orange-400",
  system: "font-semibold text-foreground",
}

export function EventLog({ entries }: { entries: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [entries.length])

  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl border bg-card shadow-sm" aria-label="Game event log">
      <h2 className="flex items-center gap-2 border-b px-3 py-2 text-sm font-bold">
        <ScrollText className="size-4 text-muted-foreground" aria-hidden="true" />
        Event Log
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto p-3" role="log" aria-live="polite">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Game events will appear here.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((entry) => (
              <li key={entry.id} className={cn("text-xs leading-relaxed md:text-sm", TONE_CLASSES[entry.tone])}>
                {entry.text}
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  )
}
