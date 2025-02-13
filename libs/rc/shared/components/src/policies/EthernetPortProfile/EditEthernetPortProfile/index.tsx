import { useEffect } from 'react'

import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Loader }                                from '@acx-ui/components'
import {
  useDeleteEthernetPortProfileRadiusIdMutation,
  useGetEthernetPortProfileWithRelationsByIdQuery,
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
    useGetEthernetPortProfileWithRelationsByIdQuery({
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

    if (Boolean(newId)) {
      updateEthernetPortProfileRadiusId({ params: {
        id: ethernetPortId,
        radiusId: newId
      } })

      // If there have newId, then don't need to call delete API avoid race condition
      return
    }

    if (Boolean(oldId)) {
      deleteEthernetPortProfileRadiusId({ params: {
        id: ethernetPortId,
        radiusId: oldId
      } })
    }
  }
  useEffect(() => {
    if(!ethernetPortProfileData) {
      return
    }

    const sourceData = cloneDeep(ethernetPortProfileData) as EthernetPortProfileFormType
    if (sourceData.authType !== EthernetPortAuthType.DISABLED) {
      sourceData.authEnabled = true
      sourceData.accountingEnabled = false
      sourceData.authTypeRole = sourceData.authType

      sourceData.accountingEnabled = Boolean(sourceData.accountingRadiusId)
    }
    form.setFieldsValue(sourceData)

  }, [ethernetPortProfileData])

  return (
    <Loader states={[{ isLoading }]}>
      <EthernetPortProfileForm
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handleEditEthernetPortProfile}
        form={form}
        isEditMode={true}
      />
    </Loader>
  )
}