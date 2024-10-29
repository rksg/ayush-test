import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { MdnsProxyServiceInfo } from './'

describe('MdnsProxyServiceInfo', () => {

  it('should render table', async () => {
    render(
      <Provider>
        <MdnsProxyServiceInfo rules={[]} />
      </Provider>)
    expect(await screen.findByText('Forwarding Rules')).toBeInTheDocument()
  })

})
