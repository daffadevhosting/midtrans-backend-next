import { NextRequest, NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'

// Initialize Snap client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

const yourUrl = 'https://your-domain.vercel.app/thank-you';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { orderId, amount, customerDetails, itemDetails } = body

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Order ID and amount are required' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
          }
        }
      )
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: customerDetails || {
        first_name: 'Customer',
        email: 'customer@example.com',
      },
      item_details: itemDetails || [
        {
          id: 'item1',
          price: amount,
          quantity: 1,
          name: 'Product Name',
        },
      ],
      credit_card: {
        secure: true,
      },
    }

    const transaction = await snap.createTransaction(parameter)
    
    return new Response(
      JSON.stringify({
        success: true,
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        thank_you_url: `${yourUrl}?order_id=${orderId}`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      }
    )
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to create transaction', 
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      }
    )
  }
}

export async function OPTIONS() {
  return new Response(
    JSON.stringify({}),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}