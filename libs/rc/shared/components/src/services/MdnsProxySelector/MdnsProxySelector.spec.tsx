import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import {
  MdnsProxyUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  screen,
  render
}    from '@acx-ui/test-utils'

import { mockedMdnsProxyList } from './__tests__/fixtures'

import { MdnsProxySelector } from '.'

describe('MdnsProxySelector', () => {
  it('should display the corresponding rule table when selected a service', async () => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json([...mockedMdnsProxyList]))
      )
    )

    render(
      <Provider>
        <Form><MdnsProxySelector /></Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    const targetService = mockedMdnsProxyList[0]
    await userEvent.click(await screen.findByRole('combobox', { name: /mDNS Proxy Service/i }))
    await userEvent.click(await screen.findByText(targetService.serviceName))

    expect(await screen.findByRole('row', { name: /AirDisk/ })).toBeVisible()
  })
})
