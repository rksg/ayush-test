import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import SubscriptionForm from './SubscriptionForm'
describe('DataSubscriptionsForm', () => {
  it('(RAI) should render SubscriptionForm correct', async () => {
    render(<SubscriptionForm isRAI/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('DataSubscriptions')).toBeVisible()
  })
})