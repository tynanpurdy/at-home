// Auto-generated types from collection discovery
// Generated at: 2025-08-06T17:33:43.119Z
// Repository: tynanpurdy.com (did:plc:6ayddqghxhciedbaofoxkcbs)
// Collections: 64, Records: 124

// Collection: app.bsky.actor.profile
// Service: bsky.app
// Types: app.bsky.actor.profile
export interface AppBskyActorProfile {
  $type: 'app.bsky.actor.profile';
  avatar?: Record<string, any>;
  banner?: Record<string, any>;
  description?: string;
  displayName?: string;
}


// Collection: app.bsky.feed.like
// Service: bsky.app
// Types: app.bsky.feed.like
export interface AppBskyFeedLike {
  $type: 'app.bsky.feed.like';
  subject?: Record<string, any>;
  createdAt?: string;
}


// Collection: app.bsky.feed.post
// Service: bsky.app
// Types: app.bsky.feed.post
export interface AppBskyFeedPost {
  $type: 'app.bsky.feed.post';
  text?: string;
  langs?: string[];
  createdAt?: string;
}


// Collection: app.bsky.feed.postgate
// Service: bsky.app
// Types: app.bsky.feed.postgate
export interface AppBskyFeedPostgate {
  $type: 'app.bsky.feed.postgate';
  post?: string;
  createdAt?: string;
  embeddingRules?: Record<string, any>[];
  detachedEmbeddingUris?: any[];
}


// Collection: app.bsky.feed.repost
// Service: bsky.app
// Types: app.bsky.feed.repost
export interface AppBskyFeedRepost {
  $type: 'app.bsky.feed.repost';
  subject?: Record<string, any>;
  createdAt?: string;
}


// Collection: app.bsky.feed.threadgate
// Service: bsky.app
// Types: app.bsky.feed.threadgate
export interface AppBskyFeedThreadgate {
  $type: 'app.bsky.feed.threadgate';
  post?: string;
  allow?: Record<string, any>[];
  createdAt?: string;
  hiddenReplies?: any[];
}


// Collection: app.bsky.graph.block
// Service: bsky.app
// Types: app.bsky.graph.block
export interface AppBskyGraphBlock {
  $type: 'app.bsky.graph.block';
  subject?: string;
  createdAt?: string;
}


// Collection: app.bsky.graph.follow
// Service: bsky.app
// Types: app.bsky.graph.follow
export interface AppBskyGraphFollow {
  $type: 'app.bsky.graph.follow';
  subject?: string;
  createdAt?: string;
}


// Collection: app.bsky.graph.list
// Service: bsky.app
// Types: app.bsky.graph.list
export interface AppBskyGraphList {
  $type: 'app.bsky.graph.list';
  name?: string;
  purpose?: string;
  createdAt?: string;
  description?: string;
}


// Collection: app.bsky.graph.listitem
// Service: bsky.app
// Types: app.bsky.graph.listitem
export interface AppBskyGraphListitem {
  $type: 'app.bsky.graph.listitem';
  list?: string;
  subject?: string;
  createdAt?: string;
}


// Collection: app.bsky.graph.starterpack
// Service: bsky.app
// Types: app.bsky.graph.starterpack
export interface AppBskyGraphStarterpack {
  $type: 'app.bsky.graph.starterpack';
  list?: string;
  name?: string;
  feeds?: Record<string, any>[];
  createdAt?: string;
  updatedAt?: string;
}


// Collection: app.bsky.graph.verification
// Service: bsky.app
// Types: app.bsky.graph.verification
export interface AppBskyGraphVerification {
  $type: 'app.bsky.graph.verification';
  handle?: string;
  subject?: string;
  createdAt?: string;
  displayName?: string;
}


// Collection: app.popsky.list
// Service: unknown
// Types: app.popsky.list
export interface AppPopskyList {
  $type: 'app.popsky.list';
  name?: string;
  authorDid?: string;
  createdAt?: string;
  indexedAt?: string;
  description?: string;
}


// Collection: app.popsky.listItem
// Service: unknown
// Types: app.popsky.listItem
export interface AppPopskyListItem {
  $type: 'app.popsky.listItem';
  addedAt?: string;
  listUri?: string;
  identifiers?: Record<string, any>;
  creativeWorkType?: string;
}


