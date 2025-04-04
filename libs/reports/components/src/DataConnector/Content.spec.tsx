import { configureStore } from '@reduxjs/toolkit'
import userEvent          from '@testing-library/user-event'

import { get }                                                               from '@acx-ui/config'
import { Provider }                                                          from '@acx-ui/store'
import { notificationApiURL }                                                from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved }                         from '@acx-ui/test-utils'
import { mockRestApiQuery }                                                  from '@acx-ui/test-utils'
import { RolesEnum }                                                         from '@acx-ui/types'
import { getUserProfile, RaiPermissions, setRaiPermissions, setUserProfile } from '@acx-ui/user'

import DataConnectorContent  from './Content'
import { dataConnectorApis } from './services'

const bannerTestId = 'banner-test'
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Banner: () => <div data-testid={bannerTestId} />
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

function setRole (props: {
  role: RolesEnum
}) {
  const profile = getUserProfile()
  setUserProfile({
    ...profile,
    profile: {
      ...profile.profile,
      roles: [props.role]
    }
  })
}

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

const quotaUsageTestId = 'test-quota-usage'
jest.mock('./QuotaUsageBar', () => ({
  QuotaUsageBar: () => <div data-testid={quotaUsageTestId}/>
}))

describe('DataConnectorContent', () => {
  describe('RAI', () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const store = configureStore({
      reducer: {
        [dataConnectorApis.reducerPath]: dataConnectorApis.reducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([dataConnectorApis.middleware])
    })
    afterEach(() => {
      store.dispatch(dataConnectorApis.util.resetApiState())
    })
    beforeEach(() => {
      jest.clearAllMocks()
      jest.mocked(get).mockReturnValue('true')
      setRaiPermissions({
        READ_DATA_CONNECTOR: true,
        WRITE_DATA_CONNECTOR: true,
        READ_DATA_CONNECTOR_STORAGE: true,
        WRITE_DATA_CONNECTOR_STORAGE: true
      } as RaiPermissions)
      mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'get', {})
      mockRestApiQuery(`${notificationApiURL}/dataConnector/query`, 'post', {})
    })
    it('should render DataConnectorContent correct when storage is configured', async () => {
      mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'get', {
        data: {
          config: {
            connectionType: 'azure',
            azureConnectionType: 'azureBlob',
            azureAccountName: 'some name',
            azureAccountKey: 'key',
            azureContainerName: 'name'
          },
          id: 'id',
          isConnected: true
        }
      })
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByTestId(quotaUsageTestId)).toBeVisible()
      expect(screen.getByText('New Connector')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'New Connector' }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataConnector/create',
        hash: '',
        search: ''
      })
      expect(screen.getByText(/Cloud Storage: Azure/)).toBeVisible()
      expect(screen.getByTestId('connected-dot')).toBeVisible()
      expect(screen.queryByTestId('disconnected-dot')).toBeNull()
      await userEvent.click(screen.getByRole('button', { name: /Cloud Storage: Azure/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataConnector/cloudStorage/edit/id',
        hash: '',
        search: ''
      })
    })
    it('should render DataConnectorContent correct when storage not configured', async () => {
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const connectorButton = screen.getByRole('button', { name: 'New Connector' })
      expect(connectorButton).toBeVisible()
      expect(connectorButton).toBeDisabled()
      expect(screen.getByText(/New Cloud Storage/)).toBeVisible()
      expect(screen.queryByTestId('connected-dot')).toBeNull()
      expect(screen.getByTestId('disconnected-dot')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: /New Cloud Storage/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: '/ai/dataConnector/cloudStorage/create',
        hash: '',
        search: ''
      })
    })

    it('should render DataConnectorContent correct (no storage permission)', async () => {
      setRaiPermissions({
        READ_DATA_CONNECTOR: true,
        WRITE_DATA_CONNECTOR: true,
        READ_DATA_CONNECTOR_STORAGE: false,
        WRITE_DATA_CONNECTOR_STORAGE: false
      } as RaiPermissions)
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByText('New Connector')).toBeVisible()
      expect(screen.queryByText(/Cloud Storage/)).toBeNull()
    })

    it('should render DataConnectorContent correct (no write permisson)', async () => {
      setRaiPermissions({
        READ_DATA_CONNECTOR: true,
        WRITE_DATA_CONNECTOR: false,
        READ_DATA_CONNECTOR_STORAGE: false,
        WRITE_DATA_CONNECTOR_STORAGE: false
      } as RaiPermissions)
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.queryByText('New Connector')).toBeNull()
      expect(screen.queryByText(/Cloud Storage/)).toBeNull()
    })
  })

  describe('R1', () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const store = configureStore({
      reducer: {
        [dataConnectorApis.reducerPath]: dataConnectorApis.reducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([dataConnectorApis.middleware])
    })
    afterEach(() => {
      store.dispatch(dataConnectorApis.util.resetApiState())
    })
    beforeEach(() => {
      jest.clearAllMocks()
      jest.mocked(get).mockReturnValue('') //R1
      setRole({ role: RolesEnum.PRIME_ADMIN })
      mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'get', {})
      mockRestApiQuery(`${notificationApiURL}/dataConnector/query`, 'post', {})
    })
    it('should render DataConnectorContent correct when storage is configured', async () => {
      mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'get', {
        data: {
          config: {
            connectionType: 'azure',
            azureConnectionType: 'azureFiles',
            azureAccountName: 'some name',
            azureAccountKey: 'key',
            azureShareName: 'share name'
          },
          id: 'id'
        }
      })
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByTestId(quotaUsageTestId)).toBeVisible()
      expect(screen.getByText('New Connector')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'New Connector' }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/dataConnector/create`,
        hash: '',
        search: ''
      })
      expect(screen.getByText(/Cloud Storage: Azure/)).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: /Cloud Storage: Azure/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/dataConnector/cloudStorage/edit/id`,
        hash: '',
        search: ''
      })
    })
    it('should render DataConnectorContent correct when storage not configured', async () => {
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()
      expect(screen.getByTestId(bannerTestId)).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const connectorButton = screen.getByRole('button', { name: 'New Connector' })
      expect(connectorButton).toBeVisible()
      expect(connectorButton).toBeDisabled()
      expect(screen.getByText(/New Cloud Storage/)).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: /New Cloud Storage/ }))
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/dataConnector/cloudStorage/create`,
        hash: '',
        search: ''
      })
    })

    it('should render DataConnectorContent correct (no storage permission)', async () => {
      setRole({ role: RolesEnum.ADMINISTRATOR })
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })
      expect(await screen.findByText('Data Connector')).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByText('New Connector')).toBeVisible()
      expect(screen.queryByText(/Cloud Storage/)).toBeNull()
    })

    it('should render DataConnectorContent correct (no write permisson)', async () => {
      setRole({ role: RolesEnum.READ_ONLY })
      render(<DataConnectorContent />, {
        route: { params },
        wrapper: Provider
      })

      expect(await screen.findByText('Data Connector')).toBeVisible()

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByTestId(bannerTestId)).toBeVisible()
      expect(screen.queryByText('New Connector')).toBeNull()
      expect(screen.queryByText(/Cloud Storage/)).toBeNull()
    })
  })
})
