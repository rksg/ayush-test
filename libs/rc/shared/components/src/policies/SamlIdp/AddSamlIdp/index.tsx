import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { useActivateSamlIdpProfileCertificateMutation, useCreateSamlIdpProfileMutation } from '@acx-ui/rc/services'
import { SamlIdpProfileFormType }                                                        from '@acx-ui/rc/utils'

import { SamlIdpForm, requestPreProcess } from '../SamlIdpForm'

interface AddSamlIdpProps {
  isEmbedded?: boolean
  onClose?: ()=>void
  updateInstance?: (createId:string)=>void
}

export const AddSamlIdp = (props: AddSamlIdpProps) => {
  const { $t } = useIntl()
  const [ createSamlIdpProfile ] = useCreateSamlIdpProfileMutation()
  const [ activateCertificate ] = useActivateSamlIdpProfileCertificateMutation()
  const [form] = Form.useForm()
  const { onClose, isEmbedded, updateInstance } = props

  const handleAddSamlIdp = async (data: SamlIdpProfileFormType) => {
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
      <Col span={isEmbedded? 24: 12}>
        <SamlIdpForm
          title={$t({ defaultMessage: 'Add SAML Identity Provider' })}
          form={form}
          submitButtonLabel={$t({ defaultMessage: 'Add' })}
          onFinish={handleAddSamlIdp}
          onCancel={onClose}
          isEmbedded={isEmbedded}
        />
      </Col>
    </Row>
  )
}
