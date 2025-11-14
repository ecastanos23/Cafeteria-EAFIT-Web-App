"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, CheckCircle2, Package, Utensils } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils/format"
import { use } from "react"

interface OrderTrackingProps {
  params: Promise<{ id: string }>
}

export default function OrderTrackingPage({ params }: OrderTrackingProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [queueInfo, setQueueInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrderData()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("order-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("[v0] Order updated:", payload)
          setOrder(payload.new)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_queue",
          filter: `order_id=eq.${id}`,
        },
        (payload) => {
          console.log("[v0] Queue updated:", payload)
          setQueueInfo(payload.new)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const fetchOrderData = async () => {
    try {
      const { data: orderData } = await supabase
        .from("orders")
        .select(`
          *,
          restaurants (name, slug, average_prep_time_minutes),
          order_items (
            *,
            menu_items (name, prep_time_minutes)
          )
        `)
        .eq("id", id)
        .single()

      const { data: queueData } = await supabase.from("order_queue").select("*").eq("order_id", id).single()

      setOrder(orderData)
      setQueueInfo(queueData)
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-muted-foreground">Pedido no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusProgress = (status: string) => {
    const statusMap: Record<string, number> = {
      pending: 25,
      preparing: 50,
      ready: 75,
      completed: 100,
    }
    return statusMap[status] || 0
  }

  const estimatedTime =
    order.order_items?.reduce((max: number, item: any) => Math.max(max, item.menu_items?.prep_time_minutes || 0), 0) ||
    order.restaurants?.average_prep_time_minutes ||
    10

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Seguimiento de Pedido</h1>
        </div>
      </header>

      <div className="container py-8 max-w-2xl space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estado del Pedido</CardTitle>
              <Badge variant={order.status === "ready" ? "default" : "secondary"}>
                {order.status === "pending" && "Pendiente"}
                {order.status === "preparing" && "Preparando"}
                {order.status === "ready" && "Listo para Recoger"}
                {order.status === "completed" && "Completado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={getStatusProgress(order.status)} className="h-2" />

            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`rounded-full p-3 ${order.status !== "cancelled" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-xs text-center">Recibido</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`rounded-full p-3 ${["preparing", "ready", "completed"].includes(order.status) ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Utensils className="h-5 w-5" />
                </div>
                <span className="text-xs text-center">Preparando</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`rounded-full p-3 ${["ready", "completed"].includes(order.status) ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-xs text-center">Listo</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`rounded-full p-3 ${order.status === "completed" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-xs text-center">Entregado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Position */}
        {queueInfo && order.status !== "completed" && (
          <Card>
            <CardHeader>
              <CardTitle>Posición en la Cola</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">#{queueInfo.queue_number}</div>
                  <p className="text-sm text-muted-foreground mt-1">Tu número de turno</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-2xl font-semibold">~{estimatedTime} min</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Tiempo estimado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">{order.restaurants?.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.menu_items?.name}
                  </span>
                  <span>{formatPrice(item.price_cents * item.quantity)}</span>
                </div>
              ))}
            </div>

            {order.special_instructions && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-1">Instrucciones Especiales:</p>
                <p className="text-sm text-muted-foreground">{order.special_instructions}</p>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total_cents)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
