import { configureStore } from '@reduxjs/toolkit'
import userEvent          from '@testing-library/user-event'

import { get }                               from '@acx-ui/config'
import { Provider }                          from '@acx-ui/store'
import { notificationApiURL }                from '@acx-ui/store'
import { render, screen }                    from '@acx-ui/test-utils'
import { mockRestApiQuery }                  from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import DataSubscriptionsContent from './Content'
import { dataSubscriptionApis } from './services'

const bannerTestId = 'banner-test'
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Banner: () => <div data-testid={bannerTestId} />
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockUseLocationValue = {
  pathname: '/services/list',
  search: '',
  hash: '',
  state: null
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useRaiR1HelpPageLink: () => ''
}))

describe('DataSubscriptionsContent', () => {
  describe('RAI', () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const store = configureStore({
      reducer: {
        [dataSubscriptionApis.reducerPath]: dataSubscriptionApis.reducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([dataSubscriptionApis.middleware])
    })
    afterEach(() => {
      store.dispatch(dataSubscriptionApis.util.resetApiState())
    })
    beforeEach(() => {
      jest.clearAllMocks()
      jest.mocked(get).mockReturnValue('true')
      setRaiPermissions({
        READ_DATA_SUBSCRIPTIONS: true,
        WRITE_DATA_SUBSCRIPTIONS: true
      } as RaiPermissions)
      mockRestApiQuery(`${notificationApiURL}/dataSubscriptions/storage`, 'get', {})
      mockRestApiQuery(`${notificationApiURL}/dataSubscriptions/query`, 'post', {})
    })
    it('should render DataSubscriptionsContent correct when storage not configured', async () => {
      mockRestApiQuery(`${notificationApiURL}/dataSubscriptions/storage`, 'get', {
        data: {
          config: {
            connectionType: 'azure',
            azureConnectionType: 'Azure Files',
            azureAccountName: 'some name',
            azureAccountKey: 'key',
            azureShareName: 'share name',
            azureCustomerName: 'name'
          },
          id: 'id'
        }
      })
      render(<DataSubscriptionsContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Subscriptions')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()
      expect(screen.getByText('New Subscription')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'New Subscription' }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataSubscriptions/create',
        hash: '',
        search: ''
      })
      expect(screen.getByText(/Cloud Storage: Azure/)).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: /Cloud Storage: Azure/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataSubscriptions/cloudStorage/edit/id',
        hash: '',
        search: ''
      })
    })
    it('should render DataSubscriptionsContent correct whenstorage configured', async () => {
      render(<DataSubscriptionsContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Subscriptions')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()
      expect(screen.getByText('New Subscription')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'New Subscription' }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataSubscriptions/create',
        hash: '',
        search: ''
      })
      expect(screen.getByText(/New Cloud Storage/)).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: /New Cloud Storage/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataSubscriptions/cloudStorage/create',
        hash: '',
        search: ''
      })
    })

    it('should render DataSubscriptionsContent correct(no write permisson)', async () => {
      setRaiPermissions({
        READ_DATA_SUBSCRIPTIONS: true,
        WRITE_DATA_SUBSCRIPTIONS: false
      } as RaiPermissions)
      render(<DataSubscriptionsContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Subscriptions')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()
      expect(screen.queryByText('New Subscription')).toBeNull()
      expect(screen.queryByText(/Cloud Storage:/)).toBeNull()
    })
  })
})
