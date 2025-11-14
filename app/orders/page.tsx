import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils/format"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      restaurants (name, slug),
      order_items (
        *,
        menu_items (name, image_url)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      preparing: "default",
      ready: "default",
      completed: "outline",
      cancelled: "destructive",
    }

    const labels: Record<string, string> = {
      pending: "Pendiente",
      preparing: "Preparando",
      ready: "Listo",
      completed: "Completado",
      cancelled: "Cancelado",
    }

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Mis Pedidos</h1>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.restaurants?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.menu_items?.name}
                        </span>
                        <span>{formatPrice(item.price_cents * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {order.queue_position && (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Posición en cola: #{order.queue_position}</span>
                        </>
                      )}
                    </div>
                    <div className="font-bold text-lg">{formatPrice(order.total_cents)}</div>
                  </div>
                  {order.status === "pending" && (
                    <Button asChild className="w-full mt-4">
                      <Link href={`/orders/${order.id}/track`}>Ver Estado del Pedido</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No tienes pedidos aún</p>
              <Button asChild>
                <Link href="/">Explorar Restaurantes</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
