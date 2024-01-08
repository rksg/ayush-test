import { useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { useGetVLANPoolPolicyDetailQuery, useAddVLANPoolPolicyMutation, useUpdateVLANPoolPolicyMutation } from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  generatePolicyPageHeaderTitle,
  usePolicyBreadcrumb
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import VLANPoolSettingForm from './VLANPoolSettingForm'

type VLANPoolFormProps = {
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: VLANPoolPolicyType) => void
}

export const VLANPoolForm = (props: VLANPoolFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const isEdit = props.edit && !props.networkView
  const formRef = useRef<StepsFormLegacyInstance<VLANPoolPolicyType>>()
  const { data } = useGetVLANPoolPolicyDetailQuery({ params }, { skip: !isEdit })
  const breadcrumb = usePolicyBreadcrumb(PolicyType.VLAN_POOL, PolicyOperation.LIST)
  const [ createVLANPoolPolicy ] = useAddVLANPoolPolicyMutation()

  const [ updateVLANPoolPolicy ] = useUpdateVLANPoolPolicyMutation()

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const handleVLANPoolPolicy = async (formData: VLANPoolPolicyType) => {
    try {
      if (!isEdit) {
        await createVLANPoolPolicy({
          params,
          payload: formData
        }).unwrap().then((res)=>{
          formData.id = res.response?.id
        })
      } else {
        await updateVLANPoolPolicy({
          params,
          payload: formData
        }).unwrap()
      }
      props.networkView ? props.backToNetwork?.(formData)
        : navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  return (
    <>
      {!props.networkView &&<PageHeader
        title={generatePolicyPageHeaderTitle(isEdit, false, PolicyType.VLAN_POOL)}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<VLANPoolPolicyType>
        formRef={formRef}
        editMode={isEdit}
        onCancel={() => props.networkView? props.backToNetwork?.():navigate(linkToPolicies)}
        onFinish={async (data) => {
          return handleVLANPoolPolicy(data)
        }}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <VLANPoolSettingForm edit={isEdit} networkView={props.networkView}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
