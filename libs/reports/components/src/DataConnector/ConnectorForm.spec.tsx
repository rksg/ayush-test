import { configureStore } from '@reduxjs/toolkit'
import userEvent          from '@testing-library/user-event'
import { rest }           from 'msw'

import { Provider }                                       from '@acx-ui/store'
import { notificationApiURL }                             from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'
import { mockRestApiQuery }                               from '@acx-ui/test-utils'

import ConnectorForm         from './ConnectorForm'
import { dataConnectorApis } from './services'
import { Frequency }         from './types'

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn().mockReturnValue({ settingId: 'id' })
}))
const components = require('@acx-ui/components')
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getUsername: jest.fn().mockReturnValue('username')
}))

describe('DataConnectorForm', () => {
  const store = configureStore({
    reducer: {
      [dataConnectorApis.reducerPath]: dataConnectorApis.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataConnectorApis.middleware])
  })
  beforeEach(() => {
    mockServer.use(
      rest.get(
        `${notificationApiURL}/dataConnector/dataSources`,
        (_, res, ctx) => res(ctx.json([{
          dataSource: 'apInventory',
          columns: ['apName', 'apMac']
        }, {
          dataSource: 'switchInventory',
          columns: ['switchName', 'switchMac']
        }, {
          dataSource: 'unknown',
          columns: []
        }]))
      )
    )
  })
  afterEach(() => {
    store.dispatch(dataConnectorApis.util.resetApiState())
    components.showToast.mockClear()
    mockNavigate.mockClear()
  })
  it('(RAI) should render ConnectorForm create', async () => {
    render(<ConnectorForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Connector')).toBeVisible()
  })
  it('(RAI) should render ConnectorForm edit', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector/id`, 'get', {
      data: {
        id: 'id',
        name: 'name',
        dataSource: 'apInventory',
        columns: ['apName'],
        frequency: Frequency.Daily
      }
    })
    render(<ConnectorForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Edit Connector')).toBeVisible()
  })
  it('should trigger validation for fields on apply click', async () => {
    render(<ConnectorForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Connector')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
  it('should save on apply click', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector`, 'post', {
      data: { id: 'id' }
    }, false, true)
    render(<ConnectorForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Connector')).toBeVisible()
    const dd1 = (await screen.findAllByRole('combobox')).at(0) as HTMLElement
    await userEvent.click(dd1)
    await userEvent.click(screen.getByText('AP Inventory'))
    const dd2 = (await screen.findAllByRole('combobox')).at(1) as HTMLElement
    await userEvent.click(dd2)
    await userEvent.click(screen.getAllByText('apMac').at(1) as HTMLElement)
    const name = await screen.findByTestId('name')
    fireEvent.change(name, { target: { value: 'name' } })
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(-1)
    })
  })
  it('should handle error on save', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataConnector/id`, 'get', {
      data: {
        id: 'id',
        name: 'name',
        dataSource: 'apInventory',
        columns: ['apName'],
        frequency: Frequency.Daily
      }
    })
    mockRestApiQuery(`${notificationApiURL}/dataConnector`, 'patch', {
      error: { data: { error: 'server error' } }
    }, false, true)
    render(<ConnectorForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Edit Connector')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
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
    render(<ConnectorForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Connector')).toBeVisible()
    const dd = (await screen.findAllByRole('combobox')).at(0) as HTMLElement
    await userEvent.click(dd)
    await userEvent.click(screen.getByText('AP Inventory'))
    const CancelBtn = await screen.findByRole('button', { name: 'Cancel' })
    expect(CancelBtn).toBeVisible()
    fireEvent.click(CancelBtn)
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(-1)
    })
  })
})