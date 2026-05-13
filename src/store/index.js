import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      }
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  fetchProfile: async (userId, retries = 3) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          if (retries > 0) {
            // Wait 500ms and retry to allow the database trigger time to finish
            await new Promise(res => setTimeout(res, 500))
            return useAuthStore.getState().fetchProfile(userId, retries - 1)
          }
          return null // Give up after retries
        }
        throw error
      }
      set({ profile: data })
      return data
    } catch (err) {
      console.error('Profile fetch error:', err)
      return null
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      set({ profile: data })
    }
    return { data, error }
  },
}))

export const useNotifStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length
      })
    }
  },

  markAllRead: async (userId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0
    }))
  },

  markRead: async (notifId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId)

    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notifId ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  addNotification: (notif) => set(state => ({
    notifications: [notif, ...state.notifications],
    unreadCount: state.unreadCount + (notif.is_read ? 0 : 1)
  })),
}))

export const useCarbonStore = create((set, get) => ({
  todayLog: null,
  history: [],
  loading: false,

  fetchTodayLog: async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('student_id', userId)
      .eq('log_date', today)
      .maybeSingle()

    set({ todayLog: data || null })
    return data
  },

  fetchHistory: async (userId, days = 30) => {
    set({ loading: true })
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('student_id', userId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false })

    set({ history: data || [], loading: false })
    return data || []
  },

  setTodayLog: (log) => set({ todayLog: log }),
}))

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  totalCarbon: 0,

  addItem: (item) => {
    set(state => {
      const existing = state.items.find(i => i.id === item.id)
      let newItems
      if (existing) {
        newItems = state.items.map(i =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
        )
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }]
      }
      const total = newItems.reduce((t, i) => t + (Number(i.price) * i.quantity), 0)
      const totalCarbon = newItems.reduce((t, i) => t + (Number(i.carbon_kg || 0) * i.quantity), 0)
      return { items: newItems, total, totalCarbon }
    })
  },

  removeItem: (itemId) => {
    set(state => {
      const newItems = state.items
        .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
      const total = newItems.reduce((t, i) => t + (Number(i.price) * i.quantity), 0)
      const totalCarbon = newItems.reduce((t, i) => t + (Number(i.carbon_kg || 0) * i.quantity), 0)
      return { items: newItems, total, totalCarbon }
    })
  },

  clearCart: () => set({ items: [], total: 0, totalCarbon: 0 }),
}))
