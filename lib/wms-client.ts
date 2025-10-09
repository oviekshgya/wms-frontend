"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"

export type Item = {
	id: string
	namaBarang: string
	sku: string
	stok: number
	lokasiRak: string
}

export type Movement = {
	id: string
	itemId: string
	type: "in" | "out"
	qty: number
	date: string // ISO
}

const STORE_KEY = "wms-items-v1"
const MOVE_KEY = "wms-moves-v1"


const API_URL = "http://localhost:9000/api"
// const TOKEN = localStorage.getItem("wms-token")


function ensureSeeded() {
	if (typeof window === "undefined") return
	if (!localStorage.getItem(STORE_KEY)) {
		const seed: Item[] = [
			{ id: nanoid(), namaBarang: "Sabun Cair Lavender", sku: "SBN-LAV-250", stok: 24, lokasiRak: "A-01" },
			{ id: nanoid(), namaBarang: "Shampoo Herbal", sku: "SHP-HRB-500", stok: 8, lokasiRak: "B-12" },
			{ id: nanoid(), namaBarang: "Body Lotion Citrus", sku: "BLT-CTR-200", stok: 4, lokasiRak: "A-05" },
		]
		localStorage.setItem(STORE_KEY, JSON.stringify(seed))
	}
	if (!localStorage.getItem(MOVE_KEY)) {
		const now = new Date()
		const seedMoves: Movement[] = [
			{
				id: nanoid(),
				itemId: JSON.parse(localStorage.getItem(STORE_KEY)!).at(0).id,
				type: "in",
				qty: 10,
				date: now.toISOString(),
			},
		]
		localStorage.setItem(MOVE_KEY, JSON.stringify(seedMoves))
	}
}
ensureSeeded()

// Utilities
function readItems(): Item[] {
	const raw = localStorage.getItem(STORE_KEY)
	return raw ? (JSON.parse(raw) as Item[]) : []
}
function writeItems(items: Item[]) {
	localStorage.setItem(STORE_KEY, JSON.stringify(items))
}
function readMoves(): Movement[] {
	const raw = localStorage.getItem(MOVE_KEY)
	return raw ? (JSON.parse(raw) as Movement[]) : []
}
function writeMoves(moves: Movement[]) {
	localStorage.setItem(MOVE_KEY, JSON.stringify(moves))
}

// Public API (simulate async)
async function getItems(params?: { search?: string; sort?: string }) {
	const token = typeof window !== "undefined" ? localStorage.getItem("wms-token") : null
	if (!token) throw new Error("Token tidak ditemukan di localStorage")

	const query = new URLSearchParams()
	if (params?.search) query.append("search", params.search)
	if (params?.sort) query.append("sort", params.sort)

	const res = await fetch(`${API_URL}/items?${query.toString()}`, {
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(errText)
	}

	const json = await res.json()
	// Backend Laravel mengirimkan paginated response
	// Kita hanya ambil field "data" (array item)
	return json.data.map((it: any) => ({
		id: it.id,
		namaBarang: it.nama_barang,
		sku: it.sku,
		stok: it.stok,
		lokasiRak: it.lokasi_rak,
	}))
}

export async function getMovements(): Promise<Movement[]> {
	return readMoves()
}


export async function createItem(payload: {
	namaBarang: string
	sku: string
	stok: number
	lokasiRak: string
}) {
	const token = typeof window !== "undefined" ? localStorage.getItem("wms-token") : null
	if (!token) throw new Error("Token tidak ditemukan di localStorage")
	const res = await fetch(`${API_URL}/items`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			nama_barang: payload.namaBarang,
			sku: payload.sku,
			stok: payload.stok,
			lokasi_rak: payload.lokasiRak,
		}),
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(errText)
	}

	return res.json()
}

export async function updateItem(
	id: number | string,
	payload: {
		namaBarang: string
		sku: string
		stok: number
		lokasiRak: string
	}
) {
	const token = typeof window !== "undefined" ? localStorage.getItem("wms-token") : null
	if (!token) throw new Error("Token tidak ditemukan di localStorage")

	const res = await fetch(`${API_URL}/items/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			nama_barang: payload.namaBarang,
			sku: payload.sku,
			stok: payload.stok,
			lokasi_rak: payload.lokasiRak,
		}),
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(errText)
	}

	return res.json()
}

export async function deleteItem(id: number | string) {
	const token = typeof window !== "undefined" ? localStorage.getItem("wms-token") : null
	if (!token) throw new Error("Token tidak ditemukan di localStorage")

	const res = await fetch(`${API_URL}/items/${id}`, {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(errText)
	}

	return res.json()
}

export async function transact({
	itemId,
	type,
	qty,
	keterangan = ""
}: {
	itemId: number | string
	type: "in" | "out"
	qty: number
	keterangan?: string
}) {
	try {
		const token = typeof window !== "undefined" ? localStorage.getItem("wms-token") : null
		if (!token) throw new Error("User tidak terautentikasi")

		const res = await fetch(`${API_URL}/transactions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				item_id: Number(itemId),
				type,
				quantity: qty,
				keterangan
			})
		})

		let data: any
		try {
			data = await res.json()
		} catch {
			return { error: `Server returned non-JSON (status ${res.status})` }
		}

		if (!res.ok) {
			return { error: data?.message || JSON.stringify(data) || "Transaksi gagal" }
		}

		return { transaction: data.transaction, item: data.item }
	} catch (err: any) {
		return { error: err.message || "Transaksi gagal" }
	}
}

// SWR hooks

export function useItems(search?: string, sort?: string) {
	const { data, error, isLoading, mutate } = useSWR<Item[]>(
		["items", search, sort],
		() => getItems({ search, sort })
	)

	return {
		items: data || ([] as Item[]),
		isLoading,
		error,
		mutateItems: mutate,
	}
}

export function useMovements() {
	const [movements, setMovements] = useState<Movement[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	async function loadMovements() {
		try {
			setLoading(true)
			const token = localStorage.getItem("wms-token")
			const res = await fetch("http://localhost:9000/api/reports/weekly-movements", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()

			const parsed = data.map((m: any) => ({
				date: m.date,
				type: m.type,
				qty: Number(m.total),
			}))
			setMovements(parsed)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadMovements()
	}, [])

	return { movements, loading, error, mutateMovements: loadMovements }
}
