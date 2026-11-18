// NEW FILE: components/stock-movement/product-filter-picker.tsx
"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useGetProducts } from "@/utils/hooks/tanstack/products/use-get-all-products"

export interface PickedProduct {
  id: string
  name: string
}

// The user searches and sees product names; the parent only needs the id for the query.
export function ProductFilterPicker({
  value,
  onChange,
}: {
  value: PickedProduct | null
  onChange: (product: PickedProduct | null) => void
}) {
  const [text, setText] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 300)
    return () => clearTimeout(t)
  }, [text])

  const { data, isFetching } = useGetProducts({ name: debounced || undefined, limit: 8 })
  const products = data?.products ?? []

  if (value) {
    return (
      <div className="flex h-9 w-64 items-center justify-between gap-2 rounded-md border px-3 text-sm">
        <span className="truncate">{value.name}</span>
        <button
          type="button"
          aria-label="Clear product"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            onChange(null)
            setText("")
            setDebounced("")
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-64">
      <Input
        placeholder="Search product by name"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {isFetching && products.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">Searching…</li>
          ) : products.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">No products found.</li>
          ) : (
            products.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  // mouse down (not click) so the input's blur does not close the list first
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onChange({ id: p.id, name: p.name })
                    setOpen(false)
                  }}
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}