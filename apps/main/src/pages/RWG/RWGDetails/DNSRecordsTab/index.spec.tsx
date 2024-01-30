import '@testing-library/jest-dom'

import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within } from '@acx-ui/test-utils'

import { DNSRecordsTab } from '.'


const dnsRecords = {
  requestId: 'c6852008-0142-439a-aed9-a931b120a6df',
  response: [
    {
      id: '2',
      name: 'wi.fi',
      host: 'wi.fi',
      ttl: 60,
      dataType: 'A',
      data: null
    },
    {
      id: '3',
      name: 'rxg.local',
      host: 'rxg.local',
      ttl: 60,
      dataType: 'A',
      data: null
    },
    {
      id: '4',
      name: 'rg.net',
      host: 'rg.net',
      ttl: 60,
      dataType: 'A',
      data: null
    },
    {
      id: '5',
      name: 'RWG Fleet Manager',
      host: 'fmrwg-vpoc.ruckusdemos.net',
      ttl: 60,
      dataType: 'A',
      data: '192.168.11.10'
    }
  ]
}

const mockedReqFn =jest.fn()

describe('RWGDetails DNS Records', () => {

  let params: { tenantId: string, gatewayId: string }
  beforeEach(async () => {
    mockedReqFn.mockClear()
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDNSRecords.url,
        (req, res, ctx) => res(ctx.json(dnsRecords))
      ),
      rest.get(
        CommonUrlsInfo.getDNSRecord.url,
        (req, res, ctx) => res(ctx.json(dnsRecords.response[0]))
      ),
      rest.post(
        CommonUrlsInfo.addUpdateDnsRecord.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.delete(
        CommonUrlsInfo.deleteDnsRecords.url,
        (req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
        }
      )
    )
    params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381'
    }
  })

  it('should render DNS Records tab correctly', async () => {

    render(<Provider><DNSRecordsTab /> </Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/dnsRecords' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Add DNS Record')).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'close-circle' }))
  })

  it('should add new dns record', async () => {

    render(<Provider><DNSRecordsTab /> </Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/dnsRecords' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const addBtn = await screen.findByRole('button', { name: 'Add DNS Record' })

    fireEvent.click(addBtn)

    expect(await screen.findByText('DNS Record Name')).toBeInTheDocument()

  })

  it('should delete selected row', async () => {
    render(<Provider><DNSRecordsTab /> </Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/dnsRecords' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /wi.fi/i })
    await userEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    await screen.findByText('Delete "wi.fi"?')
    const deleteGatewayButton = await screen.findByText('Delete DNS Record')
    await userEvent.click(deleteGatewayButton)

    await waitFor(() => expect(mockedReqFn).toBeCalled())

    await waitFor( async () =>
      expect(await screen.findByText('Delete DNS Record')).not.toBeInTheDocument())
  })

  it('should edit selected row', async () => {
    render(<Provider><DNSRecordsTab /> </Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/ruckus-wan-gateway/:gatewayId/gateway-details/dnsRecords' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /wi.fi/i })

    await userEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /edit/i })

    await userEvent.click(editButton)

    await screen.findByText('Edit DNS Record')
    const editDNSButton = await screen.findByText('Apply')

    await userEvent.click(editDNSButton)

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loading' })[0])
  })

})
