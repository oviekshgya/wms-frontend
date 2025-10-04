"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../../lib/auth-client"
import { useRouter } from "next/navigation"

export function LoginForm() {
	const router = useRouter()
	const { signIn } = useAuth()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			// 🔹 Coba login ke backend Laravel API
			const res = await fetch("http://localhost:8000/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ email, password }),
			})

			if (!res.ok) {
				const err = await res.json().catch(() => ({}))
				throw new Error(err.message || "Login gagal, periksa email dan password.")
			}

			const data = await res.json()

			// 🔹 Simpan user & token ke localStorage
			localStorage.setItem("wms-user", JSON.stringify(data.user))
			localStorage.setItem("wms-role", data.user.role)
			localStorage.setItem("wms-token", data.token)

			setLoading(false)
			router.push("/")
			return
		} catch (apiError) {
			console.warn("Login API gagal, fallback ke local auth:", apiError)
			// 🔸 Fallback ke local storage auth (offline mode)
			const res = await signIn(email, password)
			setLoading(false)

			if ("error" in res) {
				setError(res.error ?? "Email atau password salah")
				return
			}

			router.push("/")
		}
	}

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Masuk ke WMS</CardTitle>
				<CardDescription>Gunakan email dan password untuk masuk.</CardDescription>
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
