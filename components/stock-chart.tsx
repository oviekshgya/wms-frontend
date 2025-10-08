"use client"

import { useMemo } from "react"
import { useMovements } from "@/lib/wms-client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function StockChart() {
	const { movements, loading, error } = useMovements()

	const data = useMemo(() => {
		const days = 14
		const today = new Date()
		const map: Record<string, { date: string; masuk: number; keluar: number }> = {}
		for (let i = days - 1; i >= 0; i--) {
			const d = new Date(today)
			d.setDate(today.getDate() - i)
			const key = d.toISOString().slice(0, 10)
			map[key] = { date: key.slice(5), masuk: 0, keluar: 0 }
		}

		movements.forEach((m) => {
			const key = new Date(m.date).toISOString().slice(0, 10)
			if (!map[key]) return
			if (m.type === "in") map[key].masuk += m.qty
			else map[key].keluar += m.qty
		})
		return Object.values(map)
	}, [movements])

	if (loading) return <p>Memuat grafik...</p>
	if (error) return <p className="text-red-500">Gagal memuat data: {error}</p>

	return (
		<div className="h-[280px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
					<CartesianGrid strokeDasharray="4 4" />
					<XAxis dataKey="date" />
					<YAxis domain={[0, 'auto']} />


					<Tooltip />
					<Legend />
					<Line type="monotone" dataKey="masuk" stroke="oklch(var(--chart-2))" strokeWidth={2} dot={false} />
					<Line type="monotone" dataKey="keluar" stroke="oklch(var(--chart-5))" strokeWidth={2} dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
