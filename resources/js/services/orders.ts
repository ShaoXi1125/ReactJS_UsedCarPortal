import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

export const getOrders = (token: string) => {
  return axios.get(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } })
}

export const getOrder = (token: string, id: number|string) => {
  return axios.get(`${API_BASE}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
}

export const placeOrder = (token: string, data: { car_id:number, total_price:number }) => {
  return axios.post(`${API_BASE}/orders`, data, { headers: { Authorization: `Bearer ${token}` } })
}

export const updateOrderStatus = (token: string, id: number|string, status: string) => {
  return axios.put(`${API_BASE}/orders/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } })
}

export const deleteOrder = (token: string, id: number|string) => {
  return axios.delete(`${API_BASE}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
}

export default { getOrders, getOrder, placeOrder, updateOrderStatus, deleteOrder }
