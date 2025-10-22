import { loadFromStorage } from '@/stores/user'
import { useEffect } from 'react'

function LoadUserState() {
  useEffect(() => {
    loadFromStorage()
  }, [])

  return null
}

export default LoadUserState
