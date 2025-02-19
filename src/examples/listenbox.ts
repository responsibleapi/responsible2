import {
  array,
  boolean,
  dict,
  GET,
  headerSecurity,
  int32,
  int64,
  middleware,
  object,
  openAPI,
  POST,
  response,
  scope,
  string,
  unknown,
} from "../responsible.ts"

const Email = () => string({ format: "email" })

const ShowID = () => string({ minLength: 11, maxLength: 12 })
const FeedID = () => string({ minLength: 11, maxLength: 11 })
const ItemID = () => string({ minLength: 11, maxLength: 11 })

const HttpURL = () =>
  string({
    format: "uri",
    pattern: /^https?:\/\/\S+$/,
    example: "https://example.com",
  })

const SubmitReq = () => object({ url: HttpURL })

const UrlResp = () => object({ url: HttpURL })

const Plan = () => string({ enum: ["free", "basic", "creator"] })

const UserResp = () =>
  object({
    email: Email,
    plan: Plan,
    trialed: boolean(),
    updates: boolean(),
  })

const UnixMillis = () =>
  int64({
    description: "UNIX epoch milliseconds",
    example: 1739982555384,
  })

const RecentResp = () =>
  object({
    list: array(
      object({
        id: ShowID,
        feed_id: FeedID,
        title: string(),
        episodes: int32({ minimum: 0 }),
        "image?": HttpURL,
        "refreshed_utc?": UnixMillis,
        "author?": string(),
        "owner?": string(),
      }),
      { minItems: 0 },
    ),
    plan: Plan,
  })

const ErrorStruct = () =>
  object({
    type: string({ minLength: 1 }),
    message: string({ minLength: 1 }),
    "causeType?": string({ minLength: 1 }),
    "causeMessage?": string({ minLength: 1 }),
  })

const ITunesCategory = () =>
  object({
    category: string({ minLength: 1 }),
    "subcategory?": string({ minLength: 1 }),
  })

const YouTubeFeedType = () => string({ enum: ["video", "playlist", "channel"] })

const Show = () =>
  object({
    id: ShowID,
    audioFeedURL: HttpURL,
    feed_id: FeedID,
    description: string(),
    episodes: int32({ minimum: 0 }),
    language: string(),
    title: string(),
    videoFeedURL: HttpURL,
    youtubeURL: HttpURL,
    "analyticsPrefix?": HttpURL,
    "author?": string(),
    "copyright?": string(),
    "explicit?": boolean(),
    "image?": HttpURL,
    "keywords?": string(),
    "owner?": string(),
    "ownerEmail?": Email,
    "primaryCategory?": ITunesCategory,
    "refreshedUTC?": UnixMillis,
    "reverse?": boolean(),
    "secondaryCategory?": ITunesCategory,
    "type?": YouTubeFeedType,
    "website?": HttpURL,
  })

const PaginationResp = () =>
  object({
    hasBefore: boolean({
      deprecated: true,
      description: "newBefore is enough",
    }),
    hasAfter: boolean({ deprecated: true, description: "newAfter is enough" }),
    "newBefore?": ItemID,
    "newAfter?": ItemID,
  })

const Show2 = () =>
  object({
    show: Show,
    items: array(ItemID),
    "user?": UserResp,
    pagination: PaginationResp,
  })

const EditShowReq = () =>
  object({
    explicit: boolean(),
    language: string(),
    owner: string(),
    ownerEmail: Email,
    "analyticsPrefix?": HttpURL,
    "author?": string(),
    "category1?": string(),
    "category2?": string(),
    "copyright?": string(),
    "description?": string(),
    "image?": HttpURL,
    "keywords?": string(),
    "subcategory1?": string(),
    "subcategory2?": string(),
    "title?": string(),
    "website?": HttpURL,
  })

const Mime = () => string({ pattern: /^\w+\/[-+.\w]+$/ })

const JsonItem = () =>
  object({
    id: ItemID,
    title: string(),
    webpage_url: HttpURL,
    pub_date_utc: UnixMillis,
    audio_url: HttpURL,
    mime: Mime,
    "duration_seconds?": int32({ minimum: 0 }),
    "image?": HttpURL,
    "author?": string(),
  })

const ItemsResp = () =>
  object(
    {
      items: array(JsonItem, { minItems: 0 }),
      total: int32({ minimum: 0 }),
    },
    { deprecated: true },
  )

const ItemsResp2 = () =>
  object({
    items: array(JsonItem, { minItems: 0 }),
    pagination: PaginationResp,
  })

const LoginReq = () =>
  object({
    email: Email,
    host: string({ minLength: 1 }),
  })

const AuthorizationHeader = () => headerSecurity({ name: "authorization" })

const WorkerEvent = () =>
  object({
    url: HttpURL,
    headers: dict(string(), string()),
    timestamp: UnixMillis,
  })

const PlanInterval = () => string({ enum: ["month", "year"] })

const DownloadsChart = () =>
  object({
    list: array(
      object({
        day: UnixMillis,
        downloads: int32({ minimum: 0 }),
      }),
      { minItems: 0 },
    ),
    total: int64({ minimum: 0 }),
  })