// Collection: app.popsky.profile
// Service: unknown
// Types: app.popsky.profile
export interface AppPopskyProfile {
  $type: 'app.popsky.profile';
  createdAt?: string;
  description?: string;
  displayName?: string;
}


// Collection: app.popsky.review
// Service: unknown
// Types: app.popsky.review
export interface AppPopskyReview {
  $type: 'app.popsky.review';
  tags?: any[];
  facets?: any[];
  rating?: number;
  createdAt?: string;
  isRevisit?: boolean;
  reviewText?: string;
  identifiers?: Record<string, any>;
  containsSpoilers?: boolean;
  creativeWorkType?: string;
}


// Collection: app.rocksky.album
// Service: unknown
// Types: app.rocksky.album
export interface AppRockskyAlbum {
  $type: 'app.rocksky.album';
  year?: number;
  title?: string;
  artist?: string;
  albumArt?: Record<string, any>;
  createdAt?: string;
  releaseDate?: string;
}


// Collection: app.rocksky.artist
// Service: unknown
// Types: app.rocksky.artist
export interface AppRockskyArtist {
  $type: 'app.rocksky.artist';
  name?: string;
  picture?: Record<string, any>;
  createdAt?: string;
}


// Collection: app.rocksky.like
// Service: unknown
// Types: app.rocksky.like
export interface AppRockskyLike {
  $type: 'app.rocksky.like';
  subject?: Record<string, any>;
  createdAt?: string;
}


// Collection: app.rocksky.scrobble
// Service: unknown
// Types: app.rocksky.scrobble
export interface AppRockskyScrobble {
  $type: 'app.rocksky.scrobble';
  year?: number;
  album?: string;
  title?: string;
  artist?: string;
  albumArt?: Record<string, any>;
  duration?: number;
  createdAt?: string;
  discNumber?: number;
  albumArtist?: string;
  releaseDate?: string;
  spotifyLink?: string;
  trackNumber?: number;
}


// Collection: app.rocksky.song
// Service: unknown
// Types: app.rocksky.song
export interface AppRockskySong {
  $type: 'app.rocksky.song';
  year?: number;
  album?: string;
  title?: string;
  artist?: string;
  albumArt?: Record<string, any>;
  duration?: number;
  createdAt?: string;
  discNumber?: number;
  albumArtist?: string;
  releaseDate?: string;
  spotifyLink?: string;
  trackNumber?: number;
}


// Collection: blue.flashes.actor.profile
// Service: unknown
// Types: blue.flashes.actor.profile
export interface BlueFlashesActorProfile {
  $type: 'blue.flashes.actor.profile';
  createdAt?: string;
  showFeeds?: boolean;
  showLikes?: boolean;
  showLists?: boolean;
  showMedia?: boolean;
  enablePortfolio?: boolean;
  portfolioLayout?: string;
  allowRawDownload?: boolean;
}


// Collection: blue.linkat.board
// Service: unknown
// Types: blue.linkat.board
export interface BlueLinkatBoard {
  $type: 'blue.linkat.board';
  cards?: Record<string, any>[];
}


// Collection: buzz.bookhive.book
// Service: unknown
// Types: buzz.bookhive.book
export interface BuzzBookhiveBook {
  $type: 'buzz.bookhive.book';
  cover?: Record<string, any>;
  title?: string;
  hiveId?: string;
  status?: string;
  authors?: string;
  createdAt?: string;
}


// Collection: chat.bsky.actor.declaration
// Service: unknown
// Types: chat.bsky.actor.declaration
export interface ChatBskyActorDeclaration {
  $type: 'chat.bsky.actor.declaration';
  allowIncoming?: string;
}


// Collection: chat.roomy.01JPNX7AA9BSM6TY2GWW1TR5V7.catalog
// Service: unknown
// Types: chat.roomy.01JPNX7AA9BSM6TY2GWW1TR5V7.catalog
export interface ChatRoomy01JPNX7AA9BSM6TY2GWW1TR5V7Catalog {
  $type: 'chat.roomy.01JPNX7AA9BSM6TY2GWW1TR5V7.catalog';
  id?: string;
}


// Collection: chat.roomy.profile
// Service: unknown
// Types: chat.roomy.profile
export interface ChatRoomyProfile {
  $type: 'chat.roomy.profile';
  accountId?: string;
  profileId?: string;
}


