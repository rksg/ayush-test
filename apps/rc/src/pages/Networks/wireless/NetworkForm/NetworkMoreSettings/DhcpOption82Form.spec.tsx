import '@testing-library/jest-dom'

import { render }       from '@testing-library/react'
import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { DhcpOption82Form } from './DhcpOption82Form'

describe('AccessControlForm', () => {

  it('should render Dhcp Option 82 form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <IntlProvider locale='en'>
        <Form>
          <DhcpOption82Form />
        </Form>
      </IntlProvider>, {
        route: { params }
      })
   expect(await screen.findByText('DHCP Option 82')).toBeVisible()
  })

})
