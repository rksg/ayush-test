
import { Card, Space } from 'antd'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { Button, PageHeader, SummaryCard }                                           from '@acx-ui/components'
import { useGetSamlIdpProfileWithRelationsByIdQuery, useGetServerCertificatesQuery } from '@acx-ui/rc/services'
import {
  CertificateStatusType,
  PolicyOperation,
  PolicyType,
  ServerCertificate,
  filterByAccessForServicePolicyMutation,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  transformDisplayOnOff,
  usePolicyListBreadcrumb,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'
import { CertificateToolTip }               from '../../AAAUtil'

export const SamlIdpDetail = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SAML_IDP)
  const { data: samlIdpData } = useGetSamlIdpProfileWithRelationsByIdQuery({ id: policyId })

  const { certificateNameMap } = useGetServerCertificatesQuery({
    payload: {
      fields: ['name', 'id', 'status'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }: { data?: { data: ServerCertificate[] } }) => ({
      certificateNameMap: data?.data
        ? data.data.map(cert => ({ key: cert.id, value: cert.name, status: cert.status }))
        : []
    })
  })

  const getCertificateFieldContent = (certificatFlag: boolean, certificatId: string) => {
    let content = transformDisplayOnOff(certificatFlag)

    const serverCert = certificateNameMap.find(
      cert => cert.key === certificatId)

    let certContent = (!certificatId)
      ? ''
      : (<>
        <TenantLink
          to={getPolicyRoutePath({
            type: PolicyType.SERVER_CERTIFICATES,
            oper: PolicyOperation.LIST
          })}>
          {serverCert?.value || ''}
        </TenantLink>
        {serverCert?.status && !serverCert?.status.includes(CertificateStatusType.VALID) ?
          <CertificateToolTip
            placement='bottom'
            policyType={PolicyType.SERVER_CERTIFICATES}
            status={serverCert.status} /> : []}
      </>
      )
    return content + (certContent)? ' (' + certContent + ')' : ''
  }

  const samlIdpProfileInfo =[
    {
      title: $t({ defaultMessage: 'Identity Provider (IdP) Metadata' }),
      content: () => {
        return (
          <Button type='link' size={'small'}>{$t({ defaultMessage: 'View Metadata' })}</Button>
        )
      }
    }, {
      title: $t({ defaultMessage: 'SAML Request Signature' }),
      content: () => {
        return getCertificateFieldContent(
          samlIdpData?.signingCertificateEnabled ?? false,
          samlIdpData?.signingCertificateId ?? ''
        )
      }
    }, {
      title: $t({ defaultMessage: 'SAML Response Encryption' }),
      content: () => {
        return getCertificateFieldContent(
          samlIdpData?.encryptionCertificateEnabled ?? false,
          samlIdpData?.encryptionCertificateId ?? ''
        )
      }
    }
  ]
  return (<>
    <PageHeader
      title={samlIdpData?.name}
      breadcrumb={breadcrumb}
      extra={filterByAccessForServicePolicyMutation([
        <PolicyConfigTemplateLinkSwitcher
          // eslint-disable-next-line max-len
          rbacOpsIds={
            useTemplateAwarePolicyAllowedOperation(PolicyType.SAML_IDP, PolicyOperation.EDIT)
          }
          scopeKey={getScopeKeyByPolicy(PolicyType.SAML_IDP, PolicyOperation.EDIT)}
          type={PolicyType.SAML_IDP}
          oper={PolicyOperation.EDIT}
          policyId={policyId!}
          children={
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          }
        />
      ])}
    />
    <Space direction='vertical' size={30}>
      <SummaryCard data={samlIdpProfileInfo} colPerRow={6} />
      <Card>
        abc
      </Card>
    </Space>
  </>
  )
}