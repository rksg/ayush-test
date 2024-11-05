import { useEffect } from 'react'

import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Loader }                                from '@acx-ui/components'
import {
  useDeleteEthernetPortProfileRadiusIdMutation,
  useGetAAAPolicyListQuery,
  useGetEthernetPortProfileByIdQuery,
  useUpdateEthernetPortProfileMutation,
  useUpdateEthernetPortProfileRadiusIdMutation
} from '@acx-ui/rc/services'
import {
  EthernetPortAuthType,
  EthernetPortProfileFormType
}                                                     from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { EthernetPortProfileForm, requestPreProcess } from '../EthernetPortProfileForm'

export const EditEthernetPortProfile = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [ updateEthernetPortProfile ] = useUpdateEthernetPortProfileMutation()
  const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()
  const [ deleteEthernetPortProfileRadiusId ] = useDeleteEthernetPortProfileRadiusIdMutation()

  const [form] = Form.useForm()

  const { data: ethernetPortProfileData, isLoading } =
    useGetEthernetPortProfileByIdQuery(
      { params: { id: policyId } }
    )

  const { data: aaaRadiusList } = useGetAAAPolicyListQuery(
    { payload: {
      filters: {
        ethernetPortProfileIds: [ethernetPortProfileData?.id]
      }
    } },
    {
      skip: !!!ethernetPortProfileData?.id
    }
  )

  const handleEditEthernetPortProfile = async (data: EthernetPortProfileFormType) => {
    try {
      const payload = requestPreProcess(data)

      await updateEthernetPortProfile({
        payload,
        params: {
          id: ethernetPortProfileData?.id
        }
      }).unwrap()

      handleEthernetPortRadiusId(
        ethernetPortProfileData?.id,
        payload.authRadiusId,
        ethernetPortProfileData?.authRadiusId
      )

      handleEthernetPortRadiusId(
        ethernetPortProfileData?.id,
        payload.accountingRadiusId,
        ethernetPortProfileData?.accountingRadiusId
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  const handleEthernetPortRadiusId = (ethernetPortId?:string, newId?:string, oldId?:string) => {

    if (newId === oldId) {
      return
    }

    if (Boolean(oldId)) {
      deleteEthernetPortProfileRadiusId({ params: {
        id: ethernetPortId,
        radiusId: newId
      } })
    }

    if (Boolean(newId)) {
      updateEthernetPortProfileRadiusId({ params: {
        id: ethernetPortId,
        radiusId: newId
      } })
    }
  }
  useEffect(() => {
    if(!ethernetPortProfileData || !aaaRadiusList) {
      return
    }

    const sourceData = cloneDeep(ethernetPortProfileData) as EthernetPortProfileFormType
    if (sourceData.authType !== EthernetPortAuthType.DISABLED) {
      sourceData.authEnabled = true
      sourceData.accountingEnabled=false
      sourceData.authTypeRole = sourceData.authType

      aaaRadiusList.data.forEach((radius) =>{
        if (radius.type === 'AUTHENTICATION') {
          sourceData.authRadiusId = radius.id
        }

        if (radius.type === 'ACCOUNTING') {
          sourceData.accountingEnabled=true
          sourceData.accountingRadiusId = radius.id
        }
      })
    }
    form.setFieldsValue(sourceData)
  }, [ethernetPortProfileData, aaaRadiusList])

  return (
    <Loader states={[{ isLoading }]}>
      <EthernetPortProfileForm
        title={$t({ defaultMessage: 'Edit Ethernet Port Profile' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handleEditEthernetPortProfile}
        form={form}
        isEditMode={true}
      />
    </Loader>
  )
}