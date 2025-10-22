/**
 * Utilities for asymmetric encryption with RSA-OAEP + AES-GCM
 */

export interface EncryptedData {
  key: string // AES Key ecrypted with RSA (base64)
  content: string // Content encrypted with AES (base64)
  iv: string // Initialization vector (base64)
}

export interface KeyPairStrings {
  publicKey: string
  privateKey: string
}

const RSA_CONFIG: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
}

const AES_CONFIG: AesKeyGenParams = {
  name: 'AES-GCM',
  length: 256
}

export const COMMON_ERRORS: Record<string, string> = {
  INVALID_MESSAGE: 'El mensaje no puede estar vacío',
  INVALID_PUBLIC_KEY: 'Clave pública del destinatario inválida',
  KEY_USAGE_ERROR: 'La clave no puede ser usada para encriptar',
  ENCRYPT_FAILED: 'Error al encriptar el mensaje'
}

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(RSA_CONFIG, true, [
    'encrypt',
    'decrypt'
  ])
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

export async function importPublicKey(keyString: string): Promise<CryptoKey> {
  const binaryKey = Uint8Array.from(atob(keyString), c => c.charCodeAt(0))
  return await window.crypto.subtle.importKey(
    'spki',
    binaryKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )
}

export async function importPrivateKey(keyString: string): Promise<CryptoKey> {
  const binaryKey = Uint8Array.from(atob(keyString), c => c.charCodeAt(0))
  return await window.crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  )
}

export async function encryptSecret(
  content: string,
  publicKey: CryptoKey
): Promise<EncryptedData> {
  try {
    if (!content || typeof content !== 'string') {
      throw new CryptoError(
        'Content must be a non-empty string',
        'INVALID_CONTENT'
      )
    }

    if (!publicKey || publicKey.type !== 'public') {
      throw new CryptoError('Invalid public key provided', 'INVALID_PUBLIC_KEY')
    }

    const aesKey = await window.crypto.subtle.generateKey(AES_CONFIG, true, [
      'encrypt',
      'decrypt'
    ])

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const contentData = new TextEncoder().encode(content)
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      contentData
    )

    const exportedAESKey = await window.crypto.subtle.exportKey('raw', aesKey)
    const encryptedAESKey = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      exportedAESKey
    )

    return {
      key: btoa(String.fromCharCode(...new Uint8Array(encryptedAESKey))),
      content: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
      iv: btoa(String.fromCharCode(...iv))
    }
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error
    }

    if (error instanceof DOMException) {
      switch (error.name) {
        case 'InvalidAccessError':
          throw new CryptoError(
            'Public key cannot be used for encryption',
            'KEY_USAGE_ERROR'
          )
        case 'NotSupportedError':
          throw new CryptoError(
            'Encryption algorithm not supported',
            'ALGORITHM_NOT_SUPPORTED'
          )
        case 'OperationError':
          throw new CryptoError('Encryption operation failed', 'ENCRYPT_FAILED')
        default:
          throw new CryptoError(
            `Crypto operation failed: ${error.message}`,
            'CRYPTO_ERROR'
          )
      }
    }

    throw new CryptoError(
      'Unexpected error during encryption: ' + (error as Error).message,
      'UNKNOWN_ERROR'
    )
  }
}

export async function decryptSecret(
  encryptedData: EncryptedData,
  privateKey: CryptoKey
): Promise<string> {
  const encryptedKeyBinary = Uint8Array.from(atob(encryptedData.key), c =>
    c.charCodeAt(0)
  )
  const decryptedAESKey = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedKeyBinary
  )

  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    decryptedAESKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const encryptedContentBinary = Uint8Array.from(
    atob(encryptedData.content),
    c => c.charCodeAt(0)
  )
  const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0))

  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    encryptedContentBinary
  )

  return new TextDecoder().decode(decryptedContent)
}

export async function initializeUserKeys(): Promise<string> {
  const keyPair = await generateKeyPair()
  const publicKeyString = await exportPublicKey(keyPair.publicKey)
  const privateKeyString = await exportPrivateKey(keyPair.privateKey)

  localStorage.setItem('privateKey', privateKeyString)

  return publicKeyString
}

export function getStoredPrivateKey(): string | null {
  return localStorage.getItem('privateKey')
}

export async function exportKeyPair(
  keyPair: CryptoKeyPair
): Promise<KeyPairStrings> {
  const publicKey = await exportPublicKey(keyPair.publicKey)
  const privateKey = await exportPrivateKey(keyPair.privateKey)

  return { publicKey, privateKey }
}

export function isValidEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.key === 'string' &&
    typeof data.content === 'string' &&
    typeof data.iv === 'string'
  )
}

export function hasStoredPrivateKey(): boolean {
  return localStorage.getItem('privateKey') !== null
}

export class CryptoError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'CryptoError'
  }
}

export async function safeDecryptSecret(
  encryptedData: EncryptedData,
  privateKey: CryptoKey
): Promise<string> {
  try {
    if (!isValidEncryptedData(encryptedData)) {
      throw new CryptoError('Invalid encrypted data format', 'INVALID_FORMAT')
    }

    return await decryptSecret(encryptedData, privateKey)
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error
    }
    throw new CryptoError(
      'Failed to decrypt secret: ' + (error as Error).message,
      'DECRYPT_FAILED'
    )
  }
}

export async function safeEncryptSecret(
  content: string,
  publicKey: CryptoKey
): Promise<EncryptedData> {
  try {
    return await encryptSecret(content, publicKey)
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error
    }
    throw new CryptoError(
      'Failed to encrypt secret: ' + (error as Error).message,
      'ENCRYPT_FAILED'
    )
  }
}
