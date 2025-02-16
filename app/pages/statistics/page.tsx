"use client"

import { useState, useEffect } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Download } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LineController,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController
)

interface KeyMoment {
  videoName: string
  timestamp: string
  description: string
  isDangerous: boolean
}

export default function StatisticsPage() {
  const exportToCSV = () => {
    // Convert keyMoments to CSV format
    const csvContent = [
      // Header row
      ['Video Name', 'Timestamp', 'Description', 'Is Dangerous'].join(','),
      // Data rows
      ...keyMoments.map(moment => [
        moment.videoName,
        moment.timestamp,
        `"${moment.description}"`, // Wrap description in quotes to handle commas
        moment.isDangerous
      ].join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `safety-statistics-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([])
  const [summary, setSummary] = useState<string>('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [chartData, setChartData] = useState<{
    dangerousMomentsByVideo: any;
    dangerTypeDistribution: any;
    dangerTrend: any;
  }>({
    dangerousMomentsByVideo: null,
    dangerTypeDistribution: null,
    dangerTrend: null,
  })

  useEffect(() => {
    const savedVideos = JSON.parse(localStorage.getItem("savedVideos") || "[]")
    const moments: KeyMoment[] = savedVideos.flatMap((video: any) =>
      video.timestamps.map((ts: any) => ({
        videoName: video.name,
        timestamp: ts.timestamp,
        description: ts.description,
        isDangerous: ts.isDangerous || false,
      }))
    )
    console.log('Processed Moments:', moments)
    setKeyMoments(moments)

    // Generate summary using API route
    const fetchSummary = async () => {
      setIsLoadingSummary(true)
      try {
        const response = await fetch('/api/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keyMoments: moments })
        })
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setSummary(data.summary)
      } catch (error: any) {
        console.error('Error fetching summary:', error)
        const errorMessage = error?.message || 'Unable to generate summary at this time.'
        setSummary(`Error: ${errorMessage}`)
        if (error?.details) {
          console.error('Error details:', error.details)
        }
      } finally {
        setIsLoadingSummary(false)
      }
    }

    if (moments.length > 0) {
      fetchSummary()
    }

    console.log('Saved Videos:', savedVideos)



    // Filter dangerous moments using the isDangerous flag
    const dangerousMoments = moments.filter(moment => moment.isDangerous)

    // Count dangerous moments by video
    const dangerousByVideo = dangerousMoments.reduce((acc: { [key: string]: number }, moment) => {
      acc[moment.videoName] = (acc[moment.videoName] || 0) + 1
      return acc
    }, {})

    // Calculate dangerous vs non-dangerous ratio
    const dangerousCount = dangerousMoments.length
    const nonDangerousCount = moments.length - dangerousCount

    // Create time-based trend data (by 15-minute intervals)
    const trendData = dangerousMoments.reduce((acc: { [key: string]: number }, moment) => {
      const [hours, minutes] = moment.timestamp.split(':').map(Number)
      const interval = `${hours.toString().padStart(2, '0')}:${Math.floor(minutes / 15) * 15}`.padEnd(5, '0')
      acc[interval] = (acc[interval] || 0) + 1
      return acc
    }, {})

    setChartData({
      dangerousMomentsByVideo: {
        labels: Object.keys(dangerousByVideo),
        datasets: [
          {
            label: 'Dangerous Moments per Video',
            data: Object.values(dangerousByVideo),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      dangerTypeDistribution: {
        labels: ['Dangerous Moments', 'Non-Dangerous Moments'],
        datasets: [
          {
            label: 'Safety Incident Distribution',
            data: [dangerousCount, nonDangerousCount],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',  // Red for dangerous
              'rgba(54, 162, 235, 0.6)',   // Blue for non-dangerous
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      dangerTrend: {
        labels: Object.keys(trendData).sort(),
        datasets: [
          {
            label: 'Dangerous Moments Over Time',
            data: Object.keys(trendData).sort().map(key => trendData[key]),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
    })
  }, [])

  const columnHelper = createColumnHelper<KeyMoment>()

  const columns = [
    columnHelper.accessor("videoName", {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Video Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("timestamp", {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Timestamp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("description", {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: (info) => info.getValue(),
    }),
  ]

  const table = useReactTable({
    data: keyMoments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center p-8">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Dangerous Moments by Video</h2>
            {chartData.dangerousMomentsByVideo && (
              <Bar
                data={chartData.dangerousMomentsByVideo}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Number of Dangerous Moments Detected'
                    }
                  },
                }}
              />
            )}
          </div>
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Dangerous vs Non-Dangerous Moments</h2>
            {chartData.dangerTypeDistribution && (
              <Pie
                data={chartData.dangerTypeDistribution}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                    title: {
                      display: true,
                      text: 'Safety Incident Distribution'
                    }
                  },
                }}
              />
            )}
          </div>
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Danger Trend Over Time</h2>
            {chartData.dangerTrend && (
              <Line
                data={chartData.dangerTrend}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Dangerous Moments Timeline'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Incidents'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Time (15-min intervals)'
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Video Key Moments</h1>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left bg-muted/50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-t hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    No key moments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-muted-foreground">
          {keyMoments.length} key moments found across all saved videos
        </div>

        {/* AI Summary Section */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">AI Analysis Summary</h2>
          {isLoadingSummary ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : summary ? (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line">{summary}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
