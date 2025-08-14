import type { AppBskyFeedPost, AppBskyActorProfile } from '@atproto/api'

// Canonical repo record shape we use across the app
export interface RepoRecord<TValue = unknown> {
  uri: string
  cid: string
  value: TValue
  indexedAt: string
  collection: string
  $type: string
}

// First-party known record interfaces from @atproto/api
export type BskyPostRecord = AppBskyFeedPost.Record
export type BskyProfileRecord = AppBskyActorProfile.Record

// Discriminated helpers for known types
export type KnownRecordByType =
  | { $type: 'app.bsky.feed.post'; record: BskyPostRecord }
  | { $type: 'app.bsky.actor.profile'; record: BskyProfileRecord }

// Fallback for custom or third-party records when we don't have a local lexicon yet
export type UnknownRecordByType = { $type: string; record: unknown }

export type AnyRecordByType = KnownRecordByType | UnknownRecordByType


