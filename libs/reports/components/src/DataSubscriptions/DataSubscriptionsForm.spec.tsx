import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import DataSubscriptionsForm from './DataSubscriptionsForm'
describe('DataSubscriptionsForm', () => {
  describe('RAI', () => {
    it('should render New DataSubscriptionsForm correct', async () => {
      render(<DataSubscriptionsForm isRAI/>, {
        route: {},
        wrapper: Provider
      })
      expect(await screen.findByText('New Subscription')).toBeVisible()
    })

    it('should render Edit DataSubscriptionsForm correct', async () => {
      render(<DataSubscriptionsForm isRAI editMode/>, {
        route: {},
        wrapper: Provider
      })
      expect(await screen.findByText('DataSubscriptions')).toBeVisible()
    })
  })
})