import React, { useEffect, useState } from 'react'
import { getOrder, updateOrderStatus } from '@/services/orders'
import AppLayout from '@/layouts/app-layout'
import { CarFront, Calendar, DollarSign } from 'lucide-react'

export default function OrderDetails(){
  const id = (window.location.pathname.split('/').pop() || '')
  const [order, setOrder] = useState<any>(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) return
    getOrder(token, id)
      .then(res=>setOrder(res.data))
      .catch(err=>console.error(err))
  },[id])

  const cancel = ()=>{
    const token = localStorage.getItem('token')
    if(!token) return
    updateOrderStatus(token, id, 'Cancelled').then(()=>{
      alert('Order cancelled successfully.')
      window.location.href='/orders'
    })
  }

  const payNow = async (simulateResult?: 'success'|'fail') => {
    const token = localStorage.getItem('token')
    if(!token) return
    try{
      const body:any = {}
      if(simulateResult) body.result = simulateResult
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if(res.ok){
        alert(`Payment successful. Deposit: RM ${data.deposit}`)
        window.location.reload()
      } else {
        alert(`Payment failed: ${data.message || JSON.stringify(data)}`)
        window.location.reload()
      }
    }catch(e){
      console.error(e)
      alert('Payment request failed')
    }
  }

  if(!order) return <AppLayout><div className="text-center py-10">Loading...</div></AppLayout>

  const car = order.car || {}
  const make = car.make?.name || ''
  const model = car.model?.name || ''
  const variant = car.variant?.name || ''
  const year = car.year || ''
  const title = [make, model, variant].filter(Boolean).join(' ') || car.title || `Car #${order.car_id}`
  // CarImage model stores `image_path` and images are served from /storage/{image_path}
  const imagePath = car.images?.length ? car.images[0].image_path : (car.images?.[0]?.image_path || null)
  const imageUrl = imagePath ? `http://127.0.0.1:8000/storage/${imagePath}` : '/no-image.png'

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden mt-6">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg border" />
            </div>
            <div className="md:flex-1">
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><CarFront className="w-5 h-5" />{title}</h2>
              {year && <p className="text-sm text-gray-500 mb-3"><Calendar className="w-4 h-4 inline mr-1" />{year}</p>}

              <div className="mb-4">
                <p className="text-lg font-semibold">Total:  RM {(Number(order.total_price)).toLocaleString('en-MY', { minimumFractionDigits: 2 })} </p>
                {order.deposit && <p className="text-sm text-gray-600">Deposit paid: RM {parseFloat(order.deposit).toFixed(2)}</p>}
              </div>

              <div className="mb-4">
              
              </div>

              <div className="flex gap-3">
                {order.status === 'Pending' && (
                  <>
                    <button onClick={cancel} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Cancel Order</button>
                    <button onClick={()=>payNow()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Pay (Simulate)</button>
                  </>
                )}
                <a href="/orders" className="ml-auto text-sm text-gray-600 underline">Back to orders</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
