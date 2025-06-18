export interface Package {
  id: string
  name: string
  description: string
  credits: number
  price: number
  originalPrice?: number
  basePrice: number
  image_url: string
  active: boolean
  popular?: boolean
  bestValue?: boolean
  discount?: number
  priceIncrease?: number
  priceMode: string
}

export interface Server {
  id: string
  name: string
  description: string
  active: boolean
}

export interface Transaction {
  id: string
  user_id: string
  package_id: string
  stripe_payment_intent_id?: string
  amount: number
  credits: number
  server_id: string
  status: "pending" | "completed" | "failed" | "refunded"
  created_at: string
  completed_at?: string
}
