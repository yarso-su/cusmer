import { useStore } from '@nanostores/react'
import store from '@/stores/user'
import { KeyRound as Key } from 'lucide-react'
import { API_URL } from 'astro:env/client'
import { BadResponseError } from '@/lib/errors'
import { toast } from 'sonner'

async function sendRequest(email: string): Promise<void | string> {
  try {
    const res = await fetch(`${API_URL}/users/send-reset-password-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!res.ok) throw new BadResponseError(res)
  } catch (err) {
    if (err instanceof BadResponseError) return err.message
    return 'No se pudo enviar el correo'
  }
}

function SendUpdatePasswordRequest() {
  const user = useStore(store)

  const handleClick = async () => {
    const loading = toast.loading('Enviando...')

    const fail = await sendRequest(user.email)
    toast.dismiss(loading)
    if (fail) return toast.error(fail)

    toast.info(
      'Se ha enviado un correo con un enlace para actualizar la contraseña'
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full h-full flex justify-center cborder bg-csecondary items-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-900 gap-2"
    >
      <Key size={16} />
      <p>Actualizar contraseña</p>
    </button>
  )
}

export default SendUpdatePasswordRequest
