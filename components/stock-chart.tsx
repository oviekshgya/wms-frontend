"use client"

import { useMemo } from "react"
import { useMovements } from "@/lib/wms-client"
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
	Area
} from "recharts"

export function StockChart() {
	const { movements, loading, error } = useMovements()

	// Siapkan data per hari
	const data = useMemo(() => {
		const map: Record<string, { date: string; masuk: number; keluar: number }> = {}

		movements.forEach((m) => {
			const key = m.date
			if (!map[key]) map[key] = { date: key.slice(5), masuk: 0, keluar: 0 } // tampilkan MM-DD
			if (m.type === "in") map[key].masuk += m.qty
			else map[key].keluar += m.qty
		})

		// urutkan tanggal ascending
		return Object.values(map).sort((a, b) => (a.date > b.date ? 1 : -1))
	}, [movements])

	if (loading) return <p>Memuat grafik...</p>
	if (error) return <p className="text-red-500">Gagal memuat data: {error}</p>
	if (!data.length) return <p>Tidak ada data untuk ditampilkan</p>

	return (
		<div className="h-[300px] w-full bg-white rounded-xl p-4 shadow-md">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
					<YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
					<Tooltip
						contentStyle={{ backgroundColor: "#f9fafb", borderRadius: 6 }}
						formatter={(value: number, name: string) => [value, name === "masuk" ? "Masuk" : "Keluar"]}
					/>
					<Legend verticalAlign="top" height={36} />

					{/* Garis Masuk */}
					<Line
						type="monotone"
						dataKey="masuk"
						stroke="#22c55e"
						strokeWidth={3}
						dot={{ r: 4, stroke: "#16a34a", strokeWidth: 2 }}
						activeDot={{ r: 6 }}
					/>
					{/* Garis Keluar */}
					<Line
						type="monotone"
						dataKey="keluar"
						stroke="#ef4444"
						strokeWidth={3}
						dot={{ r: 4, stroke: "#b91c1c", strokeWidth: 2 }}
						activeDot={{ r: 6 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
