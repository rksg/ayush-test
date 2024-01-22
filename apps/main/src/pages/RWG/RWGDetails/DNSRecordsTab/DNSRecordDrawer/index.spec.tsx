import '@testing-library/jest-dom'

import { initialize } from '@googlemaps/jest-mocks'
import  userEvent     from '@testing-library/user-event'
import { rest }       from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { rwgApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { DNSRecordDrawer } from '.'



const dnsRecord = {
  response: {
    id: '2',
    name: 'wi.fi',
    host: 'test.com',
    ttl: 60,
    dataType: 'AAAA',
    data: 'any-data'
  }
}

const mockFn = jest.fn()
const mockedReqFn =jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

describe('RWGDetails DNS Records Drawer', () => {
  let params: { tenantId: string, gatewayId: string }

  beforeEach(async () => {
    store.dispatch(rwgApi.util.resetApiState())
    initialize()
    mockedReqFn.mockClear()
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDNSRecord.url,
        (req, res, ctx) => {
          mockFn()
          return res(ctx.json(dnsRecord))
        }
      ),
      rest.post(
        CommonUrlsInfo.addUpdateDnsRecord.url,
        (req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json(dnsRecord))
        }
      ),
      rest.delete(
        CommonUrlsInfo.deleteDnsRecords.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      )
    )
    params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      gatewayId: 'bbc41563473348d29a36b76e95c50381'
    }
  })


  it('should draw drawer for DNS Record edit correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const onCloseFn = jest.fn()

    render(<Provider><DNSRecordDrawer
      isEdit={true}
      visible={true}
      onClose={onCloseFn}
      dnsRecordId='2'
    /> </Provider>, {
      route: { params }
    })

    await waitFor(async () => expect(await screen.findByRole('textbox',
      { name: 'DNS Record Name' })).toHaveValue('wi.fi'))

    expect(screen.getByText('Edit DNS Record')).toBeInTheDocument()

    const saveButton = screen.getByRole('button', { name: 'Apply' })
    await userEvent.click(saveButton)

    await waitFor(() => expect(mockedReqFn).toBeCalled())
    await waitFor(() => expect(onCloseFn).toBeCalled())
  })

  it('should draw drawer for DNS Record add correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const onCloseFn = jest.fn()

    render(<Provider><DNSRecordDrawer
      isEdit={false}
      visible={true}
      onClose={onCloseFn}
    /> </Provider>, {
      route: { params }
    })

    expect(screen.getByText('Add DNS Record')).toBeInTheDocument()

    const dnsInput = screen.getByLabelText('DNS Record Name')
    await userEvent.type(dnsInput, 'ruckusdemos1')

    const combo = screen.getByRole('combobox')

    await userEvent.click(combo)
    await waitFor(() =>
      expect(screen.getAllByText('AAAA')[1]).toBeInTheDocument()
    )

    const options = screen.getAllByText('AAAA')

    await userEvent.click(options[1])

    const hostnameInput = screen.getByLabelText('Host')
    await userEvent.type(hostnameInput, 'test.com')
    const dataInput = screen.getByLabelText('Data')
    await userEvent.type(dataInput, 'Temp')

    const ttlInput = screen.getByLabelText('TTL')
    await userEvent.type(ttlInput, '60')

    const saveButton = screen.getByRole('button', { name: 'Add' })

    await userEvent.click(saveButton)

    await waitFor(() => expect(mockedReqFn).toBeCalled())

  })

  it('should close drawer correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const onCloseFn = jest.fn()

    render(<Provider><DNSRecordDrawer
      isEdit={false}
      visible={true}
      onClose={onCloseFn}
    /> </Provider>, {
      route: { params }
    })

    const closeButton = screen.getByRole('button', { name: 'Close' })

    await userEvent.click(closeButton)
    expect(onCloseFn).toBeCalled()
  })

})