// Collection: com.germnetwork.keypackage
// Service: unknown
// Types: com.germnetwork.keypackage
export interface ComGermnetworkKeypackage {
  $type: 'com.germnetwork.keypackage';
  anchorHello?: string;
}


// Collection: com.whtwnd.blog.entry
// Service: unknown
// Types: com.whtwnd.blog.entry
export interface ComWhtwndBlogEntry {
  $type: 'com.whtwnd.blog.entry';
  theme?: string;
  title?: string;
  content?: string;
  createdAt?: string;
  visibility?: string;
}


// Collection: community.lexicon.calendar.rsvp
// Service: unknown
// Types: community.lexicon.calendar.rsvp
export interface CommunityLexiconCalendarRsvp {
  $type: 'community.lexicon.calendar.rsvp';
  status?: string;
  subject?: Record<string, any>;
  createdAt?: string;
}


// Collection: events.smokesignal.app.profile
// Service: unknown
// Types: events.smokesignal.app.profile
export interface EventsSmokesignalAppProfile {
  $type: 'events.smokesignal.app.profile';
  tz?: string;
}


// Collection: events.smokesignal.calendar.event
// Service: unknown
// Types: events.smokesignal.calendar.event
export interface EventsSmokesignalCalendarEvent {
  $type: 'events.smokesignal.calendar.event';
  mode?: string;
  name?: string;
  text?: string;
  endsAt?: string;
  status?: string;
  location?: Record<string, any>;
  startsAt?: string;
  createdAt?: string;
}


// Collection: farm.smol.games.skyrdle.score
// Service: unknown
// Types: farm.smol.games.skyrdle.score
export interface FarmSmolGamesSkyrdleScore {
  $type: 'farm.smol.games.skyrdle.score';
  hash?: string;
  isWin?: boolean;
  score?: number;
  guesses?: Record<string, any>[];
  timestamp?: string;
  gameNumber?: number;
}


// Collection: fyi.bluelinks.links
// Service: unknown
// Types: fyi.bluelinks.links
export interface FyiBluelinksLinks {
  $type: 'fyi.bluelinks.links';
  links?: Record<string, any>[];
}


// Collection: fyi.unravel.frontpage.comment
// Service: unknown
// Types: fyi.unravel.frontpage.comment
export interface FyiUnravelFrontpageComment {
  $type: 'fyi.unravel.frontpage.comment';
  post?: Record<string, any>;
  content?: string;
  createdAt?: string;
}


// Collection: fyi.unravel.frontpage.post
// Service: unknown
// Types: fyi.unravel.frontpage.post
export interface FyiUnravelFrontpagePost {
  $type: 'fyi.unravel.frontpage.post';
  url?: string;
  title?: string;
  createdAt?: string;
}


// Collection: fyi.unravel.frontpage.vote
// Service: unknown
// Types: fyi.unravel.frontpage.vote
export interface FyiUnravelFrontpageVote {
  $type: 'fyi.unravel.frontpage.vote';
  subject?: Record<string, any>;
  createdAt?: string;
}


// Collection: im.flushing.right.now
// Service: unknown
// Types: im.flushing.right.now
export interface ImFlushingRightNow {
  $type: 'im.flushing.right.now';
  text?: string;
  emoji?: string;
  createdAt?: string;
}


// Collection: link.woosh.linkPage
// Service: unknown
// Types: link.woosh.linkPage
export interface LinkWooshLinkPage {
  $type: 'link.woosh.linkPage';
  collections?: Record<string, any>[];
}


// Collection: my.skylights.rel
// Service: unknown
// Types: my.skylights.rel
export interface MySkylightsRel {
  $type: 'my.skylights.rel';
  item?: Record<string, any>;
  note?: Record<string, any>;
  rating?: Record<string, any>;
}


// Collection: org.owdproject.application.windows
// Service: unknown
// Types: org.owdproject.application.windows
export interface OrgOwdprojectApplicationWindows {
  $type: 'org.owdproject.application.windows';
}


// Collection: org.owdproject.desktop
// Service: unknown
// Types: org.owdproject.desktop
export interface OrgOwdprojectDesktop {
  $type: 'org.owdproject.desktop';
  state?: Record<string, any>;
}


