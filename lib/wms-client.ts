"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { nanoid } from "nanoid"

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
export async function getItems(): Promise<Item[]> {
	return readItems()
}
export async function getMovements(): Promise<Movement[]> {
	return readMoves()
}
export async function createItem(payload: Omit<Item, "id">) {
	const items = readItems()
	items.push({ id: nanoid(), ...payload })
	writeItems(items)
	await globalMutate("items")
}
export async function updateItem(id: string, payload: Partial<Omit<Item, "id">>) {
	const items = readItems().map((it) => (it.id === id ? { ...it, ...payload } : it))
	writeItems(items)
	await globalMutate("items")
}
export async function deleteItem(id: string) {
	const items = readItems().filter((it) => it.id !== id)
	writeItems(items)
	await globalMutate("items")
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

		const res = await fetch("http://localhost:8000/api/transactions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				item_id: itemId,
				type,
				quantity: qty,
				keterangan
			})
			//credentials: "include" // penting untuk cookie-based auth
		})

		const data = await res.json()
		if (!res.ok) {
			return { error: data.message || "Transaksi gagal" }
		}

		return { transaction: data.transaction, item: data.item }
	} catch (err: any) {
		return { error: err.message || "Transaksi gagal" }
	}
}

// SWR hooks
export function useItems() {
	const { data, isLoading, mutate } = useSWR<Item[]>("items", getItems, { revalidateOnFocus: false })
	return {
		items: data || [],
		isLoading,
		mutateItems: () => mutate(),
		mutateMovements: () => globalMutate("moves"),
	}
}
export function useMovements() {
	const { data, isLoading, mutate } = useSWR<Movement[]>("moves", getMovements, { revalidateOnFocus: false })
	return {
		movements: data || [],
		isLoading,
		mutate,
	}
}
