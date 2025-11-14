"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { CartItem, Restaurant } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from "@/lib/utils/format"
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledFor, setScheduledFor] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const cartData = localStorage.getItem("cart")
    if (cartData) {
      const { restaurantId, items } = JSON.parse(cartData)
      setCart(items)

      // Fetch restaurant data
      supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single()
        .then(({ data }) => setRestaurant(data))
    }
  }, [])

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (item.menuItem.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)

      localStorage.setItem(
        "cart",
        JSON.stringify({
          restaurantId: restaurant?.id,
          items: updated,
        }),
      )

      return updated
    })
  }

  const removeItem = (itemId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.menuItem.id !== itemId)
      localStorage.setItem(
        "cart",
        JSON.stringify({
          restaurantId: restaurant?.id,
          items: updated,
        }),
      )
      return updated
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price_cents * item.quantity, 0)

  const handleCheckout = async () => {
    if (!restaurant || cart.length === 0) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          restaurant_id: restaurant.id,
          status: "pending",
          total_cents: cartTotal,
          payment_status: "pending",
          special_instructions: specialInstructions || null,
          scheduled_for: scheduledFor || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price_cents: item.menuItem.price_cents,
        customizations: item.customizations || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      localStorage.removeItem("cart")

      // Navigate to payment
      router.push(`/checkout/${order.id}`)
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error al crear el pedido. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carrito Vacío</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">No tienes items en tu carrito</p>
            <Button asChild className="w-full">
              <Link href="/">Explorar Restaurantes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/restaurants/${restaurant?.slug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Tu Pedido</h1>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Items del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.menuItem.image_url && (
                        <Image
                          src={item.menuItem.image_url || "/placeholder.svg"}
                          alt={item.menuItem.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.menuItem.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.menuItem.price_cents)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.menuItem.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.menuItem.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-auto"
                          onClick={() => removeItem(item.menuItem.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      {formatPrice(item.menuItem.price_cents * item.quantity)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ej: Sin cebolla, extra salsa..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Schedule Order */}
            <Card>
              <CardHeader>
                <CardTitle>Programar Pedido (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="scheduled">Recoger a las:</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                  {isLoading ? "Procesando..." : "Continuar al Pago"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
