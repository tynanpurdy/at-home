import { loadConfig } from '../config/site'

export type BlobVariant = 'full' | 'avatar' | 'feed'

export function blobCdnUrl(did: string, cid: string, _variant: BlobVariant = 'full'): string {
  const base = 'https://bsky.social/xrpc/com.atproto.sync.getBlob'
  const params = new URLSearchParams({ did, cid })
  return `${base}?${params.toString()}`
}

export function extractCidFromBlobRef(ref: unknown): string | null {
  if (typeof ref === 'string') return ref
  if (ref && typeof ref === 'object') {
    const anyRef = ref as any
    if (typeof anyRef.$link === 'string') return anyRef.$link
    if (typeof anyRef.toString === 'function') {
      const s = anyRef.toString()
      if (s && typeof s === 'string') return s
    }
  }
  return null
}

export function didFromConfig(): string {
  const cfg = loadConfig()
  return cfg.atproto.did
}


