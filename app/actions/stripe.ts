"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession(orderId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  // Get order details
  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      restaurants (name),
      order_items (
        *,
        menu_items (name)
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    throw new Error("Pedido no encontrado")
  }

  // Create line items for Stripe
  const lineItems = order.order_items.map((item: any) => ({
    price_data: {
      currency: "cop",
      product_data: {
        name: item.menu_items.name,
        description: `${order.restaurants.name}`,
      },
      unit_amount: item.price_cents,
    },
    quantity: item.quantity,
  }))

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: lineItems,
    mode: "payment",
    metadata: {
      order_id: orderId,
      user_id: user.id,
    },
  })

  // Update order with payment intent
  await supabase.from("orders").update({ payment_intent_id: session.id }).eq("id", orderId)

  return session.client_secret
}

export async function confirmPayment(orderId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  // Update order payment status
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "preparing",
    })
    .eq("id", orderId)
    .eq("user_id", user.id)

  if (error) throw error

  // Add to queue
  const { data: order } = await supabase
    .from("orders")
    .select("restaurant_id, order_items(menu_items(is_priority_item))")
    .eq("id", orderId)
    .single()

  if (order) {
    const isPriority = order.order_items?.every((item: any) => item.menu_items?.is_priority_item)

    await supabase.rpc("add_order_to_queue", {
      p_order_id: orderId,
      p_restaurant_id: order.restaurant_id,
      p_is_priority: isPriority || false,
    })
  }

  return { success: true }
}
