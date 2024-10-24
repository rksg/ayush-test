import { rest } from 'msw'

import { rbacApiURL } from '@acx-ui/store'

export const applicationTokens = Array(10).fill(null).map((_, index) => ({
  id: `4cff7ebcb8d045898427749bfc89189${index}`,
  name: `token-${index}`,
  clientId: `eb9081a7d7b043d9a585644506b0de7${index}`,
  clientSecret: `54be75a13bd247feb59f7d0020d014d${index}`
}))

export const mockApplicationTokens = (appTokens = applicationTokens) => rest.get(
  `${rbacApiURL}/applicationTokens`,
  (_, res, ctx) => res(ctx.json(appTokens))
)

