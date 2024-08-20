import { rest } from 'msw'

import { useGetDpskQuery, useLazyNetworkListQuery }    from '@acx-ui/rc/services'
import { CommonUrlsInfo, DpskActionContext, DpskUrls } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, fireEvent }       from '@acx-ui/test-utils'


import { DpskActionPreview } from './DpskActionPreview'
const mockUseGetDpskQuery = useGetDpskQuery as jest.Mock
const mockUseLazyNetworkListQuery = useLazyNetworkListQuery as jest.Mock


jest.mock('@acx-ui/rc/services')

describe('DpskActionPreview', () => {
  beforeEach( () => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({
          id: '12345',
          name: 'DPSK Service'
        }))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (req, res, ctx) =>
        res(ctx.json({
          fields: ['name', 'id', 'defaultGuestCountry'],
          totalCount: 2,
          page: 1,
          data: [{ ssid: 'Network1' }, { ssid: 'Network2' }]
        }))
      )
    )
    mockUseGetDpskQuery.mockReturnValue({ data: { networkIds: ['1', '2'] } })
    mockUseLazyNetworkListQuery.mockReturnValue([
      jest.fn(),
      ['Network1', 'Network2']
    ])
  })

  it('renders network list when multiple networks are available', () => {
    render(<Provider>
      <DpskActionPreview data={{ dpskPoolId: '123' } as DpskActionContext} />
    </Provider>)
    expect(screen.getByText('Select a network to connect:')).toBeInTheDocument()
    expect(screen.getByText('Network1')).toBeInTheDocument()
    expect(screen.getByText('Network2')).toBeInTheDocument()
  })

  it('renders QR code when a network is selected', () => {
    render(<Provider>
      <DpskActionPreview data={{ dpskPoolId: '123' } as DpskActionContext} />
    </Provider>)
    fireEvent.click(screen.getAllByText('Connect', { selector: 'a' })[0])
    expect(screen.getByText('Connect to the network:')).toBeInTheDocument()
    expect(screen.getByText('Network1')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Scan or click this QR code to connect to the network:')).toBeInTheDocument()
  })

  it('renders personal password', () => {
    render(<Provider>
      <DpskActionPreview data={{ dpskPoolId: '123' } as DpskActionContext} />
    </Provider>)
    expect(screen.getByText('Personal password:')).toBeInTheDocument()
    expect(screen.getByText('$aMgj23Klpz')).toBeInTheDocument()
  })

  it('handles single network selection automatically', () => {
    mockUseLazyNetworkListQuery.mockReturnValue([
      jest.fn(),
      ['SingleNetwork']
    ])
    render(<DpskActionPreview data={{ dpskPoolId: '123' } as DpskActionContext} />)
    expect(screen.getByText('Connect to the network:')).toBeInTheDocument()
    expect(screen.getByText('SingleNetwork')).toBeInTheDocument()
  })
})
