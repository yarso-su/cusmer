import { useState, useEffect } from 'react'

export const useQueryParams = () => {
  const [params, setParams] = useState({} as any)

  useEffect(() => {
    const updateParams = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const paramsObject = {} as any

      for (const [key, value] of urlParams.entries()) {
        paramsObject[key] = value
      }

      setParams(paramsObject)
    }

    updateParams()

    const handlePopState = () => updateParams()

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const setParam = (key: string, value: string) => {
    const urlParams = new URLSearchParams(window.location.search)

    if (value === null || value === undefined || value === '') {
      urlParams.delete(key)
    } else {
      urlParams.set(key, value.toString())
    }

    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
    window.history.pushState({}, '', newUrl)

    window.dispatchEvent(new Event('popstate'))
  }

  return [params, setParam]
}
