import { useGetCertificateTemplateQuery, useLazyNetworkListQuery } from '@acx-ui/rc/services'
import { CertTempActionContext }                                   from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { render, screen }                                          from '@acx-ui/test-utils'


import { CertTemplateActionPreview } from './CertTemplateActionPreview'

const mockGetCertificateTemplateQuery = useGetCertificateTemplateQuery as jest.Mock
const mockUseLazyNetworkListQuery = useLazyNetworkListQuery as jest.Mock


jest.mock('@acx-ui/rc/services')

describe('CertTemplateActionPreview', () => {
  beforeEach( () => {
    mockGetCertificateTemplateQuery.mockReturnValue({ data: { networkIds: ['1', '2'] } })
    mockUseLazyNetworkListQuery.mockReturnValue([
      jest.fn(),
      ['Network1', 'Network2']
    ])
  })

  it('renders network list when multiple networks are available', () => {
    render(<Provider>
      <CertTemplateActionPreview data={{ certTemplateId: '123' } as CertTempActionContext} />
    </Provider>)
    expect(screen
      .getByText('Install certificate in order to connect to the following networks:'))
      .toBeInTheDocument()
    expect(screen.getByText('Network1')).toBeInTheDocument()
    expect(screen.getByText('Network2')).toBeInTheDocument()
    expect(screen
      // eslint-disable-next-line max-len
      .getByText('Scan or click the QR code to download the certificate:'))
      .toBeInTheDocument()
  })

  it('handles single network selection automatically', () => {
    mockUseLazyNetworkListQuery.mockReturnValue([
      jest.fn(),
      ['SingleNetwork']
    ])
    render(<CertTemplateActionPreview data={{ certTemplateId: '123' } as CertTempActionContext} />)
    expect(screen.getByText('Connect to the network')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi Network name: SingleNetwork')).toBeInTheDocument()
    expect(screen
    // eslint-disable-next-line max-len
      .getByText('Scan or click this QR code to download the certificate that is required in order to connect to the network:'))
      .toBeInTheDocument()
  })
})
