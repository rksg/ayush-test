import { useGetDpskQuery, useLazyNetworkListQuery } from '@acx-ui/rc/services'
import { DpskAction }                               from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { fireEvent, render, screen }                from '@acx-ui/test-utils'


import { DpskActionPreview } from './DpskActionPreview'

const mockUseGetDpskQuery = useGetDpskQuery as jest.Mock
const mockUseLazyNetworkListQuery = useLazyNetworkListQuery as jest.Mock


jest.mock('@acx-ui/rc/services')

describe('DpskActionPreview', () => {
  beforeEach( () => {
    mockUseGetDpskQuery.mockReturnValue({ data: { networkIds: ['1', '2'] } })
    mockUseLazyNetworkListQuery.mockReturnValue([
      jest.fn(),
      ['Network1', 'Network2']
    ])
  })

  it('renders network list when multiple networks are available', () => {
    render(<Provider>
      <DpskActionPreview data={{ dpskPoolId: '123' } as DpskAction} />
    </Provider>)
    expect(screen.getByText('Select a network to connect:')).toBeInTheDocument()
    expect(screen.getByText('Network1')).toBeInTheDocument()
    expect(screen.getByText('Network2')).toBeInTheDocument()
  })

  it('renders QR code when a network is selected', () => {
    render(<Provider>
      <DpskActionPreview data={{ dpskPoolId: '123' } as DpskAction} />
    </Provider>)
    fireEvent.click(screen.getAllByText('Connect', { selector: 'a' })[0])
    expect(screen.getByText('Connect to the network:')).toBeInTheDocument()
    expect(screen.getByText('Network1')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Scan or click this QR code to connect to the network:')).toBeInTheDocument()
  })

  it('renders personal password', () => {
    render(<Provider>
      <DpskActionPreview data={{ dpskPoolId: '123' } as DpskAction} />
    </Provider>)
    expect(screen.getByText('Personal password:')).toBeInTheDocument()
    expect(screen.getByText('$aMgj23Klpz')).toBeInTheDocument()
  })

  it('handles single network selection automatically', () => {
    mockUseLazyNetworkListQuery.mockReturnValue([
      jest.fn(),
      ['SingleNetwork']
    ])
    render(<DpskActionPreview data={{ dpskPoolId: '123' } as DpskAction} />)
    expect(screen.getByText('Connect to the network:')).toBeInTheDocument()
    expect(screen.getByText('SingleNetwork')).toBeInTheDocument()
  })
})
