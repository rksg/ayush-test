import { rest } from 'msw'

import { rbacApiURL } from '@acx-ui/store'

export const applicationTokens = Array(10).fill(null).map((_, index) => ({
  id: `4cff7ebcb8d045898427749bfc89189${index}`,
  camId: `4cff7ebcb8d045898427749bfc89189${index}`,
  name: `token-${index}`,
  clientId: `220ed88d2119454096be40a1f5fc55b${index}`,
  clientSecret: `b+nnswB4lgP7Zg7wzUKgva9wdJLSl2htT44KOt7RawFp/gdJwPZFcYTIqR7KQ1r${index}`
}))

export const mockApplicationTokens = (appTokens = applicationTokens) => rest.get(
  `${rbacApiURL}/applicationTokens`,
  (_, res, ctx) => res(ctx.json(appTokens))
)

