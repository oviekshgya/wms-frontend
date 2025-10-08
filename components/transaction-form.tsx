"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Item } from "@/lib/wms-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { transact, useItems, useMovements } from "@/lib/wms-client"
import { useToast } from "@/hooks/use-toast"




export function TransactionForm() {
	const { items, mutateItems } = useItems()
	const { mutate: mutateMovements } = useMovements()
	const { showToast } = useToast()

	// jangan gunakan items[0]?.id di initial state (items mungkin belum ada saat first render)
	const [itemId, setItemId] = useState<string | undefined>(undefined)
	const [type, setType] = useState<"in" | "out">("in")
	const [qty, setQty] = useState<number>(1)
	const [keterangan, setKeterangan] = useState<string>("Input")

	// set default selected item ketika items sudah ter-fetch
	useEffect(() => {
		if (!itemId && items.length > 0) {
			setItemId(items[0].id)
		}
	}, [items, itemId])

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!itemId) {
			showToast("Pilih barang terlebih dahulu")
			return
		}

		const selected = items.find((it) => it.id === itemId)
		if (!selected) {
			showToast("Barang tidak ditemukan")
			return
		}

		// Validasi stok untuk transaksi keluar
		if (type === "out" && qty > selected.stok) {
			showToast("Stok tidak cukup")
			return
		}

		const res = await transact({ itemId: Number(itemId), type, qty, keterangan })

		if ((res as any).error) {
			showToast(`Transaksi gagal: ${(res as any).error}`)
			return
		}

		await Promise.all([mutateItems(), mutateMovements()])
		showToast("Transaksi berhasil")
		setQty(1)
	}

	return (
		<form onSubmit={onSubmit} className="grid gap-3">
			<div className="grid gap-1">
				<Label>Barang</Label>
				<Select value={String(itemId ?? "")} onValueChange={(v) => setItemId(String(v))}>
					<SelectTrigger>
						<SelectValue placeholder={items.length ? "Pilih barang" : "Memuat..."} />
					</SelectTrigger>
					<SelectContent>
						{items.map((it: Item) => (
							<SelectItem key={it.id} value={String(it.id)}>
								{it.namaBarang} — {it.sku}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="grid gap-1">
					<Label>Jenis</Label>
					<Select value={type} onValueChange={(v) => setType(v as "in" | "out")}>
						<SelectTrigger>
							<SelectValue placeholder="Pilih jenis" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="in">Masuk</SelectItem>
							<SelectItem value="out">Keluar</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-1">
					<Label>Qty</Label>
					<Input
						type="number"
						min={1}
						value={qty}
						onChange={(e) => setQty(Number(e.target.value))}
						required
					/>
				</div>

				<div className="grid gap-1">
					<Label>Keterangan</Label>
					<Input
						type="text"
						value={keterangan}
						onChange={(e) => setKeterangan(e.target.value)}
						required
					/>
				</div>
			</div>

			<Button type="submit" className="w-full" disabled={!items.length}>
				Proses
			</Button>
		</form>
	)
}
