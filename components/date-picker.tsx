import { addDays, format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3))

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <button className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="flex gap-1">
        {dates.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange(date)}
              className={`flex flex-col items-center rounded-lg px-3 py-1 text-sm ${
                isSelected
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-xs opacity-60">{format(date, "EEE").slice(0, 3)}</span>
              <span className="font-medium">{format(date, "dd")}</span>
            </button>
          )
        })}
      </div>
      <button className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
