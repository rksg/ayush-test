import { useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import { cloneDeep }      from 'lodash'
import { useIntl }        from 'react-intl'

import { Loader }                   from '@acx-ui/components'
import {
  useActivateSamlEncryptionCertificateMutation,
  useActivateSamlSigningCertificateMutation,
  useDeactivateSamlEncryptionCertificateMutation,
  useDeactivateSamlSigningCertificateMutation,
  useGetSamlIdpProfileWithRelationsByIdQuery,
  useUpdateSamlIdpProfileMutation
} from '@acx-ui/rc/services'
import { SamlIdpProfileFormType } from '@acx-ui/rc/utils'
import { useParams }              from '@acx-ui/react-router-dom'

import { SamlIdpForm, requestPreProcess } from '../SamlIdpForm'

export const EditSamlIdp = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [ updateSamlIdpProfile ] = useUpdateSamlIdpProfileMutation()
  const [ activateSamlEncryptionCertificate ] = useActivateSamlEncryptionCertificateMutation()
  const [ deactivateSamlEncryptionCertificate ] = useDeactivateSamlEncryptionCertificateMutation()
  const [ activateSamlSigningCertificate ] = useActivateSamlSigningCertificateMutation()
  const [ deactivateSamlSigningCertificate ] = useDeactivateSamlSigningCertificateMutation()

  const [form] = Form.useForm()

  const { data: samlIdpProfileData, isLoading } =
    useGetSamlIdpProfileWithRelationsByIdQuery({
      params: {
        id: policyId
      }
    })

  const handleEditSamlIdpProfile = async (data: SamlIdpProfileFormType) => {
    try {
      const payload = requestPreProcess(data)

      await updateSamlIdpProfile({
        payload,
        params: {
          id: policyId
        }
      }).unwrap()

      if(samlIdpProfileData?.encryptionCertificateId !== payload.encryptionCertificateId) {
        if(samlIdpProfileData?.encryptionCertificateEnabled ) {
          deactivateSamlEncryptionCertificate({ params: {
            id: policyId,
            certificateId: samlIdpProfileData?.encryptionCertificateId
          } })
        }

        if(payload.encryptionCertificateEnabled) {
          activateSamlEncryptionCertificate({ params: {
            id: policyId,
            certificateId: payload.encryptionCertificateId
          } })
        }
      }

      if(samlIdpProfileData?.signingCertificateId !== payload.signingCertificateId) {
        if(samlIdpProfileData?.signingCertificateEnabled) {
          deactivateSamlSigningCertificate({ params: {
            id: policyId,
            certificateId: samlIdpProfileData?.signingCertificateId
          } })
        }

        if(payload.signingCertificateEnabled) {
          activateSamlSigningCertificate({ params: {
            id: policyId,
            certificateId: payload.signingCertificateId
          } })
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  useEffect(() => {
    if(!samlIdpProfileData) {
      return
    }
    const sourceData = cloneDeep(samlIdpProfileData) as SamlIdpProfileFormType
    form.setFieldsValue(sourceData)
    if (sourceData.metadataUrl) {
      form.setFieldValue('metadataContent', sourceData.metadataUrl)
    }

  }, [samlIdpProfileData])

  return (
    <Loader states={[{ isLoading }]}>
      <Row>
        <Col span={12}>
          <SamlIdpForm
            title={$t({ defaultMessage: 'Edit SAML Identity Provider' })}
            submitButtonLabel={$t({ defaultMessage: 'Apply' })}
            onFinish={handleEditSamlIdpProfile}
            form={form}
            isEditMode={true}
          />
        </Col>
      </Row>
    </Loader>
  )
}