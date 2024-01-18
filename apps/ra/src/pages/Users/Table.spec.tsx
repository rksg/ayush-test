import '@testing-library/react'
import { ManagedUser }    from '@acx-ui/analytics/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { UsersTable } from './Table'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn().mockImplementation(() => ({
    selectedTenant: { settings: { franchisor: 'testFranchisor' } }
  }))
}))

const data: ManagedUser[] = [
  {
    id: '1',
    firstName: 'firstName dog1',
    lastName: 'lastName dog1',
    email: 'dog1@ruckuswireless.com.uat',
    accountId: '0015000000GlI7SAAV',
    accountName: 'RUCKUS NETWORKS, INC',
    role: 'admin' as const,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    updatedAt: '2023-09-22T07:31:11.844Z',
    type: null,
    invitation: null
  },
  {
    id: '0032h00000LUqTmAAL',
    firstName: 'FisrtName 1062',
    lastName: 'LastName 1062',
    email: 'dog1062@email.com',
    accountId: '0012h00000NrlBdAAJ',
    accountName: 'Dog Company 1062',
    role: 'network-admin' as const,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '1aac20e7-c7db-4bab-a9d4-28b26995c691',
    resourceGroupName: 'bugbash-12',
    type: 'tenant',
    invitation: {
      state: 'accepted',
      inviterUser: {
        firstName: 'userFirst',
        lastName: 'userSecond'
      }
    }
  },
  {
    id: '0032h00000LUqYCAA1',
    firstName: 'FisrtName 12',
    lastName: 'LastName 12',
    email: 'dog12@email.com',
    accountId: '0012h00000NrlKrAAJ',
    accountName: 'Dog Company 12',
    role: 'report-only' as const,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    type: 'super-tenant',
    invitation: {
      state: 'pending',
      inviterUser: {
        firstName: 'userThird',
        lastName: 'userFourth'
      }
    }
  },
  {
    id: 'rejected user',
    firstName: 'FisrtName rej',
    lastName: 'LastName rej',
    email: 'dog12@email.com',
    accountId: '0012h00000NrlKrAAJ',
    accountName: 'Dog Company 12',
    role: 'report-only' as const,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    type: 'super-tenant',
    invitation: {
      state: 'rejected',
      inviterUser: {
        firstName: 'userRej',
        lastName: 'userRej'
      }
    }
  }
]

describe('UsersTable', () => {
  it('should render table correctly', async () => {
    render(<UsersTable data={data} />, { wrapper: Provider })
    expect(await screen.findByText('firstName dog1')).toBeVisible()
    expect(await screen.findByText('FisrtName 1062')).toBeVisible()
    expect(await screen.findByText('FisrtName 12')).toBeVisible()
    expect(await screen.findByText('FisrtName rej')).toBeVisible()
  })
  it('should render undefined data table correctly', async () => {
    render(<UsersTable data={undefined} />, { wrapper: Provider })
    expect(await screen.findByText('No Data')).toBeVisible()
  })
})
