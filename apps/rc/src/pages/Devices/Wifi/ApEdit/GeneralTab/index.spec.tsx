import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { GeneralTab } from './'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', action: 'edit' }

jest.mock('../../ApForm', () => ({
  ApForm: () => <div data-testid={'ApForm'}></div>
}))

describe('GeneralTab', () => {
  it('should render correctly', async () => {
    render(<Provider><GeneralTab /></Provider>, { route: { params } })
    expect(await screen.findByTestId('ApForm')).toBeVisible()
  })
})
