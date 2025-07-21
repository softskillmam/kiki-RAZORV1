
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "npm:razorpay@2.9.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'INR' } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not found')
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return new Response(
      JSON.stringify({ 
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: razorpayKeyId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create payment order' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
