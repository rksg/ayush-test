import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { getUserProfile }   from '@acx-ui/analytics/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'
import { DEFAULT_SYS_LANG } from '@acx-ui/utils'

import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useSupportedLangs: jest.fn(() => [
    { label: 'English', value: 'en-US' },
    { label: 'Japanese', value: 'ja-JP' }
  ])
}))
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn(() => ({ data: { preferredLanguage: 'en-US' } }))
}))
const mockGetUserProfile = getUserProfile as jest.Mock
const params = { tenantId: 'tenant-id' }
const mockUserProfile = { preferredLanguage: DEFAULT_SYS_LANG }

describe('PreferredLanguageFormItem', () => {
  beforeEach(() => {
    jest.mocked(mockGetUserProfile).mockReturnValue({ data: mockUserProfile })
  })

  it('should render successfully', async () => {
    render(
      <Provider>
        <Form> <PreferredLanguageFormItem /> </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('Preferred Language')).toBeVisible()
    expect(await screen.findByText('English')).toBeVisible()
  })

  it('should render successfully when userProfile is undefined', async () => {
    jest.mocked(mockGetUserProfile).mockReturnValue({ data: null })
    render(
      <Provider>
        <Form> <PreferredLanguageFormItem /> </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('English')).toBeVisible()
  })

  it('should be able to select new language', async () => {
    const { asFragment } = render(
      <Provider>
        <Form> <PreferredLanguageFormItem /> </Form>
      </Provider>, {
        route: { params }
      })
    await userEvent.click(await screen.findByText('English'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('.ant-select-selection-item')?.textContent).toBe('English')
    await userEvent.click(await screen.findByText('Japanese'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('.ant-select-selection-item')?.textContent).toBe('Japanese')
  })
})
