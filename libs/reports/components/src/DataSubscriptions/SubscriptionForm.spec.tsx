import userEvent from '@testing-library/user-event'

import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import SubscriptionForm from './SubscriptionForm'

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))
describe('DataSubscriptionsForm', () => {
  it('(RAI) should render SubscriptionForm create', async () => {
    render(<SubscriptionForm isRAI/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Subscription')).toBeVisible()
  })
  it('(RAI) should render SubscriptionForm edit', async () => {
    render(<SubscriptionForm isRAI editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Edit Subscription')).toBeVisible()
  })
  it('should log for fields on apply click', async () => {
    const spyLog = jest.spyOn(console, 'log')
    render(<SubscriptionForm isRAI editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Edit Subscription')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(spyLog).toBeCalledWith({
        subscriptionName: 'My subscription',
        dataSet: 'apInventory',
        dataSetColumns: [ { value: 'apName' } ],
        frequency: 'daily'
      })
    })
  })
  it('should navigate to previous route on cancel click', async () => {
    render(<SubscriptionForm isRAI/>, {
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