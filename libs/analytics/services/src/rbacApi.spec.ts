import '@testing-library/jest-dom'

import { rest } from 'msw'

import { store, rbacApiURL } from '@acx-ui/store'
import { mockServer }        from '@acx-ui/test-utils'

import { mockSystems } from './__tests__/fixtures'
import { rbacApi }     from './rbacApi'

describe('RBAC API', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
    mockServer.use(
      rest.get(`${rbacApiURL}/systems`, (_req, res, ctx) => res(ctx.json(mockSystems))))
  })
  it('should return correct data from rbac api', async () => {
    const { status, data, error } = await store.dispatch(rbacApi.endpoints.systems.initiate({}))
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toEqual(mockSystems)
  })
  it('update invitation api should work', async () => {
    mockServer.use(
      rest.put(`${rbacApiURL}/invitations`, (_req, res, ctx) => res(ctx.text('Created')))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.updateInvitation.initiate({
        resourceGroupId: '1',
        userId: 'u1',
        state: 'accepted'
      })
    ) as { data: string }
    expect(data).toEqual('Created')
  })
})
