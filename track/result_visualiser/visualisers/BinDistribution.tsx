import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function BinDistribution({ bins, name }: { bins: Record<string, string>; name?: string }) {
  const entries = Object.entries(bins).sort(([a], [b]) => a.localeCompare(b))
  return (
    <Bar
      data={{
        labels: entries.map(([bin]) => bin),
        datasets: [
          {
            label: name ?? "count",
            data: entries.map(([bin, count]) => parseInt(count)),
            order: 1,
            backgroundColor: "lightblue"
          },
        ],
      }}
    />
  )
}
