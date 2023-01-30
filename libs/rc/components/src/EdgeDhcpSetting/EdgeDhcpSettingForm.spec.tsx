import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render, screen
} from '@acx-ui/test-utils'

import { EdgeDhcpSettingForm } from './EdgeDhcpSettingForm'

describe('EdgeDhcpSettingForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should create EdgeDhcpSettingForm successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeDhcpSettingForm />
      </Provider>, { route: { params } }
    )

    expect(screen.getByRole('switch')).not.toBeChecked()
    await screen.findByRole('textbox', { name: /primary dns server/i })
    expect(asFragment()).toMatchSnapshot()
  })

})
