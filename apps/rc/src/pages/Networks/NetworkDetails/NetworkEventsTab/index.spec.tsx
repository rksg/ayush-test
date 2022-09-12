import '@testing-library/jest-dom'


import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { NetworkEventsTab } from './index'


describe('NetworkEventsTab', () => {
  it('should render network events tab successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkEventsTab />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

})

