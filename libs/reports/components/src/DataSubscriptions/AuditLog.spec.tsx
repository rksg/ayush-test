import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import DataSubscriptionsAuditLog from './AuditLog'

describe('DataSubscriptionsAuditLog', () => {
  it('(RAI) should render DataSubscriptionsAuditLog correct', async () => {
    render(<DataSubscriptionsAuditLog isRAI/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('DataSubscriptions')).toBeVisible()
  })
})