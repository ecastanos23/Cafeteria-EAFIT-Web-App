import { createClient } from "@/lib/supabase/server"
import type { Restaurant } from "@/lib/types"
import { RestaurantCard } from "@/components/restaurant-card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, History } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()

  const { data: restaurants, error } = await supabase.from("restaurants").select("*").order("name")

  console.log("[v0] Restaurants query result:", { restaurants, error })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Cafetería EAFIT</h1>
          </Link>
          <div className="flex items-center gap-2">
            {user.user ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/orders">
                    <History className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-muted/50">
        <div className="container py-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Ordena tu comida favorita</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explora los mejores restaurantes de la universidad, haz tu pedido y recógelo sin esperar en fila.
          </p>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="container py-12">
        <h3 className="text-2xl font-bold mb-6">Restaurantes Disponibles</h3>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se pudieron cargar los restaurantes: {error.message}</AlertDescription>
          </Alert>
        ) : !restaurants || restaurants.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No hay restaurantes disponibles</AlertTitle>
            <AlertDescription>
              Los restaurantes aún no han sido configurados. Por favor, ejecuta los scripts de la carpeta /scripts en
              orden:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>001_create_tables.sql (ya ejecutado)</li>
                <li>002_seed_restaurants.sql</li>
                <li>003_seed_menus.sql</li>
                <li>004_queue_functions.sql</li>
              </ol>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant: Restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
