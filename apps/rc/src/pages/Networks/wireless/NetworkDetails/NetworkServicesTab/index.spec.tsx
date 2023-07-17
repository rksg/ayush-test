import '@testing-library/jest-dom'


import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkServicesTab } from './index'


describe('NetworkServicesTab', () => {
  it('should render network services tab successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <NetworkServicesTab />
        </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('Services')).toBeInTheDocument()
  })

})

