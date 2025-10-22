import ThreadStatusSelect from '@/components/shared/ThreadStatusSelect'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { MAX_ITEMS_PER_PAGE, THREAD_TYPES } from '@/lib/constants'
import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

type TThread = { id: number; name: string; type: number }
type TRes =
  | {
      success: false
      error: string
    }
  | {
      success: true
      threads: Array<TThread>
    }

async function fetchThreads(status = 1, page = 1): Promise<TRes> {
  try {
    const res = await fetch(`${API_URL}/threads/by-status/${status}/${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)

    const data = await res.json()

    return {
      success: true,
      threads: data.threads
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: 'Algo salió mal'
    }
  }
}

function ThreadsList() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [params, setParam] = useQueryParams()
  const [threads, setThreads] = useState<Array<TThread>>([])

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    setLoading(true)
    fetchThreads(params.status, params.page).then(res => {
      setLoading(false)

      if (!res.success) return

      setThreads(res.threads)
    })
  }, [params])

  return (
    <div className="flex flex-col min-h-0 gap-2">
      <section className="flex justify-end gap-1 flex-shrink-0">
        <ThreadStatusSelect
          className="w-[180px]"
          defaultValue={params.status ?? '1'}
          value={params.status}
          onValueChange={value => {
            setParam('page', '1')
            setParam('status', value)
          }}
        />
        <Button
          variant="custom"
          disabled={Number(params.page) === 1 || params.page === undefined}
          onClick={() => {
            setParam('page', Number(params.page) - 1)
          }}
        >
          Anterior
        </Button>
        <Button
          variant="custom"
          disabled={threads.length < MAX_ITEMS_PER_PAGE}
          onClick={() => {
            setParam('page', Number(params.page) + 1)
          }}
        >
          Siguiente
        </Button>
      </section>

      <section className="cborder bg-csecondary flex-1 min-h-0 overflow-hidden">
        {threads.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="opacity-60 dark:opacity-40">
              {loading ? (
                <LoaderCircle className="animate-spin opacity-60 dark:opacity-40" />
              ) : (
                'No hay hilos que mostrar'
              )}
            </p>
          </div>
        ) : (
          <ul className="h-full overflow-y-auto">
            {threads.map(thread => (
              <li key={thread.id}>
                <a
                  href={`/su/threads/${thread.id}`}
                  className="cborder-b grid grid-cols-[1fr_auto] p-2 pressable-hover"
                >
                  <p className="truncate">{thread.name}</p>
                  <p className="cborder-l pl-2 truncate">
                    {THREAD_TYPES[thread.type]}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ThreadsList
