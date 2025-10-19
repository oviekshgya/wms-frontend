"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

export interface Transaction {
	id: number
	itemName: string
	user: string
	type: "in" | "out"
	quantity: number
	note?: string
	date: string
}

export function TransactionsTable() {
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState("")

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				setLoading(true)
				const token = localStorage.getItem("wms-token")
				if (!token) throw new Error("Token tidak ditemukan di localStorage")

				const res = await fetch("http://localhost:8000/api/transactions", {
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/json",
					},
				})

				if (!res.ok) throw new Error("Gagal memuat data transaksi")

				const data = await res.json()

				const mapped: Transaction[] = data.data.map((t: any) => ({
					id: t.id,
					itemName: t.item?.nama_barang || "-",
					user: t.user?.name || "-",
					type: t.type,
					quantity: t.quantity,
					note: t.keterangan,
					date: t.created_at,
				}))

				setTransactions(mapped)
			} catch (err: any) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		fetchTransactions()
	}, [])

	const filtered = useMemo(() => {
		return transactions.filter(
			(t) =>
				t.itemName.toLowerCase().includes(search.toLowerCase()) ||
				t.user.toLowerCase().includes(search.toLowerCase()) ||
				t.type.toLowerCase().includes(search.toLowerCase())
		)
	}, [transactions, search])

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<CardTitle>Riwayat Transaksi</CardTitle>
				<Input
					placeholder="Cari transaksi..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full md:w-64"
				/>
			</CardHeader>
			<Separator />
			<CardContent className="overflow-auto max-h-[500px]">
				{loading ? (
					<p className="text-center text-muted-foreground py-6">Memuat data...</p>
				) : error ? (
					<p className="text-center text-red-500 py-6">{error}</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nama Barang</TableHead>
								<TableHead>User</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Qty</TableHead>
								<TableHead>Keterangan</TableHead>
								<TableHead>Tanggal</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length > 0 ? (
								filtered.map((trx) => (
									<TableRow key={trx.id}>
										<TableCell>{trx.itemName}</TableCell>
										<TableCell>{trx.user}</TableCell>
										<TableCell>
											<span
												className={`${trx.type === "in" ? "text-green-600" : "text-red-600"
													} font-medium`}
											>
												{trx.type.toUpperCase()}
											</span>
										</TableCell>
										<TableCell>{trx.quantity}</TableCell>
										<TableCell>{trx.note || "-"}</TableCell>
										<TableCell>
											{new Date(trx.date).toLocaleString("id-ID", {
												dateStyle: "short",
												timeStyle: "short",
											})}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="text-center text-muted-foreground">
										Tidak ada transaksi ditemukan
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	)
}
