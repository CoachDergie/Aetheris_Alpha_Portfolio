/** Local Encryption Utility for Private Astrological & Martial Telemetry Profile */

const STORAGE_KEY = 'aetheris_encrypted_vault';
const DEFAULT_SALT = 'AETHERIS_OCULT_METRIC_KEY_V1';

export async function encryptData(plainText: string, secretKey = DEFAULT_SALT): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback base64 obfuscation if subtle crypto not available
    return btoa(encodeURIComponent(plainText));
  }

  try {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(secretKey.padEnd(32, '#').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      enc.encode(plainText)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.warn('Crypto error, using encoded fallback', err);
    return btoa(encodeURIComponent(plainText));
  }
}

export async function decryptData(cipherBase64: string, secretKey = DEFAULT_SALT): Promise<string> {
  if (!cipherBase64) return '';

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    try {
      return decodeURIComponent(atob(cipherBase64));
    } catch {
      return '';
    }
  }

  try {
    const binary = atob(cipherBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length <= 12) {
      return decodeURIComponent(atob(cipherBase64));
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(secretKey.padEnd(32, '#').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    try {
      return decodeURIComponent(atob(cipherBase64));
    } catch {
      console.warn('Failed to decrypt data', err);
      return '';
    }
  }
}

export async function saveToEncryptedVault(data: unknown): Promise<void> {
  const jsonStr = JSON.stringify(data);
  const encrypted = await encryptData(jsonStr);
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export async function loadFromEncryptedVault<T>(): Promise<T | null> {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  const jsonStr = await decryptData(encrypted);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}
