import UserRoleSelect from '@/components/shared/UserRoleSelect'
import { useQueryParams } from '@/hooks/use-query-params'
import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const ROLES = ['Sin registrar', 'Administrador', 'Desarrollador', 'Cliente']

type TUser = { id: string; name: string; role: number }
type TRes =
  | {
      success: false
      error: string
    }
  | {
      success: true
      users: Array<TUser>
    }

async function fetchUsers(role = 3): Promise<TRes> {
  try {
    const res = await fetch(`${API_URL}/users?role=${role}`, {
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
      users: data.users
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: 'Algo salió mal'
    }
  }
}

function UsersList() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [params, setParam] = useQueryParams()
  const [users, setUsers] = useState<Array<TUser>>([])

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    setLoading(true)
    fetchUsers(params.role).then(res => {
      setLoading(false)

      if (!res.success) return

      setUsers(res.users)
    })
  }, [params])

  return (
    <div className="flex flex-col min-h-0 gap-2">
      <section className="flex justify-end gap-1 flex-shrink-0">
        <UserRoleSelect
          defaultValue={params.role ?? '3'}
          value={params.role}
          onValueChange={value => {
            setParam('role', value)
          }}
        />
      </section>
      <section className="cborder bg-csecondary flex-1 min-h-0 overflow-hidden">
        {users.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="opacity-60 dark:opacity-40">
              {loading ? (
                <LoaderCircle className="animate-spin opacity-60 dark:opacity-40" />
              ) : (
                'No hay usuarios que mostrar'
              )}
            </p>
          </div>
        ) : (
          <ul className="h-full overflow-y-auto">
            {users.map(user => (
              <li key={user.id}>
                <a
                  href={`/su/users/${user.id}`}
                  className="cborder-b grid grid-cols-[1fr_auto] p-2 pressable-hover"
                >
                  <p>{user.name}</p>
                  <div className="px-2">
                    <p className="cborder-l pl-2">{ROLES[user.role]}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default UsersList
