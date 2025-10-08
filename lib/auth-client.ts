"use client"

import { useEffect, useState, useCallback } from "react"

export type Role = "admin" | "staff"
export type User = {
	id: number
	email: string
	name?: string
	role: Role
}

const USER_KEY = "wms-user"
const ROLE_KEY = "wms-role"
const TOKEN_KEY = "wms-token"

function readUser(): User | null {
	if (typeof window === "undefined") return null
	const raw = localStorage.getItem(USER_KEY)
	return raw ? (JSON.parse(raw) as User) : null
}

function writeUser(u: User | null) {
	if (typeof window === "undefined") return
	if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
	else localStorage.removeItem(USER_KEY)
}

export function useAuth() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		setUser(readUser())
		setLoading(false)
	}, [])

	// ✅ Register user ke backend
	const signUp = useCallback(async (payload: { email: string; name?: string; role: Role; password: string }) => {
		try {
			const res = await fetch("http://localhost:9000/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				const errorText = await res.text()
				return { error: `Gagal register: ${errorText}` }
			}

			const data = await res.json()

			// Simpan token & user ke localStorage
			if (data.token) localStorage.setItem(TOKEN_KEY, data.token)
			if (data.user) {
				const sessionUser: User = {
					id: data.user.id,
					email: data.user.email,
					name: data.user.name,
					role: data.user.role,
				}
				writeUser(sessionUser)
				localStorage.setItem(ROLE_KEY, data.user.role)
				setUser(sessionUser)
			}

			return { ok: true as const }
		} catch (err) {
			console.error("Register error:", err)
			return { error: "Terjadi kesalahan server" as const }
		}
	}, [])

	// ✅ Login user ke backend
	const signIn = useCallback(async (email: string, password: string) => {
		try {
			const res = await fetch("http://localhost:9000/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ email, password }),
				credentials: "include"
			})

			if (!res.ok) {
				const errorText = await res.text()
				return { error: `Login gagal: ${errorText}` }
			}

			const data = await res.json()

			// Simpan token & user ke localStorage
			if (data.token) localStorage.setItem(TOKEN_KEY, data.token)
			if (data.user) {
				const sessionUser: User = {
					id: data.user.id,
					email: data.user.email,
					name: data.user.name,
					role: data.user.role,
				}
				writeUser(sessionUser)
				localStorage.setItem(ROLE_KEY, data.user.role)
				setUser(sessionUser)
			}

			return { ok: true as const }
		} catch (err) {
			console.error("Login error:", err)
			return { error: "Terjadi kesalahan server" as const }
		}
	}, [])

	// ✅ Logout
	const signOut = useCallback(() => {
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(ROLE_KEY)
		localStorage.removeItem(USER_KEY)
		writeUser(null)
		setUser(null)
	}, [])

	return { user, loading, signUp, signIn, signOut }
}
