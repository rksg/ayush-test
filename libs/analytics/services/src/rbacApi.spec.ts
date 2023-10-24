import '@testing-library/jest-dom'

import { groupBy } from 'lodash'
import { rest }    from 'msw'

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
    expect(data).toEqual(groupBy(mockSystems.networkNodes, 'deviceName'))
  })
})
