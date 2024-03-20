import '@testing-library/jest-dom'

import { rest } from 'msw'

import { store, rbacApiURL } from '@acx-ui/store'
import { mockServer }        from '@acx-ui/test-utils'

import { rbacApi } from './services'

describe('RBAC API', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })
  it('update users api should work', async () => {
    mockServer.use(
      rest.put(
        `${rbacApiURL}/users/u1`,
        (_req, res, ctx) => res(ctx.text('Updated'))
      )
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.updateUser.initiate({
        userId: 'u1',
        preferences: {
          preferredLanguage: 'en-US'
        }
      })
    ) as { data: string }
    expect(data).toStrictEqual('Updated')
  })
})
