import { configureStore } from '@reduxjs/toolkit'
import userEvent          from '@testing-library/user-event'

import { Provider }                           from '@acx-ui/store'
import { notificationApiURL }                 from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'
import { mockRestApiQuery }                   from '@acx-ui/test-utils'

import { dataSubscriptionApis } from './services'
import SubscriptionForm         from './SubscriptionForm'
import { Frequency }            from './utils'

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

describe('DataSubscriptionsForm', () => {
  const store = configureStore({
    reducer: {
      [dataSubscriptionApis.reducerPath]: dataSubscriptionApis.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataSubscriptionApis.middleware])
  })
  afterEach(() => {
    store.dispatch(dataSubscriptionApis.util.resetApiState())
    components.showToast.mockClear()
    mockNavigate.mockClear()
  })
  it('(RAI) should render SubscriptionForm create', async () => {
    render(<SubscriptionForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Subscription')).toBeVisible()
  })
  it('(RAI) should render SubscriptionForm edit', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataSubscriptions/id`, 'get', {
      data: {
        id: 'id',
        name: 'name',
        dataSource: 'apInventory',
        columns: ['apName'],
        frequency: Frequency.Daily
      }
    })
    render(<SubscriptionForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Edit Subscription')).toBeVisible()
  })
  it('should trigger validation for fields on apply click', async () => {
    render(<SubscriptionForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Subscription')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
  it('should save on apply click', async () => {
    mockRestApiQuery(`${notificationApiURL}/dataSubscriptions`, 'post', {
      data: { id: 'id' }
    }, false, true)
    render(<SubscriptionForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Subscription')).toBeVisible()
    const dd1 = (await screen.findAllByRole('combobox')).at(0) as HTMLElement
    await userEvent.click(dd1)
    await userEvent.click(screen.getByText('AP Inventory'))
    const dd2 = (await screen.findAllByRole('combobox')).at(1) as HTMLElement
    await userEvent.click(dd2)
    await userEvent.click(screen.getByText('MAC Address'))
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
    mockRestApiQuery(`${notificationApiURL}/dataSubscriptions/id`, 'get', {
      data: {
        id: 'id',
        name: 'name',
        dataSource: 'apInventory',
        columns: ['apName'],
        frequency: Frequency.Daily
      }
    })
    mockRestApiQuery(`${notificationApiURL}/dataSubscriptions`, 'patch', {
      error: { data: { error: 'server error' } }
    }, false, true)
    render(<SubscriptionForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Edit Subscription')).toBeVisible()
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
    render(<SubscriptionForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Subscription')).toBeVisible()
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