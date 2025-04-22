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
  SamlIdpProfileViewData,
  ServerCertificate,
  transformDisplayOnOff,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  SamlIdpAttributeMappingNameType
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

import { AddSamlIdp }           from '../AddSamlIdp'
import { SamlIdpMetadataModal } from '../SamlIdpMetadataModal'


interface SAMLDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  readMode?: boolean
  policy? :SamlIdpProfileViewData
  callbackFn?: (createId: string) => void
}

export function SAMLDrawer (props: SAMLDrawerProps) {
  const {
    visible,
    setVisible,
    readMode = false,
    policy,
    callbackFn
  } = props
  const { $t } = useIntl()

  const handleClose = () => {
    setVisible(false)
  }

  const [downloadSamlServiceProviderMetadata] = useDownloadSamlServiceProviderMetadataMutation()

  return (
    <Drawer
      title={readMode
        ? $t({ defaultMessage: 'SAML Identity Provider Details: {name}' }, { name: policy?.name })
        : $t({ defaultMessage: 'Add SAML Identity Provider' })
      }
      visible={visible}
      width={450}
      children={
        (readMode ? <ReadModeIdpForm policy={policy!} /> :
          <AddSamlIdp
            isEmbedded={true}
            onClose={handleClose}
            updateInstance={callbackFn}
          />
        )
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        (readMode) ? (
          <>
            <Button
              type='primary'
              disabled={!policy?.id}
              onClick={() => downloadSamlServiceProviderMetadata({ params: { id: policy?.id } })}
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
        ) : (
          // Workaround for add a footer to avoid drawer be hide when click outside
          <Button
            type='primary'
            style={{ display: 'none' }}
            onClick={() => {
              setVisible(false)
            }}
          >
            {$t({ defaultMessage: 'OK' })}
          </Button>
        )
      }
    />
  )
}

interface SamlIdpDetailProps {
  policy: SamlIdpProfileViewData
}

const ReadModeIdpForm = ({ policy }: SamlIdpDetailProps) => {
  const { $t } = useIntl()
  const [idpMetadataModalVisible, setIdpMetadataModalVisible] = useState(false)

  const { data: samlIdpData } = useGetSamlIdpProfileWithRelationsByIdQuery({
    params: {
      id: policy.id
    }
  }, {
    skip: !policy.id
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

  return (
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
                transformDisplayOnOff(policy.signingCertificateEnabled)
              }
            />
            {policy.signingCertificateEnabled && (
              <Form.Item
                label={$t({ defaultMessage: 'Signing Certificate' })}
                children={
                  (policy.signingCertificateId ?
                    <TenantLink
                      to={getPolicyRoutePath({
                        type: PolicyType.SERVER_CERTIFICATES,
                        oper: PolicyOperation.LIST
                      })}>
                      {
                        certificateNameMap.find(cert => {
                          return cert.key === policy.signingCertificateId
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
                transformDisplayOnOff(policy.encryptionCertificateEnabled)
              }
            />
            {policy.encryptionCertificateEnabled && (
              <Form.Item
                label={$t({ defaultMessage: 'Encryption Certificate' })}
                children={
                  (policy.encryptionCertificateId ?
                    <TenantLink
                      to={getPolicyRoutePath({
                        type: PolicyType.SERVER_CERTIFICATES,
                        oper: PolicyOperation.LIST
                      })}>
                      {
                        certificateNameMap.find(cert => {
                          return cert.key === policy.encryptionCertificateId
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
}
