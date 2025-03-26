import { useState } from 'react'

import {  Col, Form, Row, Button } from 'antd'
import { useIntl }                 from 'react-intl'

import { Drawer }                              from '@acx-ui/components'
import {
  useGetServerCertificatesQuery,
  useGetSamlIdpProfileWithRelationsByIdQuery
} from '@acx-ui/rc/services'
import {
  SamlIdpProfileViewData,
  ServerCertificate,
  transformDisplayOnOff,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

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

  return (
    <Drawer
      title={readMode
        ? $t({ defaultMessage: 'SAML Identity Provider Details: {name}' }, { name: policy?.name })
        : $t({ defaultMessage: 'Add SAML Identity Provider' })
      }
      visible={visible}
      width={450}
      children={
        visible &&
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
    payload: {
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        id: [policy.id]
      }
    },
    params: {
      id: policy.id
    }
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
            <Form.Item
              label={$t({ defaultMessage: 'SAML Response Encryption' })}
              children={
                transformDisplayOnOff(policy.encryptionCertificateEnabled)
              }
            />
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
          </Col>
        </Row>
      </Form>
      <SamlIdpMetadataModal
        metadata={samlIdpData?.metadataContent ?? ''}
        visible={idpMetadataModalVisible}
        setVisible={setIdpMetadataModalVisible}
      />
    </>
  )
}
