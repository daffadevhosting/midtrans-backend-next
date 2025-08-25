import { NextRequest, NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'
import Cors from 'cors'

const cors = Cors({
  methods: ['GET', 'OPTIONS'],
  origin: '*'
})

function runMiddleware(req: NextRequest, res: NextResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// Initialize CoreAPI client for checking status
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next()
    await runMiddleware(request, response, cors)
    
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order ID is required' 
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Content-Type': 'application/json',
          }
        }
      )
    }

    const statusResponse = await coreApi.transaction.status(orderId)
    
    return NextResponse.json({
      success: true,
      data: statusResponse
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error('Error checking transaction status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check transaction status', 
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}