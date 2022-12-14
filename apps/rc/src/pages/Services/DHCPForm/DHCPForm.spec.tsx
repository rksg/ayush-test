import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved,
  fireEvent } from '@acx-ui/test-utils'

import DHCPForm from './DHCPForm'

export const successResponse = { requestId: 'request-id' }


async function fillInBeforeSettings (dhcpName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: dhcpName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
}

describe('DHCPForm', () => {
  it('should create DHCP successfully', async () => {

    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        CommonUrlsInfo.addDHCPService.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))
      ))



    const params = { serviceId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fillInBeforeSettings('DhcpConfigServiceProfile1')

    await screen.findByRole('heading', { level: 1, name: 'Add DHCP for Wi-Fi Service' })

    await userEvent.click(screen.getByRole('radio',{ name: /Simple DHCP/ } ) )

    expect(asFragment()).toMatchSnapshot()

    await userEvent.click(screen.getByText('Finish'))


  }, 25000)
})
