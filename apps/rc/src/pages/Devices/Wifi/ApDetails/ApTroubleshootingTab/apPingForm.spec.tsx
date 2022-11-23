import '@testing-library/jest-dom'

import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'
import { ApPingForm } from './apPingForm'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }

describe('ApSettingsTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><ApPingForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})