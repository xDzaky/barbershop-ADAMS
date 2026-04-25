import { Snap } from 'midtrans-client'

const snap = new Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

interface CreateTransactionParams {
  order_id: string
  gross_amount: number
  customer_name: string
  customer_phone: string
  item_name: string
}

export async function createMidtransTransaction(params: CreateTransactionParams) {
  const { order_id, gross_amount, customer_name, customer_phone, item_name } = params

  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id,
      gross_amount,
    },
    item_details: [
      {
        id: order_id,
        price: gross_amount,
        quantity: 1,
        name: item_name,
      },
    ],
    customer_details: {
      first_name: customer_name,
      phone: customer_phone,
    },
  })

  return transaction.token
}

export function getMidtransServerKey() {
  return process.env.MIDTRANS_SERVER_KEY!
}
