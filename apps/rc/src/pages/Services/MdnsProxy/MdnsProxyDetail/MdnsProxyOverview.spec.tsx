import { Provider } from '@acx-ui/store'
import {
  render
} from '@acx-ui/test-utils'

import { MdnsProxyOverview } from './MdnsProxyOverview'

describe('MdnsProxyOverview', () => {

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <MdnsProxyOverview data={{ name: '', rules: [] }} />
      </Provider>)

    expect(asFragment()).toMatchSnapshot()
  })

})
