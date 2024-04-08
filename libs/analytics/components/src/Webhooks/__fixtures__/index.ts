import { rest } from 'msw'

import { notificationApiURL, rbacApiURL } from '@acx-ui/store'

export const eventTypes = [
  'incident_create_p1',
  'incident_update_p1',
  'incident_create_p2',
  'incident_update_p2',
  'incident_create_p3',
  'incident_update_p3',
  'incident_create_p4',
  'incident_update_p4'
]

export const resourceGroups = [
  { id: '00000000-0000-0000-0000-000000000000', name: 'rg-1' },
  { id: '00000000-0000-0000-0000-000000000001', name: 'rg-2' }
]

export const webhooks = Array(10).fill(null).map((_, index) => ({
  id: `00000000-0000-0000-0000-00000000000${index}`,
  name: `webhook-${index}`,
  resourceGroupId: `00000000-0000-0000-0000-00000000000${index % 2}`,
  callbackUrl: 'http://localhost:3000/callback',
  eventTypes,
  secret: 'abc124',
  enabled: Boolean(index % 2),
  createdAt: '2024-03-22T00:00:00.000Z',
  updatedAt: '2024-03-22T00:00:00.000Z'
}))

export const mockResourceGroups = () => rest.get(
  `${rbacApiURL}/resourceGroups`,
  (_, res, ctx) => res(ctx.json(resourceGroups))
)

export const webhooksUrl = (id?: string) =>
  [notificationApiURL, 'webhooks', id].filter(Boolean).join('/')
