import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import {
  MdnsProxyFeatureTypeEnum
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { mockedMdnsProxyList } from './__tests__/fixtures'
import { MdnsProxySelector }   from './MdnsProxySelector'

describe('MdnsProxySelector', () => {
  it('should display the corresponding rule table when selected a service', async () => {

    render(
      <Provider>
        <Form><MdnsProxySelector
          mdnsProxyList={mockedMdnsProxyList}
          featureType={MdnsProxyFeatureTypeEnum.WIFI}
        /></Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    const targetService = mockedMdnsProxyList[0]
    await userEvent.click(await screen.findByRole('combobox', { name: /mDNS Proxy Service/i }))
    await userEvent.click(await screen.findByText(targetService.name))

    expect(await screen.findByRole('row', { name: /AirDisk/ })).toBeVisible()
  })
})
