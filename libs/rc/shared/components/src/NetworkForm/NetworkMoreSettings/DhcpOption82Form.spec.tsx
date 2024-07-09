import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { DhcpOption82Form } from './DhcpOption82Form'

describe('DHCP Option 82 Form', () => {

  it('should render Dhcp Option 82 form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <DhcpOption82Form />
        </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('DHCP Option 82')).toBeVisible()
  })

})
