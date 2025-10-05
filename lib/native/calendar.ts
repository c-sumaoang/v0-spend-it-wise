import { isPlatformNative } from "../platform"

export interface CalendarEvent {
  id?: string
  title: string
  location?: string
  notes?: string
  startDate: Date
  endDate: Date
  isAllDay?: boolean
}

class CalendarManager {
  private isNative = false

  constructor() {
    if (typeof window !== "undefined") {
      this.isNative = isPlatformNative()
    }
  }

  async hasPermission(): Promise<boolean> {
    if (!this.isNative) return false

    try {
      const { Calendar } = await import("@capacitor/calendar")
      const result = await Calendar.checkPermissions()
      return result.readCalendar === "granted" && result.writeCalendar === "granted"
    } catch (error) {
      console.error("[v0] Failed to check calendar permissions:", error)
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isNative) return false

    try {
      const { Calendar } = await import("@capacitor/calendar")
      const result = await Calendar.requestPermissions()
      return result.readCalendar === "granted" && result.writeCalendar === "granted"
    } catch (error) {
      console.error("[v0] Failed to request calendar permissions:", error)
      return false
    }
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.isNative) {
      // Web fallback - download .ics file
      this.downloadICSFile(event)
      return null
    }

    try {
      const { Calendar } = await import("@capacitor/calendar")
      const result = await Calendar.createEvent({
        title: event.title,
        location: event.location,
        notes: event.notes,
        startDate: event.startDate.getTime(),
        endDate: event.endDate.getTime(),
        isAllDay: event.isAllDay || false,
      })
      return result.result
    } catch (error) {
      console.error("[v0] Failed to create calendar event:", error)
      return null
    }
  }

  async createRecurringExpenseReminder(title: string, amount: number, frequency: string): Promise<string | null> {
    const now = new Date()
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

    return this.createEvent({
      title: `${title} - $${amount.toFixed(2)}`,
      notes: `Recurring ${frequency} expense reminder from SpendWise`,
      startDate,
      endDate,
      isAllDay: false,
    })
  }

  private downloadICSFile(event: CalendarEvent) {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SpendWise//EN
BEGIN:VEVENT
UID:${Date.now()}@spendwise.app
DTSTAMP:${this.formatICSDate(new Date())}
DTSTART:${this.formatICSDate(event.startDate)}
DTEND:${this.formatICSDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.notes || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.title.replace(/\s+/g, "_")}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  private formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }
}

export const calendarManager = new CalendarManager()
