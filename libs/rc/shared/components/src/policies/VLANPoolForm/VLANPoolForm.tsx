import { useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import {
  useGetVLANPoolPolicyDetailQuery, useAddVLANPoolPolicyMutation,
  useUpdateVLANPoolPolicyMutation, useAddVlanPoolPolicyTemplateMutation,
  useUpdateVlanPoolPolicyTemplateMutation, useGetVlanPoolPolicyTemplateDetailQuery
} from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
  PolicyType,
  PolicyOperation,
  usePolicyPageHeaderTitle,
  usePolicyListBreadcrumb,
  usePolicyPreviousPath,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import VLANPoolSettingForm from './VLANPoolSettingForm'

type VLANPoolFormProps = {
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: VLANPoolPolicyType) => void
}

export const VLANPoolForm = (props: VLANPoolFormProps) => {
  const { edit, networkView, backToNetwork } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.VLAN_POOL, PolicyOperation.LIST)
  const params = useParams()
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<VLANPoolPolicyType>>()
  const { data } = useConfigTemplateQueryFnSwitcher(
    useGetVLANPoolPolicyDetailQuery,
    useGetVlanPoolPolicyTemplateDetailQuery,
    !isEdit
  )
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.VLAN_POOL)
  const pageTitle = usePolicyPageHeaderTitle(isEdit, PolicyType.VLAN_POOL)
  // eslint-disable-next-line max-len
  const [ createInstance ] = useConfigTemplateMutationFnSwitcher(useAddVLANPoolPolicyMutation, useAddVlanPoolPolicyTemplateMutation)
  // eslint-disable-next-line max-len
  const [ updateInstance ] = useConfigTemplateMutationFnSwitcher(useUpdateVLANPoolPolicyMutation, useUpdateVlanPoolPolicyTemplateMutation)

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const handleVLANPoolPolicy = async (formData: VLANPoolPolicyType) => {
    const payload = {
      ...formData,
      vlanMembers: (formData.vlanMembers as string).split(',')
    }

    try {
      if (!isEdit) {
        await createInstance({ params, payload }).unwrap().then(res => {
          formData.id = res.response?.id
        })
      } else {
        await updateInstance({ params, payload }).unwrap()
      }
      networkView ? backToNetwork?.(formData) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    networkView ? backToNetwork?.() : navigate(linkToInstanceList)
  }

  return (
    <>
      {!networkView &&<PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<VLANPoolPolicyType>
        formRef={formRef}
        editMode={isEdit}
        onCancel={onCancel}
        onFinish={async (data) => {
          return handleVLANPoolPolicy(data)
        }}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <VLANPoolSettingForm edit={isEdit} networkView={networkView}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
