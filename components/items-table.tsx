"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemForm } from "./item-form"
import { useItems, deleteItem } from "@/lib/wms-client"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal } from "lucide-react"

// For role-based UI
type Role = "admin" | "staff"

export function ItemsTable({ role }: { role: Role }) {
  const { items, isLoading, mutateItems } = useItems()
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<"namaBarang" | "sku" | "stok" | "lokasiRak">("namaBarang")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const base = items.filter(
      (it) =>
        it.namaBarang.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q) ||
        it.lokasiRak.toLowerCase().includes(q),
    )
    const sorted = [...base].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va
      }
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return sorted
  }, [items, query, sortKey, sortDir])

  async function onDelete(id: string) {
    await deleteItem(id)
    await mutateItems()
    toast({ title: "Barang dihapus" })
  }

  function toggleSort(key: typeof sortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-pretty">Daftar Barang</CardTitle>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row">
          <Input
            placeholder="Cari nama, SKU, atau lokasi rak..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {role === "admin" && <ItemForm asButton />}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("namaBarang")}>
                Nama Barang
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("sku")}>
                SKU
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("stok")}>
                Stok
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("lokasiRak")}>
                Lokasi Rak
              </TableHead>
              <TableHead className="w-16 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Memuat...</TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((it) => (
                <TableRow key={it.id} className={it.stok <= 5 ? "bg-amber-50/50 dark:bg-amber-500/5" : ""}>
                  <TableCell className="font-medium">{it.namaBarang}</TableCell>
                  <TableCell className="text-muted-foreground">{it.sku}</TableCell>
                  <TableCell className={it.stok <= 5 ? "text-amber-600 font-semibold" : ""}>{it.stok}</TableCell>
                  <TableCell>{it.lokasiRak}</TableCell>
                  <TableCell className="text-right">
                    {role === "admin" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ItemForm item={it} asMenuItem />
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(it.id)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
