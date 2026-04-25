declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean
    serverKey: string
    clientKey: string
  }

  interface TransactionDetails {
    transaction_details: {
      order_id: string
      gross_amount: number
    }
    item_details?: Array<{
      id: string
      price: number
      quantity: number
      name: string
    }>
    customer_details?: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }
  }

  export class Snap {
    constructor(options: SnapOptions)
    createTransaction(params: TransactionDetails): Promise<{ token: string; redirect_url: string }>
  }
}
