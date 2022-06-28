import '@testing-library/jest-dom'
import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { DpskForm } from './DpskForm'

describe('DpskForm', () => {
  it('should create open network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><Form><DpskForm /></Form></Provider>, {
      route: { params }
    })
    
    expect(asFragment()).toMatchSnapshot()
  })
})
