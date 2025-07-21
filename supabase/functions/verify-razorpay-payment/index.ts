
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json()

    console.log('Payment verification request:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id
    })

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      console.error('Razorpay key secret not found')
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, let's verify the payment status directly with Razorpay using the payment ID
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    console.log('Checking payment status with Razorpay API for payment:', razorpay_payment_id)
    
    try {
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      })

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        console.log('Razorpay payment status:', paymentData.status, 'Amount:', paymentData.amount)
        
        // If payment is captured/authorized, consider it successful regardless of signature
        if (paymentData.status === 'captured' || paymentData.status === 'authorized') {
          console.log('Payment is captured/authorized, marking as successful')
          
          // Update order status to confirmed
          const { data: updateData, error } = await supabase
            .from('orders')
            .update({ 
              status: 'confirmed',
              payment_method: 'Razorpay',
              updated_at: new Date().toISOString()
            })
            .eq('id', order_id)
            .select()

          if (error) {
            console.error('Error updating order:', error)
          } else {
            console.log('Order updated successfully for captured payment:', updateData)
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              payment_id: razorpay_payment_id,
              order_id: order_id,
              payment_status: paymentData.status,
              message: 'Payment verified successfully via Razorpay API' 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
        
        // If payment failed, update order accordingly
        if (paymentData.status === 'failed') {
          await supabase
            .from('orders')
            .update({ 
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', order_id)

          return new Response(
            JSON.stringify({ 
              error: 'Payment failed according to Razorpay',
              payment_id: razorpay_payment_id,
              order_id: order_id,
              payment_status: paymentData.status
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }
    } catch (apiError) {
      console.error('Error fetching payment from Razorpay API:', apiError)
      // Continue with signature verification as fallback
    }

    // Fallback to signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id
    console.log('Signature verification body:', body)

    // Generate expected signature using HMAC-SHA256
    const key = new TextEncoder().encode(razorpayKeySecret)
    const data = new TextEncoder().encode(body)
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, data)
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    console.log('Expected signature:', expectedSignature)
    console.log('Received signature:', razorpay_signature)
    console.log('Signatures match:', expectedSignature === razorpay_signature)

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed:', {
        expected: expectedSignature,
        received: razorpay_signature,
        body: body,
        keySecretLength: razorpayKeySecret.length
      })
      
      // In live mode, if signature fails but we couldn't verify via API, 
      // mark as failed but don't immediately reject
      await supabase
        .from('orders')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      return new Response(
        JSON.stringify({ 
          error: 'Payment signature verification failed',
          payment_id: razorpay_payment_id,
          order_id: order_id,
          note: 'If money was debited, please contact support with this payment ID'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Signature verification successful')

    // Update order status in database to confirmed
    console.log('Updating order status for order_id:', order_id)

    const { data: updateData, error } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
        payment_method: 'Razorpay',
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()

    if (error) {
      console.error('Error updating order:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update order status',
          details: error.message,
          payment_id: razorpay_payment_id
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Order update result:', updateData)
    console.log('Payment verified and order updated successfully:', {
      order_id,
      payment_id: razorpay_payment_id
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: razorpay_payment_id,
        order_id: order_id,
        message: 'Payment verified successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Payment verification failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
