import { rest } from 'msw'

import { notificationApiURL } from '@acx-ui/store'

import { DataSubscription } from '../services'

export const mockedUserId = 'userId-fake'
export const mockedSubscriptions = Array(10).fill(null).map((_, index) => ({
  id: `id-${index}`,
  name: `dataSubscription-${index}`,
  userId: mockedUserId,
  userName: 'userName-fake',
  columns: [`column-${index}`],
  status: Boolean(index % 2),
  frequency: 'daily',
  updatedAt: new Date().toISOString()
})) as DataSubscription[]
export const mockSubscriptionQuery = (data = mockedSubscriptions) => rest.post(
  `${notificationApiURL}/dataSubscriptions/query`,
  (_, res, ctx) => res(ctx.json({ data, page: 1, totalCount: data.length }))
)