import { useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
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
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplate,
  useAfterPolicySaveRedirectPath
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
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.VLAN_POOL)
  const params = useParams()
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<VLANPoolPolicyType>>()
  const { isTemplate } = useConfigTemplate()
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isPolicyRbacEnabled

  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetVLANPoolPolicyDetailQuery,
    useTemplateQueryFn: useGetVlanPoolPolicyTemplateDetailQuery,
    enableRbac,
    skip: !isEdit
  })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.VLAN_POOL)
  const pageTitle = usePolicyPageHeaderTitle(isEdit, PolicyType.VLAN_POOL)

  const [ createInstance ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddVLANPoolPolicyMutation,
    useTemplateMutationFn: useAddVlanPoolPolicyTemplateMutation
  })
  const [ updateInstance ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateVLANPoolPolicyMutation,
    useTemplateMutationFn: useUpdateVlanPoolPolicyTemplateMutation
  })

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
        await createInstance({ params, payload, enableRbac }
        ).unwrap()
          .then(res => {
            formData.id = res.response?.id
          })
      } else {
        await updateInstance({ params, payload, enableRbac })
          .unwrap()
      }
      networkView ? backToNetwork?.(formData) : navigate(redirectPathAfterSave, { replace: true })
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
