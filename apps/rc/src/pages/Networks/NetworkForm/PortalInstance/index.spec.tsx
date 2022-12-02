
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  portalList
} from '../__tests__/fixtures'

import PortalInstance from '.'

describe('Portal Instance Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalProfileList.url,
        (req, res, ctx) => res(ctx.json(portalList))
      )
    )
  })

  it('should render instance page', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(<Provider><Form><PortalInstance/></Form></Provider>,
      {
        route: { params }
      })
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.click(await screen.findByText('Cancel'))
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByTitle('test2'))
  })
})
