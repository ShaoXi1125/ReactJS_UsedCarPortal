import React, { useEffect, useState } from 'react'
import { getOrder, updateOrderStatus } from '@/services/orders'
import AppLayout from '@/layouts/app-layout'
import { CarFront, Calendar, DollarSign } from 'lucide-react'

export default function OrderDetails() {
  const id = (window.location.pathname.split('/').pop() || '')
  const [order, setOrder] = useState<any>(null)
  const [role, setRole] = useState<'buyer' | 'owner' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    // ✅ 优先尝试买家的接口
    getOrder(token, id)
      .then(res => {
        setOrder(res.data)
        setRole('buyer')
      })
      .catch(async err => {
        console.warn('Buyer view failed, try owner...', err)
        // ✅ 再尝试车主的接口
        const res = await fetch(`http://127.0.0.1:8000/api/owner-orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
          setRole('owner')
        } else {
          setError('You are not allowed to view this order.')
        }
      })
  }, [id])

  const cancel = () => {
    const token = localStorage.getItem('token')
    if (!token) return
    updateOrderStatus(token, id, 'Cancelled').then(() => {
      alert('Order cancelled successfully.')
      window.location.href = '/orders'
    })
  }

  const payNow = async (simulateResult?: 'success' | 'fail') => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Please login first.')
    if (loading) return
    setLoading(true)

    try {
      const body: any = {}
      if (simulateResult) body.result = simulateResult

      const res = await fetch(`http://127.0.0.1:8000/api/orders/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Payment successful${data.deposit ? `. Deposit: RM ${data.deposit}` : ''}`)
        setOrder((prev: any) => ({ ...prev, status: 'Paid' }))
      } else {
        alert(`❌ Payment failed: ${data.message || 'Unknown error'}`)
      }
    } catch (e) {
      console.error(e)
      alert('⚠️ Payment request failed')
    } finally {
      setLoading(false)
    }
  }

  const completeOrder = async () => {
  const token = localStorage.getItem('token')
  if (!token) return alert('Please login first.')

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/orders/${id}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Completed' })
    })

    const data = await res.json()

    if (res.ok) {
      alert('✅ Order marked as Completed!')
      setOrder((prev: any) => ({ ...prev, status: 'Completed' }))
    } else {
      alert(`❌ Failed to complete: ${data.message || 'Unknown error'}`)
    }
  } catch (err) {
    console.error(err)
    alert('⚠️ Network error')
  }
}

  if (error) return <AppLayout><div className="text-center text-red-600 py-10">{error}</div></AppLayout>
  if (!order) return <AppLayout><div className="text-center py-10">Loading...</div></AppLayout>

  const car = order.car || {}
  const make = car.make?.name || ''
  const model = car.model?.name || ''
  const variant = car.variant?.name || ''
  const year = car.year || ''
  const title = [make, model, variant].filter(Boolean).join(' ') || car.title || `Car #${order.car_id}`
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
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <CarFront className="w-5 h-5" />{title}
              </h2>
              {year && <p className="text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />{year}
              </p>}

              <div className="mb-4">
                <p className="text-lg font-semibold">Total: RM {(Number(order.total_price)).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
                {order.deposit && <p className="text-sm text-gray-600">Deposit paid: RM {parseFloat(order.deposit).toFixed(2)}</p>}
              </div>

              <div className="flex gap-3 items-center">
                {/* ✅ 不同身份显示不同按钮 */}
                {role === 'buyer' && order.status === 'Pending' && (
                  <>
                    <button onClick={cancel} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Cancel Order</button>
                    <button onClick={() => payNow()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Pay (Simulate)</button>
                  </>
                )}
                {role === 'owner' && order.status === 'Pending' && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Awaiting Buyer Deposit
                  </button>
                )} 
                {role === 'owner' && order.status === 'Confirmed' && (
                  <button
                    onClick={completeOrder}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Complete Handover
                  </button>
                )}
                <a href="/orders" className="ml-auto text-sm text-gray-600 underline">Back to orders</a>
              </div>

              {/* ✅ 显示订单角色 */}
              <div className="mt-4 text-sm text-gray-500">
                Viewing as <strong>{role}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
