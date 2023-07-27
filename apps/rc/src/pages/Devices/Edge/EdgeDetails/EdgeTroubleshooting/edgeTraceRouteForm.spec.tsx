import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                          from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { EdgeTraceRouteForm } from './edgeTraceRouteForm'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useParams: () => ({ tenantId: 'tenant-id', serialNumber: 'serial-number' })
}))

const traceRouteResponse = {
  requestId: '2261f786-45b4-48c1-887d-7b13f3a4fb9f',
  response:
    { response: 'traceroute to 1.1.1.1 (1.1.1.1)' }
}

describe('EdgeTraceRouteForm', () => {

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.traceRouteEdge.url,
        (_, res, ctx) => res(ctx.json(traceRouteResponse)))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><EdgeTraceRouteForm /></Provider>)
    expect(screen.getByRole('textbox', { name: /target host or ip address/i })).toBeVisible()
  })

  it('should run validation correctly', async () => {
    render(
      <Provider>
        <EdgeTraceRouteForm />
      </Provider>)

    const ipAddressField = screen.getByRole('textbox', {
      name: /target host or ip address/i
    })
    fireEvent.change(ipAddressField, { target: { value: 'edge group' } })
    expect(await screen.findByText('Please enter valid target host or IP address')).toBeVisible()
  })

  it('should run trace route correctly', async () => {
    render(
      <Provider>
        <EdgeTraceRouteForm />
      </Provider>, { route: { params } })

    const ipAddressField = screen.getByRole('textbox', {
      name: /target host or ip address/i
    })
    fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
    expect(await screen.findByText('traceroute to 1.1.1.1 (1.1.1.1)')).toBeVisible()
  })
})
