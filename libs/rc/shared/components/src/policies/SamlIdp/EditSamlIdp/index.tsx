import { useEffect } from 'react'

import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Loader }                   from '@acx-ui/components'
import {
  useActivateSamlIdpProfileCertificateMutation,
  useDeactivateSamlIdpProfileCertificateMutation,
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
  const [ activateCertificate ] = useActivateSamlIdpProfileCertificateMutation()
  const [ deactivateCertificate ] = useDeactivateSamlIdpProfileCertificateMutation()

  const [form] = Form.useForm()

  const { data: samlIdpProfileData, isLoading } =
    useGetSamlIdpProfileWithRelationsByIdQuery({
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

  const handleEditSamlIdpProfile = async (data: SamlIdpProfileFormType) => {
    try {
      const payload = requestPreProcess(data)

      await updateSamlIdpProfile({
        payload,
        params: {
          id: policyId
        }
      }).unwrap()

      if(samlIdpProfileData?.responseEncryptionEnabled &&
        samlIdpProfileData.encryptionCertificateId !== payload.encryptionCertificateId) {
        deactivateCertificate({ params: {
          id: policyId,
          certificateId: samlIdpProfileData?.encryptionCertificateId
        } })
      }

      if(payload.responseEncryptionEnabled) {
        activateCertificate({ params: {
          id: policyId,
          certificateId: payload.encryptionCertificateId
        } })
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

    sourceData.metadata = Buffer.from(samlIdpProfileData.metadata, 'base64').toString('ascii')

    form.setFieldsValue(sourceData)

  }, [samlIdpProfileData])

  return (
    <Loader states={[{ isLoading }]}>
      <SamlIdpForm
        title={$t({ defaultMessage: 'Edit SAML Identity Provider' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handleEditSamlIdpProfile}
        form={form}
        isEditMode={true}
      />
    </Loader>
  )
}