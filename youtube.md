# `src/examples/youtube.ts` duplication audit

This audit treats "extractable" as either:

- factorable today with the current DSL plus local helpers
- factorable cleanly after a small DSL addition

## Baseline

- `src/examples/youtube.json` is about 13k lines.
- `src/examples/youtube.ts` is 10,804 lines.
- The DSL version already extracts a few important globals well:
  - OAuth scopes and scheme wiring
  - top-level tag declarations
  - 11 global query params through root `forAll`
- The remaining size is still dominated by repeated inline schema literals and repeated route boilerplate.

## High-value duplications already extractable today

### 1. Raw schema literals are still the biggest source of noise

- The file imports only `dict()` from `src/dsl/schema.ts`.
- It still contains roughly:
  - 923 `type: "string"` literals
  - 187 `type: "object"` literals
  - 133 `type: "array"` literals
  - 73 `type: "boolean"` literals
  - 42 `type: "integer"` literals
- There are 186 named schema factories, and most of them are mechanically "object with properties" wrappers.

This means the file is still writing raw OpenAPI-shaped data most of the time instead of using the schema DSL. Even without new DSL features, a lot of this can move to:

- `string(...)`
- `integer(...)`
- `boolean(...)`
- `array(...)`
- `object(...)`
- small local wrapper factories

### 2. Canonical resource wrapper schemas repeat a lot

Exact repeated property sets:

- 11 schemas are exactly `etag, id, kind, snippet`
  - `Caption`
  - `Comment`
  - `I18nLanguage`
  - `I18nRegion`
  - `LiveChatBan`
  - `LiveChatModerator`
  - `MembershipsLevel`
  - `SearchResult`
  - `SuperChatEvent`
  - `VideoAbuseReportReason`
  - `VideoCategory`
- 10 list responses are exactly `etag, eventId, items, kind, nextPageToken, pageInfo, prevPageToken, tokenPagination, visitorId`
- 8 list responses are exactly `etag, eventId, items, kind, visitorId`
- 4 list responses are exactly `etag, eventId, items, kind, nextPageToken, pageInfo, tokenPagination, visitorId`
- 6 activity detail schemas are just `{ resourceId }`
- 3 localization schemas are exactly `{ description, title }`
- 2 tiny wrapper schemas are exactly `{ value }`
- 2 status schemas are exactly `{ privacyStatus }`

This is a strong sign that local schema helpers would pay off immediately:

- `resourceWithSnippet(...)`
- `eventListResponse(...)`
- `pagedEventListResponse(...)`
- `resourceIdOnly(...)`
- `localization(...)`
- `valueWrapper(...)`

### 3. Query parameter duplication is extreme

- There are 304 `queryParam(...)` calls.
- Most common parameter names:
  - `part`: 54
  - `onBehalfOfContentOwner`: 42
  - `id`: 32
  - `onBehalfOfContentOwnerChannel`: 17
  - `maxResults`: 15
  - `pageToken`: 15
  - `hl`: 10
  - `channelId`: 9

Exact repeated param blocks:

- `onBehalfOfContentOwner`: 32 exact repeats of one block, plus another 9 exact repeats of a second wording variant
- `onBehalfOfContentOwnerChannel`: 17 exact repeats
- `pageToken`: 13 exact repeats
- `maxResults`: 9 exact repeats
- bare string `id`: 12 exact repeats
- `hl`: multiple exact repeats
- `sync`: 2 exact repeats
- `textFormat`: 2 exact repeats

The file already proves this pattern is viable with the root-level shared params. The same idea should be used for non-global params:

- named reusable params
- local param factories
- per-resource `scope({ forAll })` bundles

### 4. `part` deserves its own abstraction

- `part` appears 54 times.
- It is the single most frequent parameter name in the file.
- Many descriptions are the same sentence shape with only the resource name or write/list wording changed.

This wants a dedicated helper, even if it stays local to the example:

- `partParam("caption", ["id", "snippet"], "list")`
- `partParam("channelSection", ["snippet", "contentDetails"], "write")`

Right now the file is re-spelling the same explanation pattern over and over.

### 5. Security combinations are much fewer than the operation count suggests

- There are 76 operations.
- There are only 8 unique `youtubeScopes(...)` combinations.
- The top combinations cover most of the file:
  - 19 uses of `youtube + youtube.force-ssl + youtubepartner`
  - 15 uses of `youtube + youtube.force-ssl`
  - 9 uses of `youtube + youtube.force-ssl + youtube.readonly + youtubepartner`
  - 7 uses of `youtube + youtube.force-ssl + youtube.readonly`
  - 5 uses of `youtube.force-ssl + youtubepartner`

This should be lifted into named auth presets:

- `youtubeWrite`
- `youtubeWritePartner`
- `youtubeRead`
- `youtubeReadPartner`
- `youtubeUploadPartner`

The current `youtubeScopes(...)` helper is a good base, but the call sites are still too repetitive.

### 6. Request/response media profiles also collapse nicely

Request bodies:

- 87 total body blocks
- 82 are JSON-only
- 2 are caption uploads: `application/octet-stream` + `text/xml`
- 2 are image uploads: `application/octet-stream` + `image/jpeg` + `image/png`
- 1 is the huge video upload media set

Responses:

