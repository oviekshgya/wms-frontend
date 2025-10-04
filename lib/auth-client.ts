"use client"

import { useEffect, useState, useCallback } from "react"

export type Role = "admin" | "staff"
export type User = {
	id: string
	email: string
	name?: string
	role: Role
}

const USER_KEY = "wms-user"
const ROLE_KEY = "wms-role"
const USERS_KEY = "wms-users"

type StoredUser = {
	id: string
	email: string
	name?: string
	role: Role
	password: string
}

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

function readUsers(): StoredUser[] {
	if (typeof window === "undefined") return []
	const raw = localStorage.getItem(USERS_KEY)
	return raw ? (JSON.parse(raw) as StoredUser[]) : []
}

function writeUsers(users: StoredUser[]) {
	if (typeof window === "undefined") return
	localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function useAuth() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		setUser(readUser())
		setLoading(false)
	}, [])

	const signUp = useCallback(async (payload: { email: string; name?: string; role: Role; password: string }) => {
		const users = readUsers()
		const exists = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase())
		if (exists) {
			return { error: "Email sudah terdaftar" as const }
		}
		if (!payload.password || payload.password.length < 4) {
			return { error: "Password minimal 4 karakter" as const }
		}
		const su: StoredUser = {
			id: crypto.randomUUID(),
			email: payload.email,
			name: payload.name,
			role: payload.role,
			password: payload.password,
		}
		writeUsers([su, ...users])

		const sessionUser: User = { id: su.id, email: su.email, name: su.name, role: su.role }
		writeUser(sessionUser)
		localStorage.setItem(ROLE_KEY, su.role)
		setUser(sessionUser)
		return { ok: true as const }
	}, [])

	const signIn = useCallback(async (email: string, password: string) => {
		const users = readUsers()
		const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
		if (!found || found.password !== password) {
			return { error: "Email atau password salah" as const }
		}
		const sessionUser: User = { id: found.id, email: found.email, name: found.name, role: found.role }
		writeUser(sessionUser)
		localStorage.setItem(ROLE_KEY, found.role)
		setUser(sessionUser)
		return { ok: true as const }
	}, [])

	const signOut = useCallback(() => {
		writeUser(null)
		setUser(null)
	}, [])

	return { user, loading, signUp, signIn, signOut }
}
