"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LoginPage() {
	const router = useRouter()
	return (
		<main className="min-h-svh grid place-items-center px-4 py-10">
			<div className="w-full max-w-md">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-3 size-10 rounded-md bg-primary/10 ring-1 ring-primary/20" />
					<h1 className="text-2xl font-semibold tracking-tight">Warehouse Management System</h1>
					<p className="text-sm text-muted-foreground">Masuk untuk mengelola persediaan Anda</p>
				</div>
				<LoginForm />
			</div>
		</main>
	)
}
