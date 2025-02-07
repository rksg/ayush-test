
import userEvent from '@testing-library/user-event'

import { get }                               from '@acx-ui/config'
import { Provider }                          from '@acx-ui/store'
import { render, screen }                    from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import DataSubscriptionsContent from './Content'

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
    beforeEach(() => {
      jest.clearAllMocks()
      jest.mocked(get).mockReturnValue('true')
      setRaiPermissions({
        READ_DATA_CONNECTOR: true,
        WRITE_DATA_CONNECTOR: true,
        READ_DATA_CONNECTOR_STORAGE: true,
        WRITE_DATA_CONNECTOR_STORAGE: true
      } as RaiPermissions)
    })
    it('should render DataSubscriptionsContent correct', async () => {
      render(<DataSubscriptionsContent isRAI/>, {
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
      expect(screen.getByText(/Cloud Storage:/)).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: /Cloud Storage:/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataSubscriptions/cloudStorage/edit/storageId',
        hash: '',
        search: ''
      })
    })

    it('should render DataSubscriptionsContent correct(no storage permission)', async () => {
      setRaiPermissions({
        READ_DATA_CONNECTOR: true,
        WRITE_DATA_CONNECTOR: true,
        READ_DATA_CONNECTOR_STORAGE: false,
        WRITE_DATA_CONNECTOR_STORAGE: false
      } as RaiPermissions)
      render(<DataSubscriptionsContent isRAI/>, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Subscriptions')).toBeVisible()
      expect(screen.getByText('New Subscription')).toBeVisible()
      expect(screen.queryByText(/Cloud Storage:/)).toBeNull()
    })

    it('should render DataSubscriptionsContent correct(no write permisson)', async () => {
      setRaiPermissions({
        READ_DATA_CONNECTOR: true,
        WRITE_DATA_CONNECTOR: false,
        READ_DATA_CONNECTOR_STORAGE: false,
        WRITE_DATA_CONNECTOR_STORAGE: false
      } as RaiPermissions)
      render(<DataSubscriptionsContent isRAI/>, {
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