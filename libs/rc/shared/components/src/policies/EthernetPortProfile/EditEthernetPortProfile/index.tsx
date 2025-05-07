import { useEffect } from 'react'

import { Form }      from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Loader }                                from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import {
  useDeleteEthernetPortProfileRadiusIdMutation,
  useGetEthernetPortProfileTemplateQuery,
  useGetEthernetPortProfileWithRelationsByIdQuery,
  useUpdateEthernetPortProfileMutation,
  useUpdateEthernetPortProfileRadiusIdMutation,
  useUpdateEthernetPortProfileTemplateMutation
} from '@acx-ui/rc/services'
import {
  EthernetPortAuthType,
  EthernetPortProfileFormType,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher
}                                                     from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { EthernetPortProfileForm, requestPreProcess } from '../EthernetPortProfileForm'

export const EditEthernetPortProfile = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const [form] = Form.useForm()

  const isWiredClientVisibilityEnabled = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const { data: ethernetPortProfileData, isLoading } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEthernetPortProfileWithRelationsByIdQuery,
    useTemplateQueryFn: useGetEthernetPortProfileTemplateQuery,
    enableRbac: true,
    extraParams: { id: policyId },
    payload: {
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        id: [policyId]
      }
    }
  })

  const [ updateEthernetPortProfile ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateEthernetPortProfileMutation,
    useTemplateMutationFn: useUpdateEthernetPortProfileTemplateMutation
  })

  const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()
  const [ deleteEthernetPortProfileRadiusId ] = useDeleteEthernetPortProfileRadiusIdMutation()


  const handleEditEthernetPortProfile = async (data: EthernetPortProfileFormType) => {
    try {
      const payload = requestPreProcess(isWiredClientVisibilityEnabled, data)

      await updateEthernetPortProfile({
        payload,
        params: {
          id: ethernetPortProfileData?.id
        }
      }).unwrap()

      if (!isTemplate) {
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
      }
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
      sourceData.authEnabled = sourceData.authType !== EthernetPortAuthType.OPEN
      sourceData.authTypeRole = sourceData.authType

      sourceData.accountingEnabled = !!sourceData.accountingRadiusId
    }
    const forceEnableClientVisibility = sourceData.authType === EthernetPortAuthType.OPEN
    form.setFieldsValue({
      ...sourceData,
      ...(forceEnableClientVisibility && {
        clientVisibilityEnabled: true
      })
    })

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