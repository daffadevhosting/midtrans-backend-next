'use client'

import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const testCreateTransaction = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: `ORDER-${Date.now()}`,
          amount: 100000,
          customerDetails: {
            first_name: 'Otong',
            last_name: 'Lenon',
            email: 'otong.lenon@fake.com',
            phone: '08123456789',
          },
          itemDetails: [
            {
              id: 'item1',
              price: 100000,
              quantity: 1,
              name: 'Product Example',
            },
          ],
        }),
      })

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error:', error)
      setResponse({ error: 'Failed to create transaction' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Midtrans Backend API Next.js</h1>
      <p>This is a backend API for Midtrans payments. You can use the following endpoints from your webapp:</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><strong>POST /api/transaction</strong> - Create a new transaction</li>
          <li><strong>POST /api/notification</strong> - Handle Midtrans notifications</li>
          <li><strong>GET /api/status?orderId=ORDER_ID</strong> - Check transaction status</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Test Create Transaction</h2>
        <button 
          onClick={testCreateTransaction} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Test Transaction'}
        </button>
        
        {response && (
          <div style={{ marginTop: '20px' }}>
            <h3>Response:</h3>
            <pre style={{ 
              backgroundColor: '#eee', 
              padding: '10px', 
              borderRadius: '5px',
              overflow: 'auto'
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>How to Use from Another WebApp</h2>
        <p>You can call these endpoints from any web application using fetch or axios:</p>
        
        <h3>Example: Create Transaction</h3>
        <pre style={{ 
          backgroundColor: '#eee', 
          padding: '10px', 
          borderRadius: '5px',
          overflow: 'auto'
        }}>
{`fetch('https://your-vercel-domain.vercel.app/api/transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'ORDER-12345',
    amount: 100000,
    customerDetails: {
      first_name: 'Otong',
      last_name: 'Lenon',
      email: 'otong.lenon@fake.com',
      phone: '08123456789',
    },
    itemDetails: [
      {
        id: 'item1',
        price: 100000,
        quantity: 1,
        name: 'Product Name',
      },
    ],
  }),
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Redirect to payment page
    window.location.href = data.redirect_url;
  } else {
    console.error('Error:', data.error);
  }
})
.catch(error => console.error('Error:', error));`}
        </pre>
      </div>
    </main>
  )
}