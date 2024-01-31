import '@testing-library/jest-dom'

import { groupBy } from 'lodash'
import { rest }    from 'msw'

import { Settings }          from '@acx-ui/analytics/utils'
import { store, rbacApiURL } from '@acx-ui/store'
import { mockServer }        from '@acx-ui/test-utils'

import { mockSystems } from './__tests__/fixtures'
import { rbacApi }     from './rbacApi'

describe('RBAC API', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })
  it('returns systems', async () => {
    mockServer.use(
      rest.get(`${rbacApiURL}/systems`, (_req, res, ctx) => res(ctx.json(mockSystems))))
    const { status, data, error } = await store.dispatch(rbacApi.endpoints.systems.initiate({}))
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toEqual(groupBy(mockSystems.networkNodes, 'deviceName'))
  })
  it('gets tenantSettings', async () => {
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text(
        '[{"key": "sla-p1-incidents-count", "value": "12"}]'
      )))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.getTenantSettings.initiate()
    ) as { data: Partial<Settings> }
    expect(data).toEqual({
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
      'sla-brand-ssid-compliance': '100',
      'sla-guest-experience': '100',
      'sla-p1-incidents-count': '12'
    })
  })
  it('updates tenantSettings', async () => {
    mockServer.use(
      rest.post(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text('Updated')))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.updateTenantSettings.initiate({
        'sla-p1-incidents-count': '34'
      })
    ) as { data: string }
    expect(data).toEqual('Updated')
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
  it('fetch users api should work', async () => {
    mockServer.use(
      rest.get(`${rbacApiURL}/users`, (_req, res, ctx) => res(ctx.json([{ id: 'user1' }])))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.getUsers.initiate()
    )
    expect(data).toStrictEqual([{ id: 'user1' }])
  })
  it('fetch resourceGroups api should work', async () => {
    const mockResponsObj = {
      id: '7c9ef863-8eba-4045-82d3-7ab662a97afb',
      tenantId: '0015000000GlI7SAAV',
      filter: {},
      name: 'Darshan-FT-Zoom',
      isDefault: false,
      description: null,
      updatedAt: '2021-10-18T10:18:27.931Z'
    }
    mockServer.use(
      rest.get(`${rbacApiURL}/resourceGroups`, (_req, res, ctx) => res(ctx.json([mockResponsObj])))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.getResourceGroups.initiate()
    )
    expect(data).toStrictEqual([mockResponsObj])
  })
  it('update role & rg api should work', async () => {
    mockServer.use(
      rest.put(`${rbacApiURL}/users/1`, (_req, res, ctx) => res(ctx.status(200)))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.updateUserRoleAndResourceGroup.initiate({
        resourceGroupId: '1',
        userId: '1',
        role: 'admin'
      })
    ) as { data: string }
    expect(data).toEqual('')
  })

  it('refreshUserDetails api should work', async () => {
    mockServer.use(
      rest.put(`${rbacApiURL}/users/refresh/1`, (_req, res, ctx) => res(ctx.status(200)))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.refreshUserDetails.initiate({
        userId: '1'
      })
    ) as { data: string }
    expect(data).toEqual('')
  })
  it('deleteUserResourceGroup api should work', async () => {
    mockServer.use(
      rest.delete(`${rbacApiURL}/users/resourceGroup`, (_req, res, ctx) => res(ctx.status(204)))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.deleteUserResourceGroup.initiate({
        userId: '1'
      })
    ) as { data: string }
    expect(data).toEqual('')
  })
  it('deleteInvitation api should work', async () => {
    mockServer.use(
      rest.delete(`${rbacApiURL}/invitations`, (_req, res, ctx) => res(ctx.status(204)))
    )
    const { data } = await store.dispatch(
      rbacApi.endpoints.deleteInvitation.initiate({
        userId: '1',
        resourceGroupId: 'rg1'
      })
    ) as { data: string }
    expect(data).toEqual(null)
  })
})
