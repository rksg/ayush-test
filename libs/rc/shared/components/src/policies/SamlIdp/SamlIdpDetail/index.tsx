import { useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import { Space }        from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Button, PageHeader, SummaryCard, Tooltip } from '@acx-ui/components'
import { formatter, DateFormatEnum }                from '@acx-ui/formatter'
import {
  useDownloadSamlServiceProviderMetadataMutation,
  useGetSamlIdpProfileWithRelationsByIdQuery,
  useGetServerCertificatesQuery,
  useRefreshSamlServiceProviderMetadataMutation
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
import { noDataDisplay } from '@acx-ui/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'
import { CertificateInfoItem }              from '../CertificateInfoItem'
import { SamlIdpMetadataModal }             from '../SamlIdpMetadataModal'

import { SamlIdpInstanceTable } from './SamlIdpInstanceTable'

export const SamlIdpDetail = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SAML_IDP)
  const [samlIdpMetadataModalVisible, setSamlIdpMetadataModalVisible] = useState(false)
  const [isSyncingMetadata, setIsSyncingMetadata] = useState(false)
  const { data: samlIdpData } = useGetSamlIdpProfileWithRelationsByIdQuery({
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

  const [ refreshSamlServiceProviderMetadata ] = useRefreshSamlServiceProviderMetadataMutation()

  const handleSyncMetadata = async () => {
    setIsSyncingMetadata(true)
    await refreshSamlServiceProviderMetadata({
      params: { id: samlIdpData?.id },
      payload: {
        action: 'REFRESH_METADATA'
      }
    })
      .unwrap()
      .finally(() => {
        setIsSyncingMetadata(false)
      })
  }

  const samlIdpProfileInfo =[
    {
      title: $t({ defaultMessage: 'Identity Provider (IdP) Metadata' }),
      content: () => {
        return (
          <Space direction='vertical' size={1} style={{ lineHeight: 1 }}>
            <Space size={1}>
              <Button
                type='link'
                size={'small'}
                onClick={() => setSamlIdpMetadataModalVisible(true)}
              >
                {$t({ defaultMessage: 'View Metadata' })}
              </Button>
              {(samlIdpData?.metadataUrl) && (
                <Button
                  data-testid='sync-metadata-button'
                  style={{ borderStyle: 'none' }}
                  icon={<SyncOutlined spin={isSyncingMetadata} />}
                  type='link'
                  onClick={() => handleSyncMetadata()}
                >
                </Button>
              )}
            </Space>
            {(samlIdpData?.metadataUrl) && (
              <span style={{ fontSize: '12px' }}>
                {$t({ defaultMessage: 'Last Update:' })} {
                  (samlIdpData?.updatedData )
                    ? formatter(DateFormatEnum.DateFormat)(
                      samlIdpData?.updatedData
                    )
                    : noDataDisplay
                }
              </span>
            )}
          </Space>
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
    {samlIdpData && (
      <SamlIdpMetadataModal
        samlIdpData={samlIdpData}
        visible={samlIdpMetadataModalVisible}
        setVisible={setSamlIdpMetadataModalVisible}
      />
    )}
  </>
  )
}