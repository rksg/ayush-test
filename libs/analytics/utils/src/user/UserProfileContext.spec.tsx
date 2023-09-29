import '@testing-library/jest-dom'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { Tenant }                         from './types'
import { getUserProfile, setUserProfile } from './userProfile'
import {
  useUserProfileContext,
  UserProfileProvider
} from './UserProfileContext'

const permissions = {
  'view-analytics': true,
  'view-report-controller-inventory': true,
  'view-data-explorer': true,
  'manage-service-guard': true,
  'manage-call-manager': true,
  'manage-mlisa': true,
  'manage-occupancy': true,
  'manage-label': true,
  'manage-tenant-settings': true,
  'manage-config-recommendation': true
}
const tenant = {
  id: 'a1',
  name: 'name1',
  support: false,
  role: 'admin',
  resourceGroupId: 'rg1',
  isTrial: false,
  isRADEOnly: false,
  permissions,
  type: 'internal',
  settings: {
    'sla-p1-incidents-count': 's1',
    'sla-guest-experience': 's1',
    'sla-brand-ssid-compliance': 's1',
    'brand-ssid-compliance-matcher': 's1',
    'franchisor': 's1',
    'franchisee': 's1',
    'zone': 's1'
  }
}
const mockedUserProfile = {
  firstName: 'First',
  lastName: 'Last',
  email: 'e1',
  accountId: 'a1',
  userId: 'u1',
  invitations: [tenant] as Tenant[],
  tenants: [tenant] as Tenant[],
  selectedTenant: { ...tenant, permissions } as Tenant
}

function TestUserProfile () {
  const { data: userProfile } = useUserProfileContext()
  return <div>{`${userProfile?.firstName} ${userProfile?.lastName}`}</div>
}

const route = { path: '/ai' }

describe('UserProfileContext', () => {
  const wrapper = (props: { children: React.ReactNode }) => (
    <Provider>
      <UserProfileProvider {...props} />
    </Provider>
  )

  it('requests for user profile and stores in context', async () => {
    setUserProfile(mockedUserProfile)
    render(<TestUserProfile />, { wrapper, route })
    expect(await screen.findByText('First Last')).toBeVisible()
    expect(getUserProfile()).toEqual(mockedUserProfile)
  })
})
