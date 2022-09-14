import '@testing-library/jest-dom'


import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { NetworkIncidentsTab } from './index'


describe('NetworkIncidentsTab', () => {
  it('should render network incidents tab successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkIncidentsTab />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

})

