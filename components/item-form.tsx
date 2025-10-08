"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createItem, updateItem, type Item, useItems } from "@/lib/wms-client"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

type Props =
	| { item?: undefined; asButton?: boolean; asMenuItem?: false }
	| { item?: Item; asButton?: false; asMenuItem?: boolean }

// export function ItemForm(props: Props = { asButton: false }) {
// 	const editing = props.item
// 	const [open, setOpen] = useState(false)
// 	const [namaBarang, setNamaBarang] = useState(editing?.namaBarang || "")
// 	const [sku, setSku] = useState(editing?.sku || "")
// 	const [stok, setStok] = useState(editing?.stok?.toString() || "0")
// 	const [lokasiRak, setLokasiRak] = useState(editing?.lokasiRak || "")
// 	const { mutateItems } = useItems()
// 	const { showToast } = useToast()

// 	async function onSubmit(e?: React.FormEvent) {
// 		e?.preventDefault()
// 		const payload = {
// 			namaBarang,
// 			sku,
// 			stok: Number(stok || 0),
// 			lokasiRak,
// 		}
// 		if (editing) {
// 			await updateItem(editing.id, payload)
// 			showToast("Barang diubah")
// 		} else {
// 			await createItem(payload)
// 			showToast("Barang ditambahkan")
// 		}
// 		await mutateItems()
// 		setOpen(false)
// 	}

// 	const Trigger = props.asMenuItem ? (
// 		<DropdownMenuItem onClick={() => setOpen(true)}>Ubah</DropdownMenuItem>
// 	) : (
// 		<DialogTrigger asChild>
// 			<Button onClick={() => setOpen(true)}>
// 				{editing ? "Ubah Barang" : props.asButton ? "Tambah Barang" : "Tambah"}
// 			</Button>
// 		</DialogTrigger>
// 	)

// 	return (
// 		<Dialog open={open} onOpenChange={setOpen}>
// 			{props.asMenuItem ? Trigger : <>{Trigger}</>}
// 			<DialogContent className="sm:max-w-md">
// 				<DialogHeader>
// 					<DialogTitle>{editing ? "Ubah Barang" : "Tambah Barang Baru"}</DialogTitle>
// 				</DialogHeader>
// 				<form onSubmit={onSubmit} className="grid gap-3">
// 					<div className="grid gap-1">
// 						<Label>Nama Barang</Label>
// 						<Input value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} required />
// 					</div>
// 					<div className="grid gap-1">
// 						<Label>SKU</Label>
// 						<Input value={sku} onChange={(e) => setSku(e.target.value)} required />
// 					</div>
// 					<div className="grid gap-1">
// 						<Label>Stok</Label>
// 						<Input type="number" min={0} value={stok} onChange={(e) => setStok(e.target.value)} />
// 					</div>
// 					<div className="grid gap-1">
// 						<Label>Lokasi Rak</Label>
// 						<Input value={lokasiRak} onChange={(e) => setLokasiRak(e.target.value)} required />
// 					</div>
// 					<div className="pt-2">
// 						<Button type="submit" className="w-full">
// 							{editing ? "Simpan Perubahan" : "Simpan"}
// 						</Button>
// 					</div>
// 				</form>
// 			</DialogContent>
// 		</Dialog>
// 	)
// }
export function ItemForm(props: Props = { asButton: false }) {
	const editing = props.item
	const [open, setOpen] = useState(false)
	const [namaBarang, setNamaBarang] = useState(editing?.namaBarang || "")
	const [sku, setSku] = useState(editing?.sku || "")
	const [stok, setStok] = useState(editing?.stok?.toString() || "0")
	const [lokasiRak, setLokasiRak] = useState(editing?.lokasiRak || "")
	const { mutateItems } = useItems()
	const { showToast } = useToast()

	async function onSubmit(e?: React.FormEvent) {
		e?.preventDefault()
		const payload = {
			namaBarang,
			sku,
			stok: Number(stok || 0),
			lokasiRak,
		}
		if (editing) {
			await updateItem(editing.id, payload)
			showToast("Barang diubah")
		} else {
			await createItem(payload)
			showToast("Barang ditambahkan")
		}
		await mutateItems()
		setOpen(false)
	}

	const Trigger = props.asMenuItem ? (
		<DialogTrigger asChild>
			<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Ubah</DropdownMenuItem>
		</DialogTrigger>
	) : (
		<DialogTrigger asChild>
			<Button>{editing ? "Ubah Barang" : props.asButton ? "Tambah Barang" : "Tambah"}</Button>
		</DialogTrigger>
	)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{Trigger}
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{editing ? "Ubah Barang" : "Tambah Barang Baru"}</DialogTitle>
				</DialogHeader>
				<form onSubmit={onSubmit} className="grid gap-3">
					<div className="grid gap-1">
						<Label>Nama Barang</Label>
						<Input value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} required />
					</div>
					<div className="grid gap-1">
						<Label>SKU</Label>
						<Input value={sku} onChange={(e) => setSku(e.target.value)} required />
					</div>
					<div className="grid gap-1">
						<Label>Stok</Label>
						<Input type="number" min={0} value={stok} onChange={(e) => setStok(e.target.value)} />
					</div>
					<div className="grid gap-1">
						<Label>Lokasi Rak</Label>
						<Input value={lokasiRak} onChange={(e) => setLokasiRak(e.target.value)} required />
					</div>
					<div className="pt-2">
						<Button type="submit" className="w-full">
							{editing ? "Simpan Perubahan" : "Simpan"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

