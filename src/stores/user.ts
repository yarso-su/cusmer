import { atom } from 'nanostores'

type TUser = {
  name: string
  email: string
  role: number
}

const DEFAULT_USER: TUser = {
  name: 'Cargando...',
  email: '...',
  role: -1
}

const UNKNOWN_USER: TUser = {
  name: 'unknown',
  email: 'unknown@example.com',
  role: -1
}

const $user = atom<TUser>(DEFAULT_USER)

const set = (data: TUser) => $user.set({ ...data })

export const loadFromStorage = () => {
  if (typeof window === 'undefined') return

  try {
    const name = localStorage.getItem('user_name')
    const email = localStorage.getItem('user_email')
    const role = localStorage.getItem('user_role')

    if (!name || !email || !role) throw new Error('Missing user data')

    set({
      name,
      email,
      role: Number(role)
    })
  } catch (error) {
    console.error('Error loading user from localStorage:', error)
    $user.set(UNKNOWN_USER)
  }
}

export default $user
