"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { transact, useItems } from "@/lib/wms-client"
import { useToast } from "@/hooks/use-toast"

export function TransactionForm() {
	const { items, mutateItems, mutateMovements } = useItems()
	const { showToast } = useToast()

	const [itemId, setItemId] = useState<string | undefined>(items[0]?.id)
	const [type, setType] = useState<"in" | "out">("in")
	const [qty, setQty] = useState<number>(1)
	const [keterangan, setKeterangan] = useState<string>("Input")

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!itemId) return

		const res = await transact({ itemId, type, qty, keterangan })

		if (res.error) {
			showToast(`Transaksi gagal: ${res.error}`)
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
				<Select value={itemId} onValueChange={setItemId}>
					<SelectTrigger>
						<SelectValue placeholder="Pilih barang" />
					</SelectTrigger>
					<SelectContent>
						{items.map((it) => (
							<SelectItem key={it.id} value={it.id}>
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
					<Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} required />
				</div>
				<div className="grid gap-1">
					<Label>Keterangan</Label>
					<Input type="text" min={1} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required />
				</div>
			</div>
			<Button type="submit" className="w-full">
				Proses
			</Button>
		</form>
	)
}
