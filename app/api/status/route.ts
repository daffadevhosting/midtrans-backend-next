import { NextRequest, NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'

// Initialize CoreAPI client for checking status
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Order ID is required' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          }
        }
      )
    }

    const statusResponse = await coreApi.transaction.status(orderId)
    
    return new Response(
      JSON.stringify({
        success: true,
        data: statusResponse
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      }
    )
  } catch (error: any) {
    console.error('Error checking transaction status:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to check transaction status', 
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}