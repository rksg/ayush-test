
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'
import { useParams }                                 from 'react-router-dom'

import { SummaryCard }                                                                       from '@acx-ui/components'
import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { useGetCertificateAuthoritiesQuery, useGetCertificateListQuery }                     from '@acx-ui/rc/services'
import { AAAPolicyType, getPolicyRoutePath, PolicyOperation, PolicyType, useConfigTemplate } from '@acx-ui/rc/utils'
import { TenantLink }                                                                        from '@acx-ui/react-router-dom'
const typeDescription: Record<string, MessageDescriptor> = {
  AUTHENTICATION: defineMessage({ defaultMessage: 'Authentication' }),
  ACCOUNTING: defineMessage({ defaultMessage: 'Accounting' })
}
export default function AAAOverview (props: { aaaProfile?: AAAPolicyType }) {
  const { $t } = useIntl()
  const params = useParams()
  const { aaaProfile } = props
  const emptyResult: { key: string, value: string }[] = []

  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate

  const { certificateAuthorityNameMap } = useGetCertificateAuthoritiesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      certificateAuthorityNameMap: data?.data
        ? data.data.map(ca => ({ key: ca.id, value: ca.name }))
        : emptyResult
    })
  })

  const { certificateNameMap } = useGetCertificateListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      certificateNameMap: data?.data
        ? data.data.map(cc => ({ key: cc.id, value: cc.name }))
        : emptyResult
    })
  })

  const aaaInfo = [
    {
      title: $t({ defaultMessage: 'Profile Type' }),
      content: aaaProfile?.type ? $t(typeDescription[aaaProfile.type]) : null
    },
    ...(supportRadsec ?
    // support radsec
      [{
        title: $t({ defaultMessage: 'Primary Server' }),
        content: aaaProfile?.primary?.ip + ':' + aaaProfile?.primary?.port
      },
      {
        title: $t({ defaultMessage: 'Secondary IP Address' }),
        content: aaaProfile?.secondary?.ip + ':' + aaaProfile?.secondary?.port,
        visible: Boolean(aaaProfile?.secondary)
      },
      {
        title: $t({ defaultMessage: 'RadSec' }),
        content: Boolean(aaaProfile?.radSecOptions?.tlsEnabled) ? 'On' : 'Off'
      },
      {
        title: $t({ defaultMessage: 'SAN Identity' }),
        content: aaaProfile?.radSecOptions?.cnSanIdentity,
        visible: Boolean(aaaProfile?.radSecOptions?.tlsEnabled)
      },
      {
        title: $t({ defaultMessage: 'OCSP Validation' }),
        content: aaaProfile?.radSecOptions?.ocspUrl ? 'On' : 'Off',
        visible: Boolean(aaaProfile?.radSecOptions?.tlsEnabled)
      },
      {
        title: $t({ defaultMessage: 'OCSP URL' }),
        content: aaaProfile?.radSecOptions?.ocspUrl,
        visible: (Boolean(aaaProfile?.radSecOptions?.tlsEnabled)
        && Boolean(aaaProfile?.radSecOptions?.ocspUrl))
      },
      {
        title: $t({ defaultMessage: 'Trusted CA' }),
        content: (
          (!aaaProfile?.radSecOptions?.certificateAuthorityId)
            ? '-'
            : (
              <TenantLink to={getPolicyRoutePath({
                type: PolicyType.CERTIFICATE_AUTHORITY,
                oper: PolicyOperation.LIST
              })}>
                {certificateAuthorityNameMap.find(
                  c => c.key === aaaProfile?.radSecOptions?.certificateAuthorityId)?.value || '-'}
              </TenantLink>
            )
        ),
        visible: Boolean(aaaProfile?.radSecOptions?.tlsEnabled)
      },
      {
        title: $t({ defaultMessage: 'Client Certificate' }),
        content: (
          (!aaaProfile?.radSecOptions?.clientCertificateId)
            ? '-'
            : (
              <TenantLink to={getPolicyRoutePath({
                type: PolicyType.CERTIFICATE,
                oper: PolicyOperation.LIST
              })}>
                {certificateNameMap.find(
                  c => c.key === aaaProfile?.radSecOptions?.clientCertificateId)?.value || '-'}
              </TenantLink>
            )
        ),
        visible: Boolean(aaaProfile?.radSecOptions?.tlsEnabled)
      },
      {
        title: $t({ defaultMessage: 'Server Certificate' }),
        content: (
          (!aaaProfile?.radSecOptions?.serverCertificateId)
            ? '-'
            : (
              <TenantLink to={getPolicyRoutePath({
                type: PolicyType.SERVER_CERTIFICATES,
                oper: PolicyOperation.LIST
              })}>
                {certificateNameMap.find(
                  c => c.key === aaaProfile?.radSecOptions?.serverCertificateId)?.value || '-'}
              </TenantLink>
            )
        ),
        visible: Boolean(aaaProfile?.radSecOptions?.tlsEnabled)
      }] :
      // Not support radsec
      [{
        title: $t({ defaultMessage: 'Primary IP Address' }),
        content: aaaProfile?.primary?.ip
      },
      {
        title: $t({ defaultMessage: 'Primary Port' }),
        content: aaaProfile?.primary?.port
      },
      {
        title: $t({ defaultMessage: 'Secondary IP Address' }),
        content: aaaProfile?.secondary?.ip,
        visible: Boolean(aaaProfile?.secondary)
      },
      {
        title: $t({ defaultMessage: 'Secondary Port' }),
        content: aaaProfile?.secondary?.port,
        visible: Boolean(aaaProfile?.secondary)
      }])
  ]

  return <SummaryCard data={aaaInfo} colPerRow={4}/>
}
