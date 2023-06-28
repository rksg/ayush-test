import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { MdnsProxyOverview } from './MdnsProxyOverview'


describe('MdnsProxyOverview', () => {

  it('should render table', async () => {
    render(
      <Provider>
        <MdnsProxyOverview data={{ name: '', rules: [] }} />
      </Provider>)
    expect(await screen.findByText('Forwarding Rules')).toBeInTheDocument()
  })

})
