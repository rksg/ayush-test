import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ApDetailsTab } from './'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', action: 'edit' }

jest.mock('../../ApForm', () => ({
  ApForm: () => <div data-testid={'ApForm'}></div>
}))

describe('ApDetailsTab', () => {
  it('should render correctly', async () => {
    render(<Provider><ApDetailsTab /></Provider>, { route: { params } })
    expect(await screen.findByTestId('ApForm')).toBeVisible()
  })
})
