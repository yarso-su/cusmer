import type { Secret } from '@/lib/types'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  getStoredPrivateKey,
  importPrivateKey,
  initializeUserKeys,
  safeDecryptSecret
} from '@/lib/crypto'
import { BadResponseError } from '@/lib/errors'
import { API_URL } from 'astro:env/client'
import { format } from '@formkit/tempo'
import { Eye, Trash } from 'lucide-react'
import AddSecretForm from './AddSecretForm'

async function dropSecret(id: number): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/secrets/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo eliminar la entrada'
  }
}

async function addKey(key: string): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        key
      })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) {
      return err.message
    }

    return 'No se pudo registrar el dispositivo'
  }
}

interface Props {
  sent: boolean
  secrets: Array<Secret>
  publicKey: string | undefined
  id?: string
}

function SecretsList({ id, sent, secrets: currentSecrets, publicKey }: Props) {
  const [secrets, setSecrets] = useState<Array<Secret>>(currentSecrets)
  const [ready, setReady] = useState<boolean>(true)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const show = async (secret: Secret) => {
    if (!ready) {
      toast.error('Otra entrada se está procesando')
      return
    }

    setReady(false)

    try {
      const key = getStoredPrivateKey()
      if (!key) {
        toast.error('Dispositivo no registrado')
        return
      }

      const privateKey = await importPrivateKey(key)
      const decrypted = await safeDecryptSecret(
        {
          key: secret.key,
          content: secret.content,
          iv: secret.iv
        },
        privateKey
      )

      toast.info(secret.label, {
        description: decrypted,
        duration: 10000,
        dismissible: true,
        onAutoClose: () => {
          setReady(true)
        },
        onDismiss: () => {
          setReady(true)
        },
        action: {
          label: 'Copiar',
          onClick: () => {
            navigator.clipboard.writeText(decrypted)
            toast.success('Texto copiado')
            setReady(true)
          }
        },
        actionButtonStyle: {
          backgroundColor: 'oklch(62.3% 0.214 259.815)'
        }
      })
    } catch (err) {
      toast.error(
        'Error al intentar descifrar la entrada. Si persiste reporta el problema'
      )
      setReady(true)
    }
  }

  const drop = (secretId: number) => {
    toast.warning('Estas seguro que deseas eliminar esta entrada?', {
      dismissible: true,
      duration: 5000,
      action: {
        label: 'Si',
        onClick: async () => {
          const loading = toast.loading('Eliminando...')

          const fail = await dropSecret(secretId)
          toast.dismiss(loading)
          if (fail) return toast.error(fail)

          toast.success('Entrada eliminada')
          setSecrets(prevSecrets => prevSecrets.filter(s => s.id !== secretId))
        }
      },
      actionButtonStyle: {
        backgroundColor: 'oklch(76.9% 0.188 70.08)',
        color: 'white'
      }
    })
  }

  const newSecretAdded = (secret: Secret) => {
    setSecrets(prevSecrets => [...prevSecrets, secret])
  }

  useEffect(() => {
    if (!sent) {
      const privateKey = getStoredPrivateKey()
      if (!privateKey) {
        toast(
          'Parece que tu dispositivo no puede recibir crendenciales. Quieres registrarlo?',
          {
            duration: 30000,
            action: {
              label: 'Si',
              onClick: async () => {
                try {
                  const loading = toast.loading('Registrando...')
                  const publicKey = await initializeUserKeys()

                  const fail = await addKey(publicKey)
                  toast.dismiss(loading)
                  if (fail) return toast.error(fail)

                  toast.success('Dispositivo registrado')
                } catch (err: any) {
                  toast.error('Error al intentar registrar el dispositivo')
                }
              }
            },
            cancel: {
              label: 'No',
              onClick: () => {
                toast.dismiss()
                return
              }
            }
          }
        )
      }
    }

    const showAddForm = () => {
      triggerRef.current?.click()
    }

    document.addEventListener('show-add-secret-form', showAddForm)

    return () => {
      document.removeEventListener('show-add-secret-form', showAddForm)
    }
  }, [])

  if (secrets.length === 0)
    return (
      <section className="bg-csecondary cborder max-h-full overflow-y-auto">
        <div className="w-full h-full flex justify-center items-center">
          <p className="text-center opacity-80 dark:opacity-60">
            No hay credenciales que mostrar
          </p>
        </div>
        <AddSecretForm
          triggerRef={triggerRef}
          id={id}
          publicKey={publicKey}
          onSecretAdded={newSecretAdded}
        />
      </section>
    )

  return (
    <section className="bg-csecondary cborder max-h-full overflow-y-auto">
      <ul>
        {secrets.map(secret => {
          if (sent) {
            return (
              <li
                key={secret.id}
                className="cborder-b grid grid-cols-[1fr_auto_auto] p-2"
              >
                <p className="truncate">{secret.label}</p>
                <p className="cborder-l px-2 truncate">
                  {format(secret.updated_at, 'medium', 'es')}
                </p>
                <button
                  onClick={() => drop(secret.id)}
                  className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
                >
                  <Trash className="size-4" />
                </button>
              </li>
            )
          }

          return (
            <li
              key={secret.id}
              className="cborder-b grid grid-cols-[1fr_auto_auto] p-2"
            >
              <p className="truncate">{secret.label}</p>
              <p className="cborder-l px-2 truncate">
                {format(secret.updated_at, 'medium', 'es')}
              </p>
              <button
                onClick={() => show(secret)}
                className="content-center transition-opacity duration-200 hover:opacity-80 cborder-l pl-2"
              >
                <Eye className="size-4" />
              </button>
            </li>
          )
        })}
      </ul>
      <AddSecretForm
        triggerRef={triggerRef}
        id={id}
        publicKey={publicKey}
        onSecretAdded={newSecretAdded}
      />
    </section>
  )
}

export default SecretsList
