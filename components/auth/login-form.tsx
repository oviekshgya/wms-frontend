"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth, type Role } from "../../lib/auth-client"
import { useRouter } from "next/navigation"

export function LoginForm() {
	const router = useRouter()
	const { signIn } = useAuth()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [role, setRole] = useState<Role>("admin")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		const res = await signIn(email, password)
		setLoading(false)
		if ("error" in res) {
			setError(res.error ?? "Terjadi kesalahan")
			return
		}
		router.push("/")
	}

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Masuk ke WMS</CardTitle>
				<CardDescription>Gunakan email dan pilih peran untuk masuk.</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4" onSubmit={onSubmit}>
					<div className="grid gap-1">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="grid gap-1">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="grid gap-1">
						<Label>Peran</Label>
						<Select value={role} onValueChange={(v) => setRole(v as Role)}>
							<SelectTrigger>
								<SelectValue placeholder="Pilih peran" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="staff">Staff</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Memproses..." : "Masuk"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Belum punya akun?{" "}
						<a href="/register" className="underline underline-offset-4">
							Daftar
						</a>
					</p>
				</form>
			</CardContent>
		</Card>
	)
}