// Collection: org.scrapboard.list
// Service: unknown
// Types: org.scrapboard.list
export interface OrgScrapboardList {
  $type: 'org.scrapboard.list';
  name?: string;
  createdAt?: string;
  description?: string;
}


// Collection: org.scrapboard.listitem
// Service: unknown
// Types: org.scrapboard.listitem
export interface OrgScrapboardListitem {
  $type: 'org.scrapboard.listitem';
  url?: string;
  list?: string;
  createdAt?: string;
}


// Collection: place.stream.chat.message
// Service: unknown
// Types: place.stream.chat.message
export interface PlaceStreamChatMessage {
  $type: 'place.stream.chat.message';
  text?: string;
  streamer?: string;
  createdAt?: string;
}


// Collection: place.stream.chat.profile
// Service: unknown
// Types: place.stream.chat.profile
export interface PlaceStreamChatProfile {
  $type: 'place.stream.chat.profile';
  color?: Record<string, any>;
}


// Collection: pub.leaflet.document
// Service: unknown
// Types: pub.leaflet.document
export interface PubLeafletDocument {
  $type: 'pub.leaflet.document';
  pages?: Record<string, any>[];
  title?: string;
  author?: string;
  postRef?: Record<string, any>;
  description?: string;
  publication?: string;
  publishedAt?: string;
}


// Collection: pub.leaflet.graph.subscription
// Service: unknown
// Types: pub.leaflet.graph.subscription
export interface PubLeafletGraphSubscription {
  $type: 'pub.leaflet.graph.subscription';
  publication?: string;
}


// Collection: pub.leaflet.publication
// Service: unknown
// Types: pub.leaflet.publication
export interface PubLeafletPublication {
  $type: 'pub.leaflet.publication';
  icon?: Record<string, any>;
  name?: string;
  base_path?: string;
  description?: string;
}


// Collection: sh.tangled.actor.profile
// Service: sh.tangled
// Types: sh.tangled.actor.profile
export interface ShTangledActorProfile {
  $type: 'sh.tangled.actor.profile';
  links?: string[];
  stats?: string[];
  bluesky?: boolean;
  location?: string;
  description?: string;
  pinnedRepositories?: string[];
}


// Collection: sh.tangled.feed.star
// Service: sh.tangled
// Types: sh.tangled.feed.star
export interface ShTangledFeedStar {
  $type: 'sh.tangled.feed.star';
  subject?: string;
  createdAt?: string;
}


// Collection: sh.tangled.publicKey
// Service: sh.tangled
// Types: sh.tangled.publicKey
export interface ShTangledPublicKey {
  $type: 'sh.tangled.publicKey';
  key?: string;
  name?: string;
  createdAt?: string;
}


// Collection: sh.tangled.repo
// Service: sh.tangled
// Types: sh.tangled.repo
export interface ShTangledRepo {
  $type: 'sh.tangled.repo';
  knot?: string;
  name?: string;
  owner?: string;
  createdAt?: string;
}


// Collection: so.sprk.actor.profile
// Service: unknown
// Types: so.sprk.actor.profile
export interface SoSprkActorProfile {
  $type: 'so.sprk.actor.profile';
  avatar?: Record<string, any>;
  description?: string;
  displayName?: string;
}


// Collection: so.sprk.feed.like
// Service: unknown
// Types: so.sprk.feed.like
export interface SoSprkFeedLike {
  $type: 'so.sprk.feed.like';
  subject?: Record<string, any>;
  createdAt?: string;
}


// Collection: so.sprk.feed.story
// Service: unknown
// Types: so.sprk.feed.story
export interface SoSprkFeedStory {
  $type: 'so.sprk.feed.story';
  tags?: any[];
  media?: Record<string, any>;
  createdAt?: string;
  selfLabels?: any[];
}


// Collection: social.grain.actor.profile
// Service: grain.social
// Types: social.grain.actor.profile
export interface SocialGrainActorProfile {
  $type: 'social.grain.actor.profile';
  avatar?: Record<string, any>;
  description?: string;
  displayName?: string;
}


// Collection: social.grain.favorite
// Service: grain.social
// Types: social.grain.favorite
export interface SocialGrainFavorite {
  $type: 'social.grain.favorite';
  subject?: string;
  createdAt?: string;
}


