import { createClient } from "@/lib/supabase/server"
import type { Restaurant, MenuCategory, MenuItem } from "@/lib/types"
import { notFound } from "next/navigation"
import { RestaurantMenu } from "@/components/restaurant-menu"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils/format"

interface RestaurantPageProps {
  params: Promise<{ slug: string }>
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single()

  console.log("[v0] Restaurant query for slug:", slug)
  console.log("[v0] Restaurant result:", { restaurant, error: restaurantError })

  if (!restaurant) {
    notFound()
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("display_order")

  console.log("[v0] Categories query for restaurant_id:", restaurant.id)
  console.log("[v0] Categories result:", { categories, error: categoriesError })

  const { data: menuItems, error: menuItemsError } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("name")

  console.log("[v0] Menu items query for restaurant_id:", restaurant.id)
  console.log("[v0] Menu items result:", { menuItems, error: menuItemsError })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          {restaurant.is_open ? (
            <Badge variant="secondary">Abierto</Badge>
          ) : (
            <Badge variant="destructive">Cerrado</Badge>
          )}
        </div>
      </header>

      {/* Restaurant Info */}
      <section className="border-b bg-muted/50">
        <div className="container py-8">
          <p className="text-lg text-muted-foreground mb-4">{restaurant.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-semibold">Horario:</span> {formatTime(restaurant.opening_time)} -{" "}
              {formatTime(restaurant.closing_time)}
            </div>
            <div>
              <span className="font-semibold">Tiempo promedio:</span> {restaurant.average_prep_time_minutes} minutos
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      {(!categories || categories.length === 0) && (!menuItems || menuItems.length === 0) && (
        <div className="container py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-semibold text-yellow-800">Debug Info:</p>
            <p className="text-sm text-yellow-700">Categories: {categories?.length || 0}</p>
            <p className="text-sm text-yellow-700">Menu Items: {menuItems?.length || 0}</p>
            <p className="text-sm text-yellow-700 mt-2">
              Si ves esto, significa que no hay datos en las tablas menu_categories o menu_items. Ejecuta los scripts
              002 y 003 para insertar datos de prueba.
            </p>
          </div>
        </div>
      )}

      <RestaurantMenu
        restaurant={restaurant as Restaurant}
        categories={(categories as MenuCategory[]) || []}
        menuItems={(menuItems as MenuItem[]) || []}
      />
    </div>
  )
}