- 76 total responses
- 56 are JSON-only
- 20 are bodyless
- `response({ description: "Successful response" })` appears 20 times exactly

This strongly suggests reusable helpers for:

- `jsonBody(Schema)`
- `jsonResponse(Schema)`
- `emptySuccess()`
- `captionUploadBody(Schema)`
- `imageUploadBody(Schema)`
- a special isolated `videoUploadBody(...)`

### 7. Insert/update pairs often mirror the same schema

A recurring pattern is:

- request body is `application/json: X`
- `200` response body is `application/json: X`

Examples include:

- `ChannelSection`
- `Comment`
- `CommentThread`
- `LiveBroadcast`
- `LiveStream`
- `Playlist`
- `PlaylistItem`
- `ThirdPartyLink`
- `Video`

That wants a higher-level mutation helper like:

- `jsonMutation(X)`
- `insertJsonResource(X)`
- `updateJsonResource(X)`

### 8. Multi-method resource paths are very patterned

There are 15 `scope({ ... })` multi-method paths.

Full CRUD quartets:

- `/youtube/v3/captions`
- `/youtube/v3/channelSections`
- `/youtube/v3/comments`
- `/youtube/v3/liveBroadcasts`
- `/youtube/v3/liveStreams`
- `/youtube/v3/playlistItems`
- `/youtube/v3/playlists`
- `/youtube/v3/thirdPartyLinks`
- `/youtube/v3/videos`

Three-method resource groups:

- `/youtube/v3/commentThreads`
- `/youtube/v3/liveChat/messages`
- `/youtube/v3/liveChat/moderators`
- `/youtube/v3/subscriptions`

Two-method resource groups:

- `/youtube/v3/channels`
- `/youtube/v3/liveChat/bans`

These route families are structurally similar enough that local helpers or a DSL collection helper would cut a lot of code.

### 9. Operation descriptions come from a tiny vocabulary

The operation-level descriptions are heavily concentrated around a few stock sentences:

- "Retrieves a list of resources, possibly filtered."
- "Inserts a new resource into this collection."
- "Updates an existing resource."
- "Deletes a resource."
- "Successful response"

So a lot of route code is carrying repeated narrative boilerplate rather than unique API behavior.

### 10. A lot of extraction is available through nested `scope({ forAll })`, but not used

Current DSL capabilities already let a nested scope share:

- request params
- security
- request body defaults
- response defaults

That means many groups could already pull up repeated things like:

- `onBehalfOfContentOwner`
- `pageToken`
- `maxResults`
- repeated security combinations
- repeated `200` response defaults

The example mostly uses root `forAll`, but it does not really exploit per-resource `forAll`.

## Duplications that are clean targets for DSL work

### 2. Parameter-group composition is missing

The file needs more than reusable single params. It needs reusable bundles:

- pagination params
- content-owner delegation params
- upload delegation params
- common read filters

Right now you can share individual named params, but not a first-class param pack.

### 3. The schema DSL has primitives, but not common OpenAPI wrapper shapes

The YouTube example is full of canonical wrapper patterns:

- resource with `etag/id/kind/snippet`
- event list response
- paged event list response
- localization record
- single-property wrappers

Those are generic enough to live in the DSL instead of being rebuilt ad hoc in examples.

### 4. CRUD collection helpers would fit the current route shape

The grouped routes suggest a helper family such as:

- `collectionCRUD(...)`
- `readonlyCollection(...)`
- `collectionWithActions(...)`

This would especially help the nine four-method resource collections.

### 5. Upload/media helpers need first-class treatment

The media cases are not random:

- JSON-only is the default
- captions have one upload profile
- banners and watermarks share one image-upload profile
- videos have one very large upload profile

This is regular enough that the DSL should probably expose media-profile helpers instead of forcing examples to inline MIME maps.

### 6. Richer `query` / `pathParams` APIs would remove many `queryParam({ ... })` objects

`OpReq` already has `query`, `pathParams`, and `headers`, but those fields are too low-detail for this example because many params need descriptions, `explode`, `style`, ranges, or enums.

A richer keyed param DSL could preserve those details while still avoiding:

- repeating `in`
- repeating `name`
- repeating `required`
- repeating the surrounding `queryParam({ ... })` wrapper

## Practical reduction plan

If the goal is to push `src/examples/youtube.ts` closer to 5k lines, the highest-leverage steps are:

- switch schema bodies from raw OpenAPI-shaped literals to `schema.ts` helpers
- add local helpers for resource wrappers and list responses
- name and reuse repeated query params, especially `part`, `onBehalfOfContentOwner`, `onBehalfOfContentOwnerChannel`, `pageToken`, and `maxResults`
- introduce named security presets for the 8 unique scope combinations
- introduce body/response profile helpers for JSON, empty success, caption upload, image upload, and video upload
- use nested `scope({ forAll })` much more aggressively
- extend `scope` so tags can be defaulted per resource group

## Bottom line

The file is not large because YouTube is uniquely complex. It is large because the example is still spelling out the same handful of schema wrappers, parameter blocks, media profiles, security sets, and CRUD route shapes many times.

The strongest duplication hotspots are:

- raw schema primitives
- resource/list wrapper schemas
- `part`
- content-owner delegation params
- pagination params
- 8 repeated auth presets
- JSON request/response profiles
- CRUD collection route families
