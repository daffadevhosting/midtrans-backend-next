'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ThankYou() {
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = searchParams.get('order_id')
  const statusCode = searchParams.get('status_code')

  useEffect(() => {
    if (orderId) {
      checkOrderStatus(orderId)
    } else {
      setLoading(false)
      setError('No order ID provided')
    }
  }, [orderId])

  const checkOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/status?orderId=${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrderData(data.data)
        
        // If payment is successful, you might want to update UI accordingly
        if (data.data.transaction_status === 'settlement' || 
            data.data.transaction_status === 'capture') {
          // Payment successful
          console.log('Payment was successful')
        }
      } else {
        setError(data.error || 'Failed to fetch order status')
      }
    } catch (error) {
      console.error('Error checking order status:', error)
      setError('Failed to check order status')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Memverifikasi pembayaran...</h1>
        <p>Harap tunggu sebentar.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Terjadi Error</h1>
        <p>{error}</p>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Kembali ke halaman utama
        </Link>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'}}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#22c55e', fontSize: '2.5rem' }}>Terima Kasih!</h1>
        <p style={{ fontSize: '1.2rem' }}>Pesanan Anda telah berhasil diproses.</p>
      </div>

      {orderData && (
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Detail Pesanan</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem 1rem' }}>
            <strong>ID Pesanan:</strong>
            <span>{orderData.order_id}</span>
            
            <strong>Status:</strong>
            <span style={{ 
              color: orderData.transaction_status === 'settlement' ? '#22c55e' : '#f59e0b',
              fontWeight: 'bold'
            }}>
              {getStatusText(orderData.transaction_status)}
            </span>
            
            <strong>Metode Pembayaran:</strong>
            <span>{orderData.payment_type || 'N/A'}</span>
            
            <strong>Total Pembayaran:</strong>
            <span>Rp {formatCurrency(orderData.gross_amount)}</span>
            
            <strong>Waktu Transaksi:</strong>
            <span>{formatDate(orderData.transaction_time)}</span>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <p>Kami telah mengirimkan email konfirmasi ke alamat email Anda.</p>
        <p>Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
        
        <div style={{ marginTop: '2rem' }}>
          <Link 
            href="/" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'capture': 'Berhasil',
    'settlement': 'Berhasil',
    'pending': 'Menunggu Pembayaran',
    'deny': 'Ditolak',
    'cancel': 'Dibatalkan',
    'expire': 'Kadaluarsa'
  }
  
  return statusMap[status] || status
}

function formatCurrency(amount: string | number) {
  return Number(amount).toLocaleString('id-ID')
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}