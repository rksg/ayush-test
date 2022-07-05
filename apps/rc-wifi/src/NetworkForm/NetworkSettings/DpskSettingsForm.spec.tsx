import '@testing-library/jest-dom'
import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { DpskSettingsForm } from './DpskSettingsForm'

describe('DpskSettingsForm', () => {
  it('should create open network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><Form><DpskSettingsForm /></Form></Provider>, {
      route: { params }
    })
    
    expect(asFragment()).toMatchSnapshot()
  })
})