// Collection: social.grain.gallery
// Service: grain.social
// Types: social.grain.gallery
export interface SocialGrainGallery {
  $type: 'social.grain.gallery';
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}


// Collection: social.grain.gallery.item
// Service: grain.social
// Types: social.grain.gallery.item
export interface SocialGrainGalleryItem {
  $type: 'social.grain.gallery.item';
  item?: string;
  gallery?: string;
  position?: number;
  createdAt?: string;
}


// Collection: social.grain.graph.follow
// Service: grain.social
// Types: social.grain.graph.follow
export interface SocialGrainGraphFollow {
  $type: 'social.grain.graph.follow';
  subject?: string;
  createdAt?: string;
}


// Collection: social.grain.photo
// Service: grain.social
// Types: social.grain.photo
export interface SocialGrainPhoto {
  $type: 'social.grain.photo';
  alt?: string;
  cid?: string;
  did?: string;
  uri?: string;
  photo?: Record<string, any>;
  createdAt?: string;
  indexedAt?: string;
  aspectRatio?: Record<string, any>;
}


// Collection: social.grain.photo.exif
// Service: grain.social
// Types: social.grain.photo.exif
export interface SocialGrainPhotoExif {
  $type: 'social.grain.photo.exif';
  iSO?: number;
  make?: string;
  flash?: string;
  model?: string;
  photo?: string;
  fNumber?: number;
  lensMake?: string;
  createdAt?: string;
  lensModel?: string;
  exposureTime?: number;
  dateTimeOriginal?: string;
  focalLengthIn35mmFormat?: number;
}


// Collection: social.pinksky.app.preference
// Service: unknown
// Types: social.pinksky.app.preference
export interface SocialPinkskyAppPreference {
  $type: 'social.pinksky.app.preference';
  slug?: string;
  value?: string;
  createdAt?: string;
}


// Union type for all discovered types
export type DiscoveredTypes = 'app.bsky.actor.profile' | 'app.bsky.feed.like' | 'app.bsky.feed.post' | 'app.bsky.feed.postgate' | 'app.bsky.feed.repost' | 'app.bsky.feed.threadgate' | 'app.bsky.graph.block' | 'app.bsky.graph.follow' | 'app.bsky.graph.list' | 'app.bsky.graph.listitem' | 'app.bsky.graph.starterpack' | 'app.bsky.graph.verification' | 'app.popsky.list' | 'app.popsky.listItem' | 'app.popsky.profile' | 'app.popsky.review' | 'app.rocksky.album' | 'app.rocksky.artist' | 'app.rocksky.like' | 'app.rocksky.scrobble' | 'app.rocksky.song' | 'blue.flashes.actor.profile' | 'blue.linkat.board' | 'buzz.bookhive.book' | 'chat.bsky.actor.declaration' | 'chat.roomy.01JPNX7AA9BSM6TY2GWW1TR5V7.catalog' | 'chat.roomy.profile' | 'com.germnetwork.keypackage' | 'com.whtwnd.blog.entry' | 'community.lexicon.calendar.rsvp' | 'events.smokesignal.app.profile' | 'events.smokesignal.calendar.event' | 'farm.smol.games.skyrdle.score' | 'fyi.bluelinks.links' | 'fyi.unravel.frontpage.comment' | 'fyi.unravel.frontpage.post' | 'fyi.unravel.frontpage.vote' | 'im.flushing.right.now' | 'link.woosh.linkPage' | 'my.skylights.rel' | 'org.owdproject.application.windows' | 'org.owdproject.desktop' | 'org.scrapboard.list' | 'org.scrapboard.listitem' | 'place.stream.chat.message' | 'place.stream.chat.profile' | 'pub.leaflet.document' | 'pub.leaflet.graph.subscription' | 'pub.leaflet.publication' | 'sh.tangled.actor.profile' | 'sh.tangled.feed.star' | 'sh.tangled.publicKey' | 'sh.tangled.repo' | 'so.sprk.actor.profile' | 'so.sprk.feed.like' | 'so.sprk.feed.story' | 'social.grain.actor.profile' | 'social.grain.favorite' | 'social.grain.gallery' | 'social.grain.gallery.item' | 'social.grain.graph.follow' | 'social.grain.photo' | 'social.grain.photo.exif' | 'social.pinksky.app.preference';

