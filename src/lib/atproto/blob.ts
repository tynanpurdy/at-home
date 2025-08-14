import { AtpAgent } from '@atproto/api'
import { loadConfig } from '../config/site'

export type BlobVariant = 'full' | 'avatar' | 'feed'

export function blobCdnUrl(did: string, cid: string, variant: BlobVariant = 'full'): string {
  // Default to PDS sync getBlob endpoint; AppView/CDN variants can be swapped in later
  const base = 'https://bsky.social/xrpc/com.atproto.sync.getBlob'
  const params = new URLSearchParams({ did, cid })
  return `${base}?${params.toString()}`
}

export async function fetchBlob(did: string, cid: string, agent?: AtpAgent): Promise<Blob> {
  const cfg = loadConfig()
  const atp = agent ?? new AtpAgent({ service: cfg.atproto.pdsUrl || 'https://bsky.social' })
  const res = await atp.com.atproto.sync.getBlob({ did, cid })
  // @atproto/api returns a Response-like object with data as ArrayBuffer
  const arrayBuf = await res.data.blob()
  return new Blob([arrayBuf])
}

// Extract CID string from common embed image blob refs
export function extractCidFromBlobRef(ref: unknown): string | null {
  // Formats we might encounter:
  // - string (cid)
  // - { $link: string }
  // - BlobRef object with toString()
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


