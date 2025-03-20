import { useState } from 'react'

import { Buffer } from 'buffer'

import {  Col, Form, Row, Button } from 'antd'
import TextArea                    from 'antd/lib/input/TextArea'
import { useIntl }                 from 'react-intl'

import { Drawer }                 from '@acx-ui/components'
import { Modal }                  from '@acx-ui/components'
import {
  useLazyGetSamlIdpProfileByIdQuery,
  useGetServerCertificatesQuery
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

import { AddSamlIdp } from '../AddSamlIdp'



interface IdentityProviderProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  readMode?: boolean
  policy? :SamlIdpProfileViewData
  callbackFn?: (createId: string) => void
}

export function IdentityProviderDrawer (props: IdentityProviderProps) {
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

  const [idpMetadata, setIdpMetadata] = useState('')
  const [idpMetadataModalVisible, setIdpMetadataModalVisible] = useState(false)
  const [lazyGetSamlIdpProfile] = useLazyGetSamlIdpProfileByIdQuery()

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


  const handleDisplayMetadata = async (id:string) => {
    const data = await lazyGetSamlIdpProfile({
      params: { id: id }
    }).unwrap()
    setIdpMetadata(Buffer.from(data?.metadata, 'base64').toString('ascii'))
    setIdpMetadataModalVisible(true)
  }

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
                  onClick={()=>{handleDisplayMetadata(policy.id)}}
                >
                  {$t({ defaultMessage: 'View metadata' })}
                </Button>
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'Require SAML requests to be signed' })}
              children={
                transformDisplayOnOff(policy.authnRequestSignedEnabled)
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'SAML Response Encryption' })}
              children={
                transformDisplayOnOff(policy.responseEncryptionEnabled)
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'Server Certificate' })}
              children={
                (policy.encryptionCertificateId ? '' :
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
                  </TenantLink>
                )
              }
            />
          </Col>
        </Row>
      </Form>
      <Modal
        title={$t({ defaultMessage: 'IdP Metadata' })}
        visible={idpMetadataModalVisible}
        width={800}
        footer={
          <Button
            type='primary'
            onClick={() => {
              setIdpMetadataModalVisible(false)
            }}
          >
            {$t({ defaultMessage: 'OK' })}
          </Button>
        }
      >
        <TextArea
          style={{ width: '100%', height: 500 }}
          value={idpMetadata}
        />
      </Modal>
    </>
  )
}
