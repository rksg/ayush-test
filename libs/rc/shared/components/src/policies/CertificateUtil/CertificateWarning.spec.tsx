
import { CertificateStatusType } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import { CertificateWarning } from './CertificateWarning'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  TenantLink: (props: { to: string, children: React.ReactNode }) => {
    return <div><span>{props.to}</span><span>{props.children}</span></div>
  }
}))

describe('CertificateWarning', () => {
  it('should render correctly', () => {
    render(<CertificateWarning status={[CertificateStatusType.EXPIRED]}/>)

    expect(screen.getByText(/This certificate has expired/i)).toBeInTheDocument()
  })

  it('should render nothing when status is undefined', () => {
    const { container } = render(<CertificateWarning status={undefined}/>)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render expired warning when status includes EXPIRED', () => {
    render(<CertificateWarning status={[CertificateStatusType.EXPIRED]}/>)
    expect(screen.getByText(/This certificate has expired/i)).toBeInTheDocument()
  })

  it('should render revoked warning when status includes REVOKED', () => {
    render(<CertificateWarning status={[CertificateStatusType.REVOKED]}/>)
    expect(screen.getByText(/This certificate has revoked/i)).toBeInTheDocument()
  })

  it('should render revoked and expired warning when status includes both', () => {
    // eslint-disable-next-line max-len
    render(<CertificateWarning status={[CertificateStatusType.EXPIRED, CertificateStatusType.REVOKED]}/>)
    // eslint-disable-next-line max-len
    expect(screen.getByText(/This certificate has revoked and expired/i)).toBeInTheDocument()
  })

  it('should display correct link text when includeParentLocation is true', () => {
    // eslint-disable-next-line max-len
    render(<CertificateWarning status={[CertificateStatusType.EXPIRED]} includeParentLocation={true} />)
    // eslint-disable-next-line max-len
    expect(screen.getByText(/Certificate Management/i)).toBeInTheDocument()
  })

  it('should display correct link text when includeParentLocation is false', () => {
    // eslint-disable-next-line max-len
    render(<CertificateWarning status={[CertificateStatusType.EXPIRED]} includeParentLocation={false} />)
    expect(screen.queryByText(/Certificate Management/i)).not.toBeInTheDocument()
  })

})
