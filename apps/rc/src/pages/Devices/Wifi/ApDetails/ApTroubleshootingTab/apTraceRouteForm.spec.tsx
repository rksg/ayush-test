import '@testing-library/jest-dom'

import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'
import { ApTraceRouteForm } from './apTraceRouteForm'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }

describe('ApSettingsTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><ApTraceRouteForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})