const UpgradeToAddMoreToListenLater = () =>
  response({
    description: "Adding more that 1 item to Listen Later requires a paid plan",
  })

const PreSignedUploadURL = () =>
  object({
    fileUrl: HttpURL,
    uploadUrl: HttpURL,
    headers: dict(string(), string()),
  })

const ReverseReq = () => object({ showID: ShowID, value: boolean() })

const ReverseResp = () => object({ value: boolean() })

const NotYourShow = () =>
  response({ description: "You can't edit somebody else's show" })

const authenticatedOps = scope({
  "/*": middleware({
    req: { security: AuthorizationHeader },
    res: { add: { 401: unknown() } },
  }),

  "/unsubscribe": POST({
    name: "unsubscribe",
    description: "Unsubscribe the email from product updates",
    req: object({ email: Email }),
    res: { 200: unknown() },
  }),

  "/user": scope({
    GET: {
      name: "getUser",
      res: { 200: UserResp },
    },

    /** why is this a POST */
    POST: {
      name: "patchUser",
      req: object({ updates: boolean() }),
      res: { 200: UserResp },
    },

    DELETE: {
      name: "deleteUser",
      res: { 200: unknown() },
    },

    "/:email/shows": GET({
      name: "showsByEmail",
      deprecated: true,
      req: { params: { email: Email } },
      res: {
        200: array(
          object({
            id: ShowID,
            title: string({ minLength: 1 }),
          }),
        ),
      },
    }),
  }),

  "/recent": GET({
    name: "recentFeeds",
    res: { 200: RecentResp },
  }),

  "/checkout": POST({
    name: "stripeCheckout",
    description:
      "Redirect to the checkout page or to billing if already subscribed",
    req: object({
      plan: Plan,
      interval: PlanInterval,
      success_url: HttpURL,
      cancel_url: HttpURL,
    }),
    res: { 201: UrlResp },
  }),

  "/billing": POST({
    name: "stripeBilling",
    req: object({ return_url: HttpURL }),
    res: { 201: UrlResp },
  }),

  "/show/:show_id": scope({
    params: { show_id: ShowID },

    "/*": middleware({
      res: {
        add: {
          403: NotYourShow,
          404: unknown(),
        },
      },
    }),

    PUT: {
      name: "editShow",
      req: EditShowReq,
      res: { 200: Show },
    },

    DELETE: {
      name: "deleteFeed",
      res: { 200: unknown() },
    },

    "/downloads": GET({
      name: "getDownloads",
      req: {
        query: {
          "timezone?": string({ minLength: 1 }),
        },
      },
      res: { 200: DownloadsChart },
    }),

    "/episode_downloads": GET({
      name: "episodeDownloads",
      res: {
        200: array(
          object({
            title: string(),
            url: HttpURL,
            downloads: int32({ minimum: 0 }),
          }),
        ),
      },
    }),
  }),

  "/later": scope({
    GET: {
      name: "getLater",
      deprecated: true,
      res: { 200: Show },
    },

    POST: {
      name: "submitLater",
      req: SubmitReq,
      res: {
        200: Show,
        402: UpgradeToAddMoreToListenLater,
      },
    },

    "/v2/v2": GET({
      name: "getLater2",
      req: {
        query: {
          "before?": ItemID,
          "after?": ItemID,
        },
      },
      res: { 200: Show2 },
    }),

    "/:itemID": scope({
      params: { itemID: ItemID },

      POST: {
        name: "addLater",
        res: {
          200: unknown(),
          402: UpgradeToAddMoreToListenLater,
        },
      },

      DELETE: {
        name: "removeLater",
        res: { 200: unknown() },
      },
    }),
  }),

  "/s3_presign_image": GET({
    name: "preSignedImageUploadURL",
    req: {
      query: {
        filename: string({ minLength: 1 }),
      },
    },
    res: {
      200: PreSignedUploadURL,
      402: { description: "Only Creators can upload images" },
    },
  }),

  "/reverse": POST({
    name: "reversePlaylist",
    req: ReverseReq,
    res: {
      200: ReverseResp,
      403: NotYourShow,
    },
  }),
})

