import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { useActivateSamlIdpProfileCertificateMutation, useCreateSamlIdpProfileMutation } from '@acx-ui/rc/services'
import { SamlIdpProfileFormType }                                                        from '@acx-ui/rc/utils'

import { SsoSamlForm, requestPreProcess } from '../SsoSamlForm'

interface AddSsoSamlProps {
  isEmbedded?: boolean
  onClose?: ()=>void
  updateInstance?: (createId:string)=>void
}


export const AddSsoSaml = (props: AddSsoSamlProps) => {
  const { $t } = useIntl()
  const [ createSamlIdpProfile ] = useCreateSamlIdpProfileMutation()
  const [ activateCertificate ] = useActivateSamlIdpProfileCertificateMutation()
  const [form] = Form.useForm()
  const { onClose, isEmbedded, updateInstance } = props

  const handleAddSsoSaml = async (data: SamlIdpProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      const createResult =
          await createSamlIdpProfile({ payload }).unwrap()
      const createId = createResult.response?.id
      if (createId) {
        if (payload.responseEncryptionEnabled) {
          activateCertificate({ params: {
            id: createId,
            certificateId: payload.encryptionCertificateId
          } })
        }

        updateInstance?.(createId)
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <Row>
      <Col span={12}>
        <SsoSamlForm
          title={$t({ defaultMessage: 'Add SAML Identity Provider' })}
          form={form}
          submitButtonLabel={$t({ defaultMessage: 'Add' })}
          onFinish={handleAddSsoSaml}
          onCancel={onClose}
          isEmbedded={isEmbedded}
        />
      </Col>
    </Row>
  )
}