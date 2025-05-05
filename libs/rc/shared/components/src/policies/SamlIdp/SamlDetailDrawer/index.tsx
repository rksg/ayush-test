import { useState } from 'react'

import { Col, Form, Row, Button } from 'antd'
import { useIntl }                from 'react-intl'

import { Drawer }                                  from '@acx-ui/components'
import {
  useGetServerCertificatesQuery,
  useGetSamlIdpProfileWithRelationsByIdQuery,
  useDownloadSamlServiceProviderMetadataMutation
} from '@acx-ui/rc/services'
import {
  ServerCertificate,
  transformDisplayOnOff,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  SamlIdpAttributeMappingNameType
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

import { SamlIdpMetadataModal } from '../SamlIdpMetadataModal'

interface SAMLDetailDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  samlIdpProfileId?: string
}

export function SAMLDetailDrawer (props: SAMLDetailDrawerProps) {
  const {
    visible,
    setVisible,
    samlIdpProfileId
  } = props
  const { $t } = useIntl()
  const [idpMetadataModalVisible, setIdpMetadataModalVisible] = useState(false)

  const handleClose = () => {
    setVisible(false)
  }

  const { data: samlIdpData } = useGetSamlIdpProfileWithRelationsByIdQuery({
    params: {
      id: samlIdpProfileId
    }
  }, {
    skip: !samlIdpProfileId
  })


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


  const [downloadSamlServiceProviderMetadata] = useDownloadSamlServiceProviderMetadataMutation()

  const detailContent = (
    <>
      <Form layout='vertical'>
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item
              label={$t({ defaultMessage: 'Identity Provider (IdP) Metadata' })}
              children={
                <Button
                  data-testid={'display-metadata-button'}
                  style={{ borderStyle: 'none' }}
                  type='link'
                  onClick={()=>{ setIdpMetadataModalVisible(true) }}
                >
                  {$t({ defaultMessage: 'View metadata' })}
                </Button>
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'SAML Request Signature' })}
              children={
                transformDisplayOnOff(samlIdpData?.signingCertificateEnabled ?? false)
              }
            />
            {samlIdpData?.signingCertificateEnabled && (
              <Form.Item
                label={$t({ defaultMessage: 'Signing Certificate' })}
                children={
                  (samlIdpData?.signingCertificateId ?
                    <TenantLink
                      to={getPolicyRoutePath({
                        type: PolicyType.SERVER_CERTIFICATES,
                        oper: PolicyOperation.LIST
                      })}>
                      {
                        certificateNameMap.find(cert => {
                          return cert.key === samlIdpData.signingCertificateId
                        })?.value || ''
                      }
                    </TenantLink> : ''
                  )
                }
              />
            )}
            <Form.Item
              label={$t({ defaultMessage: 'SAML Response Encryption' })}
              children={
                transformDisplayOnOff(samlIdpData?.encryptionCertificateEnabled ?? false)
              }
            />
            {samlIdpData?.encryptionCertificateEnabled && (
              <Form.Item
                label={$t({ defaultMessage: 'Encryption Certificate' })}
                children={
                  (samlIdpData?.encryptionCertificateId ?
                    <TenantLink
                      to={getPolicyRoutePath({
                        type: PolicyType.SERVER_CERTIFICATES,
                        oper: PolicyOperation.LIST
                      })}>
                      {
                        certificateNameMap.find(cert => {
                          return cert.key === samlIdpData?.encryptionCertificateId
                        })?.value || ''
                      }
                    </TenantLink> : ''
                  )
                }
              />
            )}
            <Form.Item
              label={$t({ defaultMessage: 'Identity Name' })}
              children={
                samlIdpData?.attributeMappings?.find(
                  mapping => mapping.name === SamlIdpAttributeMappingNameType.DISPLAY_NAME
                )?.mappedByName || noDataDisplay
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'Identity Email' })}
              children={
                samlIdpData?.attributeMappings?.find(
                  mapping => mapping.name === SamlIdpAttributeMappingNameType.EMAIL
                )?.mappedByName || noDataDisplay
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'Identity Phone' })}
              children={
                samlIdpData?.attributeMappings?.find(
                  mapping => mapping.name === SamlIdpAttributeMappingNameType.PHONE_NUMBER
                )?.mappedByName || noDataDisplay
              }
            />
          </Col>
        </Row>
      </Form>
      {samlIdpData && (
        <SamlIdpMetadataModal
          samlIdpData={samlIdpData}
          visible={idpMetadataModalVisible}
          setVisible={setIdpMetadataModalVisible}
        />
      )}
    </>
  )

  return (
    <Drawer
      title={
        $t(
          { defaultMessage: 'SAML Identity Provider Details: {name}' },
          { name: samlIdpData?.name }
        )
      }
      visible={visible}
      width={450}
      children={detailContent}
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        (
          <>
            <Button
              type='primary'
              disabled={!samlIdpProfileId}
              onClick={
                () => downloadSamlServiceProviderMetadata({ params: { id: samlIdpProfileId } })
              }
            >
              {$t({ defaultMessage: 'Download SAML Metadata' })}
            </Button>
            <Button
              type='primary'
              onClick={() => {
                setVisible(false)
              }}
            >
              {$t({ defaultMessage: 'OK' })}
            </Button>
          </>
        )
      }
    />
  )
}