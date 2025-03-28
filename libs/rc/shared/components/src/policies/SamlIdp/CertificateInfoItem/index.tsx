import { FormattedMessage } from 'react-intl'

import {
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  CertificateStatusType,
  transformDisplayOnOff
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { CertificateToolTip } from '../../CertificateUtil'

interface CertificateInfoItemProps {
    certificateNameMap: { key: string, value: string, status: CertificateStatusType[] }[],
    certificatFlag: boolean,
    certificatId?: string
}


export const CertificateInfoItem = (props: CertificateInfoItemProps) => {
  const { certificateNameMap, certificatFlag, certificatId } = props

  const serverCert = certificateNameMap.find(
    cert => cert.key === certificatId)

  const certContent = serverCert ? (
    <FormattedMessage
      defaultMessage={'({certificatLink}){toolTip}'}
      values={{
        certificatLink:
          <TenantLink
            to={getPolicyRoutePath({
              type: PolicyType.SERVER_CERTIFICATES,
              oper: PolicyOperation.LIST
            })}>
            {serverCert.value}
          </TenantLink>
        ,
        // eslint-disable-next-line max-len
        toolTip: (serverCert.status && !serverCert.status.includes(CertificateStatusType.VALID)) ?
          <CertificateToolTip
            placement='bottom'
            policyType={PolicyType.SERVER_CERTIFICATES}
            status={serverCert.status} /> : null
      }}
    />
  )
    : null

  return (
    <span>
      {transformDisplayOnOff(certificatFlag)}&nbsp;
      {certContent}
    </span>
  )
}