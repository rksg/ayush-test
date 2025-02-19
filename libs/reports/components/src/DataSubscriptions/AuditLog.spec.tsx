import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AuditLog from './AuditLog'
describe('AuditLog', () => {
  it('should render New AuditLog correct', async () => {
    render(<AuditLog />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Download Audit')).toBeVisible()
  })
})