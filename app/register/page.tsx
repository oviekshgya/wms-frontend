"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-client"

export default function RegisterPage() {
	const { signUp } = useAuth()
	const router = useRouter()
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [role, setRole] = useState<"admin" | "staff">("staff")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		const res = await signUp({ email, name, role, password })
		setLoading(false)
		if ("error" in res) {
			setError(res.error ?? null)
			return
		}
		router.replace("/")
	}

	return (
		<main className="min-h-svh flex items-center justify-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-pretty">Daftar</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="grid gap-3">
						<div className="grid gap-1">
							<Label htmlFor="name">Nama</Label>
							<Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="grid gap-1">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="grid gap-1">
							<Label>Peran</Label>
							<Select value={role} onValueChange={(v) => setRole(v as "admin" | "staff")}>
								<SelectTrigger>
									<SelectValue placeholder="Pilih peran" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="staff">Staff</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						{error ? <p className="text-sm text-destructive">{error}</p> : null}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Memproses..." : "Daftar"}
						</Button>
						<p className="text-sm text-muted-foreground">
							Sudah punya akun?{" "}
							<Link href="/login" className="underline underline-offset-4">
								Masuk
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</main>
	)
}
