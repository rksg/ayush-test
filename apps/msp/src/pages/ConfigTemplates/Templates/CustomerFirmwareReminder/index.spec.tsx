import { getConfigTemplatePath } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import { CustomerFirmwareReminder } from '.'


describe('CustomerFirmwareReminder', () => {
  it('renders Warning component with default props', () => {
    render(<CustomerFirmwareReminder />, {
      route: { params: { tenantId: 'TENANT_ID' }, path: '/:tenantId/v/' + getConfigTemplatePath() }
    })
    // eslint-disable-next-line max-len
    expect(screen.getByText(/Ensure customer AP Firmware matches the template version to avoid compatibility issues/i)).toBeInTheDocument()
  })

  it('renders MspTenantLink component with correct props', () => {
    render(<CustomerFirmwareReminder />, {
      route: { params: { tenantId: 'TENANT_ID' }, path: '/:tenantId/v/' + getConfigTemplatePath() }
    })
    const link = screen.getByText('MSP Customers')
    expect(link).toHaveAttribute('href', '/TENANT_ID/v/dashboard/mspCustomers')
  })
})