const jsonAPI = scope({
  "/*": middleware({
    req: { mime: "application/json" },
    res: {
      match: {
        "200..299": {
          mime: "application/json",
          headers: { "Content-Length": int32({ minimum: 1 }) },
        },
      },
    },
  }),

  "/login": POST({
    name: "requestOtp",
    req: LoginReq,
    res: {
      200: object({
        login: string({ enum: ["NEW", "EXISTING"] }),
      }),
    },
  }),

  "/otp": POST({
    name: "submitOtp",
    req: object({
      email: Email,
      otp: string({ minLength: 1 }),
      "updates?": boolean(),
    }),
    res: {
      201: object({
        jwt: string({ minLength: 1 }),
      }),
      401: {
        description: "Incorrect OTP",
      },
    },
  }),

  "/submit": POST({
    name: "submitUrl",
    req: SubmitReq,
    res: {
      200: object({
        showID: ShowID,
        "plan?": Plan,
      }),
      401: {
        description: "Submitting playlists requires a login",
      },
      404: unknown(),
    },
  }),

  "/show/:showID": scope({
    params: { showID: ShowID },

    "/*": middleware({
      res: {
        add: {
          404: unknown(),
        },
      },
    }),

    GET: {
      deprecated: true,
      name: "getShow",
      res: { 200: Show },
    },

    "/v2": GET({
      name: "getShow2",
      req: {
        "security?": AuthorizationHeader,
        query: {
          "before?": ItemID,
          "after?": ItemID,
        },
      },
      res: { 200: Show2 },
    }),

    "/items2": GET({
      name: "getItems2",
      req: {
        query: {
          "before?": ItemID,
          "after?": ItemID,
        },
      },
      res: { 200: ItemsResp2 },
    }),

    "/items": GET({
      name: "getItems",
      deprecated: true,
      req: {
        query: {
          "before?": string({ format: "date-time" }),
          "limit?": int32({ minimum: 1 }),
        },
      },
      res: { 200: ItemsResp },
    }),
  }),

  "/cdn_log": POST({
    name: "logCDN",
    req: {
      body: {
        "application/json": WorkerEvent,
        /** workaround for a current worker to avoid redeploying it 😏 */
        "text/plain": WorkerEvent,
      },
    },
    res: {
      201: {
        headers: {
          /** wtf is this */
          "Content-Length?": int32({ minimum: 0, maximum: 0 }),
        },
      },
    },
  }),

  "/auth": authenticatedOps,
})

const googleAuth = scope({
  GET: {
    name: "googleSlash",
    res: {
      302: {
        headers: {
          location: HttpURL,
        },
      },
    },
  },

  "/callback": GET({
    name: "googleCallback",
    req: {
      query: {
        code: string({ minLength: 1 }),
      },
    },
    res: {
      302: {
        headers: {
          location: HttpURL,
        },
        cookies: {
          token: string({ minLength: 1 }),
        },
      },
    },
  }),
})

const RedirectRSS = () => response({ headers: { Location: HttpURL } })

const NonEmptyString = () => string({ minLength: 1 })

const ItemNotFound = () => response({ description: "Item not found" })

export const listenboxAPI = openAPI(
  {
    openapi: "3.0.0",
    info: {
      title: "Listenbox",
      version: "0.1",
      termsOfService: "https://listenbox.app/terms",
    },
    servers: [
      { url: "http://localhost:8080" },
      { url: "https://api.listenbox.app" },
    ],
  },
  {
    "/*": middleware({
      res: {
        add: {
          400: {
            headers: { "Content-Length": int32({ minimum: 1 }) },
            body: { "application/json": ErrorStruct },
          },
        },
      },
    }),

    "/japi": jsonAPI,

    "/oauth/google": googleAuth,

    "/rss/:showID/:type.rss": GET({
      name: "rss",
      req: {
        params: {
          showID: ShowID,
          type: string({ enum: ["audio", "video"] }),
        },
      },
      res: {
        200: {
          headers: {
            "Content-Length": int32({ minimum: 1 }),
            ETag: string({ minLength: 1 }),
            "Cache-Control": string({ const: "no-cache" }),
            "CDN-Cache-Control": string({ pattern: /max-age=\d+/ }),
            "Last-Modified?": string({ minLength: 1 }),
          },
          body: {
            "application/rss+xml": string({ minLength: 1 }),
            "application/xml": string({ minLength: 1 }),
          },
        },
        301: RedirectRSS,
        302: RedirectRSS,
        403: { description: "Only accessible through CDN" },
        404: { description: "Show not found" },
      },
    }),

    "/a/:itemID.:ext": GET({
      name: "audio",
      req: {
        params: {
          itemID: ItemID,
          ext: NonEmptyString,
        },
        headers: {
          "CF-Connecting-IP?": string({ minLength: 1 }),
        },
      },
      res: {
        200: {
          headers: {
            "Cache-Control": string({ minLength: 1 }),
            "Content-Length": int32({ minimum: 1 }),
          },
          body: {
            "audio/*": string({ format: "binary" }),
          },
        },
        404: ItemNotFound,
      },
    }),

    "/w/:itemID.:ext": GET({
      name: "video",
      req: {
        params: {
          itemID: ItemID,
          ext: NonEmptyString,
        },
        headers: {
          "CF-Connecting-IP?": string({ minLength: 1 }),
        },
      },
      res: {
        302: {
          headers: {
            Location: HttpURL,
            "Cache-Control": string({ minLength: 1 }),
          },
        },
        404: ItemNotFound,
      },
    }),

    "/stripe/hooks": POST({
      name: "stripeWebhook",
      req: {
        headers: {
          "Stripe-Signature": string({ minLength: 1 }),
        },
        body: {
          "application/json": object(),
        },
      },
      res: {
        200: unknown(),
      },
    }),
  },
)
