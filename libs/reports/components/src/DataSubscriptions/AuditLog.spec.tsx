import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AuditLog from './AuditLog'
describe('AuditLog', () => {
  describe('RAI', () => {
    it('should render New AuditLog correct', async () => {
      render(<AuditLog isRAI/>, {
        route: {},
        wrapper: Provider
      })
      expect(await screen.findByText('New Subscription')).toBeVisible()
    })

    it('should render Edit DataSubscriptionsForm correct', async () => {
      render(<AuditLog isRAI />, {
        route: {},
        wrapper: Provider
      })
      expect(await screen.findByText('DataSubscriptions')).toBeVisible()
    })
  })
})