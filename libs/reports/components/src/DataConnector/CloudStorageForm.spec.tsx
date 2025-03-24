import { configureStore } from '@reduxjs/toolkit'
import userEvent          from '@testing-library/user-event'

import { Provider }                           from '@acx-ui/store'
import { notificationApiURL }                 from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'
import { mockRestApiQuery }                   from '@acx-ui/test-utils'

import CloudStorageForm      from './CloudStorageForm'
import { dataConnectorApis } from './services'

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))
const components = require('@acx-ui/components')
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

describe('CloudStorageForm', () => {
  const store = configureStore({
    reducer: {
      [dataConnectorApis.reducerPath]: dataConnectorApis.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataConnectorApis.middleware])
  })
  afterEach(() => {
    store.dispatch(dataConnectorApis.util.resetApiState())
    components.showToast.mockClear()
    mockNavigate.mockClear()
  })

  it('(RAI) should render New CloudStorageForm correct', async () => {
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
  })
  it('(RAI) should render Edit CloudStorageForm correct', async () => {
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
    render(<CloudStorageForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage')).toBeVisible()
  })
  it('should save on apply click for edit', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'get', {
      data: {
        config: {
          connectionType: 'azure',
          azureConnectionType: 'azureFiles',
          azureAccountName: 'some name',
          azureAccountKey: 'key',
          azureShareName: 'share name',
          azureStoragePath: 'storage/path'
        },
        id: 'id'
      }
    })
    mockRestApiQuery(`${notificationApiURL}/dataConnector/storage/id`, 'put', {
      data: { id: 'id' }
    }, false, true)
    render(<CloudStorageForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(-1)
    })
  })
  it('should save on apply click for create', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'post', {
      data: { id: 'id' }
    }, false, true)
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
    //set feilds
    const dd = (await screen.findAllByRole('combobox')).at(1) as HTMLElement
    await userEvent.click(dd)
    await userEvent.click(screen.getByText('Azure Files'))
    const azureAccountName = await screen.findByTestId('azureAccountName')
    fireEvent.change(azureAccountName, { target: { value: 'some name' } })
    const azureAccountKey = await screen.findByTestId('azureAccountKey')
    fireEvent.change(azureAccountKey, { target: { value: 'key' } })
    const azureShareName = await screen.findByTestId('azureShareName')
    fireEvent.change(azureShareName, { target: { value: 'share name' } })
    const azureStoragePath = await screen.findByTestId('azureStoragePath')
    fireEvent.change(azureStoragePath, { target: { value: 'name' } })

    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(-1)
    })
  })
  it('should trigger validation on apply click for create', async () => {
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
  it('should trigger password and private key validation for SFTP', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'post', {
      data: { id: 'id' }
    }, false, true)
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Connection type' }))
    await userEvent.click(await screen.findByText('SFTP'))
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    expect(await screen.findAllByText('Please enter SFTP password or private key')).toHaveLength(2)
  })
  it('should show error on apply click', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector/storage`, 'get', {
      data: {
        config: {
          connectionType: 'azure',
          azureConnectionType: 'azureBlob',
          azureAccountName: 'some name',
          azureAccountKey: 'key',
          azureContainerName: 'name',
          azureStoragePath: 'some/path'
        },
        id: 'id'
      }
    })
    mockRestApiQuery(`${notificationApiURL}/dataConnector/storage/id`, 'put', {
      error: { data: { error: 'server error' } }
    }, false, true)
    render(<CloudStorageForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: { data: { error: 'server error' } }
        })
    })
  })
  it('should navigate to previous route on cancel click', async () => {
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
    const CancelBtn = await screen.findByRole('button', { name: 'Cancel' })
    expect(CancelBtn).toBeVisible()
    fireEvent.click(CancelBtn)
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(-1)
    })
  })
})