import { useEffect } from 'react'

import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Loader }                            from '@acx-ui/components'
import {
  useGetIdentityProviderProfileWithRelationsByIdQuery,
  useUpdateIdentityProviderProfileMutation
} from '@acx-ui/rc/services'
import { IdentityProviderProfileFormType } from '@acx-ui/rc/utils'
import { useParams }                       from '@acx-ui/react-router-dom'

import { SsoSamlForm, requestPreProcess } from '../SsoSamlForm'

export const EditSsoSaml = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [ updateIdentityProviderProfile ] = useUpdateIdentityProviderProfileMutation()
  // const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()
  // const [ deleteEthernetPortProfileRadiusId ] = useDeleteEthernetPortProfileRadiusIdMutation()

  const [form] = Form.useForm()

  const { data: identityProviderProfileData, isLoading } =
    useGetIdentityProviderProfileWithRelationsByIdQuery({
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

  const handleEditIdentityProviderProfile = async (data: IdentityProviderProfileFormType) => {
    try {
      const payload = requestPreProcess(data)

      await updateIdentityProviderProfile({
        payload,
        params: {
          id: identityProviderProfileData?.id
        }
      }).unwrap()

      // handleEthernetPortRadiusId(
      //   ethernetPortProfileData?.id,
      //   payload.authRadiusId,
      //   ethernetPortProfileData?.authRadiusId
      // )

      // handleEthernetPortRadiusId(
      //   ethernetPortProfileData?.id,
      //   payload.accountingRadiusId,
      //   ethernetPortProfileData?.accountingRadiusId
      // )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  // const handleEthernetPortRadiusId = (ethernetPortId?:string, newId?:string, oldId?:string) => {

  //   if (newId === oldId) {
  //     return
  //   }

  //   if (Boolean(newId)) {
  //     updateEthernetPortProfileRadiusId({ params: {
  //       id: ethernetPortId,
  //       radiusId: newId
  //     } })

  //     // If there have newId, then don't need to call delete API avoid race condition
  //     return
  //   }

  //   if (Boolean(oldId)) {
  //     deleteEthernetPortProfileRadiusId({ params: {
  //       id: ethernetPortId,
  //       radiusId: oldId
  //     } })
  //   }
  // }

  useEffect(() => {
    if(!identityProviderProfileData) {
      return
    }

    const sourceData = cloneDeep(identityProviderProfileData) as IdentityProviderProfileFormType
    // if (sourceData.authType !== EthernetPortAuthType.DISABLED) {
    //   sourceData.authEnabled = true
    //   sourceData.accountingEnabled = false
    //   sourceData.authTypeRole = sourceData.authType

    //   sourceData.accountingEnabled = Boolean(sourceData.accountingRadiusId)
    // }
    form.setFieldsValue(sourceData)

  }, [identityProviderProfileData])

  return (
    <Loader states={[{ isLoading }]}>
      <SsoSamlForm
        title={$t({ defaultMessage: 'Edit SSO/SAML' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handleEditIdentityProviderProfile}
        form={form}
        isEditMode={true}
      />
    </Loader>
  )
}