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
  channel: null,
  hasFetched: false,

  fetchNotifications: async (userId, force = false) => {
    if (get().hasFetched && !force) return
    const { data } = await supabase
      .from('student_notifications')
      .select('*, sender:profiles!sender_id(full_name, role)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length,
        hasFetched: true
      })
    }
  },

  markAllRead: async (userId) => {
    const { data, error } = await supabase
      .from('student_notifications')
      .update({ is_read: true })
      .eq('student_id', userId)
      .eq('is_read', false)
      .select()

    if (error) {
      console.error('Error marking all notifications read:', error)
    }

    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0
    }))
  },

  markRead: async (notifId) => {
    const { data, error } = await supabase
      .from('student_notifications')
      .update({ is_read: true })
      .eq('id', notifId)
      .select()

    if (error) {
      console.error('Error marking notification read:', error)
    }

    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notifId ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  addNotification: (notif) => set(state => {
    if (state.notifications.some(n => n.id === notif.id)) {
      return state
    }
    return {
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + (notif.is_read ? 0 : 1)
    }
  }),

  subscribeToNotifications: (userId) => {
    const currentChannel = get().channel
    if (currentChannel) return currentChannel

    const uniqueId = Math.random().toString(36).substring(2, 9)
    const channelName = `student_notifs_${userId}_${uniqueId}`

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'student_notifications',
        filter: `student_id=eq.${userId}`
      }, async (payload) => {
        let fullNotif = { ...payload.new }
        if (payload.new.sender_id) {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single()
          if (senderProfile) {
            fullNotif.sender = senderProfile
          }
        }
        get().addNotification(fullNotif)
      })
      .subscribe()

    set({ channel })
    return channel
  }
}))

export const useCarbonStore = create((set, get) => ({
  todayLog: null,
  history: [],
  loading: false,
  carbonConfig: null,

  fetchCarbonConfig: async () => {
    try {
      const { data, error } = await supabase
        .from('institution_settings')
        .select('carbon_config')
        .eq('id', 1)
        .single()
      
      if (error) throw error
      if (data?.carbon_config) {
        set({ carbonConfig: data.carbon_config })
        return data.carbon_config
      }
    } catch (err) {
      console.error('Error fetching carbon config:', err)
    }
    return null
  },

  fetchTodayLog: async (userId) => {
    // Compute yesterday in LOCAL timezone (same as how the log is saved)
    const now = new Date()
    const yesterdayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const yyyy = yesterdayLocal.getFullYear()
    const mm = String(yesterdayLocal.getMonth() + 1).padStart(2, '0')
    const dd = String(yesterdayLocal.getDate()).padStart(2, '0')
    const yesterday = `${yyyy}-${mm}-${dd}`

    // Also compute today in local timezone (in case student logs same day)
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const ty = todayLocal.getFullYear()
    const tm = String(todayLocal.getMonth() + 1).padStart(2, '0')
    const td = String(todayLocal.getDate()).padStart(2, '0')
    const today = `${ty}-${tm}-${td}`

    const { data } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('student_id', userId)
      .in('log_date', [yesterday, today])
      .order('log_date', { ascending: false })
      .limit(1)
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

export const useFacultyNotifStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  channel: null,
  hasFetched: false,

  fetchNotifications: async (userId, force = false) => {
    if (get().hasFetched && !force) return
    const { data } = await supabase
      .from('notifications')
      .select('*, sender:profiles!sender_id(full_name, role)')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length,
        hasFetched: true
      })
    }
  },

  markAllRead: async (userId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .is('user_id', null)
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

  addNotification: (notif) => set(state => {
    if (state.notifications.some(n => n.id === notif.id)) {
      return state;
    }
    return {
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + (notif.is_read ? 0 : 1)
    };
  }),

  subscribeToNotifications: (userId) => {
    const currentChannel = get().channel
    if (currentChannel) return currentChannel

    const uniqueId = Math.random().toString(36).substring(2, 9)
    const channelName = `faculty_notifs_${userId}_${uniqueId}`

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, async (payload) => {
        if (!payload.new.user_id || payload.new.user_id === userId) {
          let fullNotif = { ...payload.new }
          if (payload.new.sender_id) {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', payload.new.sender_id)
              .single()
            if (senderProfile) {
              fullNotif.sender = senderProfile
            }
          }
          get().addNotification(fullNotif)
        }
      })
      .subscribe()

    set({ channel })
    return channel
  }
}))

