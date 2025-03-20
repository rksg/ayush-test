import { useState } from 'react'

import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader, SummaryCard, Tooltip } from '@acx-ui/components'
import {
  useDownloadSamlServiceProviderMetadataMutation,
  useGetSamlIdpProfileWithRelationsByIdQuery,
  useGetServerCertificatesQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  SamlIdpMessages,
  ServerCertificate,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  usePolicyListBreadcrumb,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'
import { CertificateInfoItem }              from '../CertificateInfoItem'
import { SamlIdpMetadataModal }             from '../SamlIdpMetadataModal'

import { SamlIdpInstanceTable } from './SamlIdpInstanceTable'

export const SamlIdpDetail = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SAML_IDP)
  const [samlIdpMetadataModalVisible, setSamlIdpMetadataModalVisible] = useState(false)
  const { data: samlIdpData } = useGetSamlIdpProfileWithRelationsByIdQuery({
    payload: {
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        id: [policyId]
      }
    },
    params: {
      id: policyId
    }
  })

  const [downloadSamlServiceProviderMetadata] = useDownloadSamlServiceProviderMetadataMutation()

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

  const samlIdpProfileInfo =[
    {
      title: $t({ defaultMessage: 'Identity Provider (IdP) Metadata' }),
      content: () => {
        return (
          <Button
            type='link'
            size={'small'}
            onClick={() => setSamlIdpMetadataModalVisible(true)}
          >
            {$t({ defaultMessage: 'View Metadata' })}
          </Button>
        )
      }
    }, {
      title: $t({ defaultMessage: 'SAML Request Signature' }),
      content: () => {
        return (
          <CertificateInfoItem
            certificateNameMap={certificateNameMap}
            certificatFlag={samlIdpData?.signingCertificateEnabled ?? false}
            certificatId={samlIdpData?.signingCertificateId ?? ''}
          />
        )
      }
    }, {
      title: $t({ defaultMessage: 'SAML Response Encryption' }),
      content: () => {
        return (
          <CertificateInfoItem
            certificateNameMap={certificateNameMap}
            certificatFlag={samlIdpData?.encryptionCertificateEnabled ?? false}
            certificatId={samlIdpData?.encryptionCertificateId ?? ''}
          />
        )
      }
    }
  ]

  return (<>
    <PageHeader
      title={samlIdpData?.name}
      breadcrumb={breadcrumb}
      extra={[
        <Button
          type='primary'
          onClick={() =>
            downloadSamlServiceProviderMetadata({ params: { id: samlIdpData?.id } })
          }
        >
          <Tooltip title={$t(SamlIdpMessages.DOWNLOAD_SAML_METADATA)}>
            {$t({ defaultMessage: 'Download SAML Metadata' })}
          </Tooltip>
        </Button>,
        ...filterByAccessForServicePolicyMutation([
          <PolicyConfigTemplateLinkSwitcher
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
        ])
      ]}
    />
    <Space direction='vertical' size={30}>
      <SummaryCard data={samlIdpProfileInfo} colPerRow={4} />
      <SamlIdpInstanceTable
        networkIds={samlIdpData?.wifiNetworkIds ?? []}
      />
    </Space>
    <SamlIdpMetadataModal
      metadata={samlIdpData?.metadataContent ?? ''}
      visible={samlIdpMetadataModalVisible}
      setVisible={setSamlIdpMetadataModalVisible}
    />
  </>
  )
}