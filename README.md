## Midtrans Backend API next.js
---

```pgsql
midtrans-backend/
├── app/
│   ├── api/
│   │   ├── transaction/
│   │   │   └── route.ts
│   │   ├── notification/
│   │   │   └── route.ts
│   │   ├── status/
│   │   │   └── route.ts
│   │   └── webhook/
│   │       └── route.ts
│   └── page.tsx
├── package.json
├── next.config.js
├── tsconfig.json
├── vercel.json
└── .env.local
```

* **.env.local**
```sh
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
```

* **Membuat Transaksi**
```js
// Contoh penggunaan dari webapp lain
const createTransaction = async () => {
  try {
    const response = await fetch('https://your-vercel-domain.vercel.app/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: 'ORDER-12345',
        amount: 100000,
        customerDetails: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
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
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect ke halaman pembayaran Midtrans
      window.location.href = data.redirect_url;
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

* **Mengecek Status Transaksi**
```js
const checkStatus = async (orderId) => {
  try {
    const response = await fetch(`https://your-vercel-domain.vercel.app/api/status?orderId=${orderId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Transaction status:', data.data.transaction_status);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```
* **Menangani Notifikasi**
- Untuk notifikasi, Kamu perlu mengkonfigurasi URL notifikasi di dashboard Midtrans ke:
```pgsql
https://your-vercel-domain.vercel.app/api/notification
```