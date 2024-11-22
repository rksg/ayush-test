import { CertificateStatusType } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import { CertificateToolTip } from './CertificateToolTip'

describe('CertificateToolTip', () => {
  it('should visible render correctly', async () => {
    render(<CertificateToolTip status={[CertificateStatusType.EXPIRED]}/>)
    const icon = await screen.findByTestId('WarningCircleSolid')
    expect(icon).toBeVisible()
  })

  it('should invisible render correctly', async () => {
    render(<CertificateToolTip status={[CertificateStatusType.EXPIRED]}/>)
    expect(screen.queryByTestId('tooltip-button')).toBeNull()
  })

})
