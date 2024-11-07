
import { useIntl } from 'react-intl'

import { CertificateStatusType, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                                                             from '@acx-ui/react-router-dom'

export type CertificateWarningProps = {
  status: CertificateStatusType[]
}

export const CertificateWarning = (props: CertificateWarningProps) => {
  const { $t } = useIntl()
  const getCertStatus = (status: CertificateStatusType[]) => {
    const isExpired = status.find(s => s === CertificateStatusType.EXPIRED)
    const isRevoked = status.find(s => s === CertificateStatusType.REVOKED)
    if (isExpired && isRevoked) {
      return 'revoked and expired'
    } else if (isExpired) {
      return 'expired'
    } else if (isRevoked) {
      return 'revoked'
    }
    return ''
  }

  const warningMsg = <>
    {$t(
      { defaultMessage: 'This certificate has {status}. Please go to {redirectLink} to renew it.' },
      {
        redirectLink: <TenantLink
          to={getPolicyRoutePath({
            type: PolicyType.CERTIFICATE,
            oper: PolicyOperation.LIST
          })}
          children={$t({ defaultMessage: 'Server & Client Certificates' })}/>,
        status: getCertStatus(props.status)
      }
    )}
  </>

  return <div>{warningMsg}</div>
}