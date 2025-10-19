"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useItems, Item } from "@/lib/wms-client"
import { ItemsTable } from "@/components/items-table"
import { ItemForm } from "@/components/item-form"
import { TransactionForm } from "@/components/transaction-form"
import { StockChart } from "@/components/stock-chart"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

// Simple role type
type Role = "admin" | "staff"

export default function HomePage() {
	const [role, setRole] = useState<Role>(
		(typeof window !== "undefined" && (localStorage.getItem("wms-role") as Role)) || "admin",
	)

	// const { items } = useItems()
	const { items = [] } = useItems() as { items: Item[] }


	const totalSku = items.length
	const totalStok = items.reduce((acc, it) => acc + it.stok, 0)
	const lowStockCount = items.filter((it) => it.stok <= 5).length

	const router = useRouter()
	const { user, signOut, loading } = useAuth()

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/login")
		}
	}, [loading, user, router])

	if (loading) return <p>Loading...</p>
	if (!user) return null


	function switchRole(next: Role) {
		setRole(next)
		if (typeof window !== "undefined") localStorage.setItem("wms-role", next)
	}

	return (
		<main className="min-h-svh">
			<header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-3">
						<div className="size-8 rounded-md bg-primary/10 ring-1 ring-primary/20" />
						<p className="text-pretty font-semibold tracking-tight">WMS Dashboard</p>
					</div>
					<div className="flex items-center gap-2">
						{/* <Tabs value={role} onValueChange={(v) => switchRole(v as Role)} className="rounded-md border">
							<TabsList className="grid grid-cols-2">
								<TabsTrigger value="admin">Admin</TabsTrigger>
								<TabsTrigger value="staff">Staff</TabsTrigger>
							</TabsList>
						</Tabs> */}
						{/* Tombol Sign Out */}
						<Button
							variant="destructive"
							onClick={() => {
								signOut()
								router.replace("/login")
							}}
						>
							Keluar
						</Button>
					</div>
				</div>
			</header>

			<section className="mx-auto max-w-6xl px-4 py-6 md:py-8">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Total SKU</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-semibold">{totalSku}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Total Stok</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-semibold">{totalStok}</div>
						</CardContent>
					</Card>
					<Card className={cn(lowStockCount > 0 ? "border-amber-400" : "")}>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Low Stock (≤5)</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-semibold">{lowStockCount}</div>
						</CardContent>
					</Card>
				</div>

				<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="text-pretty">Pergerakan Stok 14 Hari</CardTitle>
						</CardHeader>
						<CardContent>
							<StockChart />
						</CardContent>
					</Card>
					<Card>
						{/* <CardHeader>
							<CardTitle className="text-pretty">Aksi Cepat</CardTitle>
						</CardHeader> */}
						<CardContent className="grid gap-3">
							{role === "admin" ? (
								<>
									{/* <ItemForm /> */}
									{/* <Separator /> */}
									<TransactionForm />
								</>
							) : (
								<>
									<p className="text-sm text-muted-foreground">
										Mode Staff: Hanya bisa melakukan transaksi barang masuk/keluar.
									</p>
									<TransactionForm />
								</>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="mt-6">
					<ItemsTable role={role} />
				</div>
			</section>

			<footer className="border-t">
				<div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
					© {new Date().getFullYear()} WMS Demo. UI by shadcn — Data tersimpan di browser Anda.
				</div>
			</footer>
		</main>
	)
}
