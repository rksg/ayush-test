import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { Profile, ProfileTabEnum } from '.'

const sampleProfile = {
  preferences: {
    preferredLanguage: 'en-US'
  },
  firstName: 'first',
  lastName: 'name',
  email: 'test123@gmail.com',
  accountId: '"0015000000Gl19SAAV"',
  selectedTenant: {
    role: 'admin'
  }
}

const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => ({ state: { from: '/test' } })
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn(() => (sampleProfile))
}))

jest.mock('./PreferredLanguageFormItem', () => ({
  PreferredLanguageFormItem: () => <div data-testid={'PreferredLanguageFormItem'}
    title='PreferredLanguageFormItem' />
}))

describe('Profile', () => {
  it('should render', async () => {
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Notifications')).toBeVisible()
  })
  it('should handle click', async () => {
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const button = await screen.findByText('Cancel')
    userEvent.click(button)
    expect(await screen.findByText('Notifications')).toBeVisible()
  })
})
