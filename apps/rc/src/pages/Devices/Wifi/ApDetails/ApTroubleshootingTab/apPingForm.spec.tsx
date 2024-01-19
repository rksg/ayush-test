import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { WifiUrlsInfo }                          from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { ApPingForm } from './apPingForm'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params
}))

const pingResponse = {
  requestId: '2261f786-45b4-48c1-887d-7b13f3a4fb9f',
  response:
    { response: 'PING 1.1.1.1 (1.1.1.1)' }
}

describe('ApPingForm', () => {

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.patch(
        WifiUrlsInfo.pingAp.url,
        (_, res, ctx) => res(ctx.json(pingResponse)))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><ApPingForm /></Provider>, { route: { params } })
    expect(screen.getByRole('textbox', { name: /target host or ip address/i })).toBeVisible()
  })

  it('should run validation correctly', async () => {
    render(
      <Provider>
        <ApPingForm />
      </Provider>, { route: { params } })

    const ipAddressField = screen.getByRole('textbox', {
      name: /target host or ip address/i
    })
    fireEvent.change(ipAddressField, { target: { value: 'ap group' } })
    expect(await screen.findByText('Please enter valid target host or IP address')).toBeVisible()
  })

  it('should run ping correctly', async () => {
    render(
      <Provider>
        <ApPingForm />
      </Provider>, { route: { params } })

    const ipAddressField = screen.getByRole('textbox', {
      name: /target host or ip address/i
    })
    fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
    expect(await screen.findByText('PING 1.1.1.1 (1.1.1.1)')).toBeVisible()
  })
})
