import { NextRequest, NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'

// Initialize CoreAPI client
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify the notification using Midtrans
    const statusResponse = await coreApi.transaction.notification(body)
    
    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status
    const paymentType = statusResponse.payment_type
    const transactionTime = statusResponse.transaction_time

    console.log(`Webhook received for order ${orderId}`)
    console.log(`Transaction status: ${transactionStatus}`)
    console.log(`Fraud status: ${fraudStatus}`)
    console.log(`Payment type: ${paymentType}`)

    // Sample transaction status handling logic
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        // TODO: update transaction status in your database to success
        console.log(`Payment for order ${orderId} successfully captured`)
        
        // You can trigger additional actions here:
        // - Send confirmation email
        // - Update inventory
        // - Create invoice
        // - etc.
      }
    } else if (transactionStatus == 'settlement') {
      // TODO: update transaction status in your database to success
      console.log(`Payment for order ${orderId} successfully settled`)
      
      // Trigger additional actions for successful payment
      await handleSuccessfulPayment(orderId, statusResponse)
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
    })
  } catch (error: any) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process webhook', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Function to handle successful payments
async function handleSuccessfulPayment(orderId: string, paymentData: any) {
  // Here you can:
  // 1. Update your database
  // 2. Send confirmation email
  // 3. Trigger other business processes
  
  console.log(`Handling successful payment for order: ${orderId}`)
  
  // Example: Send email confirmation (you would implement your email service)
  try {
    await sendConfirmationEmail(orderId, paymentData)
    console.log(`Confirmation email sent for order: ${orderId}`)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
  
  // Example: Update order status in database
  try {
    // Replace this with your actual database update logic
    await updateOrderStatus(orderId, 'completed')
    console.log(`Order status updated for: ${orderId}`)
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

// Mock functions - replace with your actual implementations
async function sendConfirmationEmail(orderId: string, paymentData: any) {
  // Implement your email sending logic here
  // This could use Nodemailer, SendGrid, etc.
  console.log(`Would send confirmation email for order ${orderId}`)
}

async function updateOrderStatus(orderId: string, status: string) {
  // Implement your database update logic here
  console.log(`Would update order ${orderId} to status: ${status}`)
}