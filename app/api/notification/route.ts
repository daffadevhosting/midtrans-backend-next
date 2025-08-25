import { NextRequest, NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'
import Cors from 'cors'

const cors = Cors({
  methods: ['POST', 'OPTIONS'],
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

// Initialize CoreAPI client for handling notifications
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next()
    await runMiddleware(request, response, cors)
    
    const body = await request.json()
    
    // Verify the notification using Midtrans
    const statusResponse = await coreApi.transaction.notification(body)
    
    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status

    console.log(`Received notification for order ${orderId}`)
    console.log(`Transaction status: ${transactionStatus}`)
    console.log(`Fraud status: ${fraudStatus}`)

    // Sample transaction status handling logic
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        // TODO: update transaction status in your database to success
        console.log(`Payment for order ${orderId} successfully captured`)
      }
    } else if (transactionStatus == 'settlement') {
      // TODO: update transaction status in your database to success
      console.log(`Payment for order ${orderId} successfully settled`)
    } else if (
      transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'
    ) {
      // TODO: update transaction status in your database to failure
      console.log(`Payment for order ${orderId} failed`)
    } else if (transactionStatus == 'pending') {
      // TODO: update transaction status in your database to pending
      console.log(`Payment for order ${orderId} is pending`)
    }

    return NextResponse.json({ 
      success: true,
      received: true,
      orderId,
      status: transactionStatus 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error('Error handling notification:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process notification', 
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}