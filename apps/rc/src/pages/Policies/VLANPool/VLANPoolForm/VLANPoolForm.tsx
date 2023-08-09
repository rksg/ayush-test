import { useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
import { useGetVLANPoolPolicyDetailQuery, useAddVLANPoolPolicyMutation, useUpdateVLANPoolPolicyMutation } from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import VLANPoolSettingForm from './VLANPoolSettingForm'

type VLANPoolFormProps = {
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: VLANPoolPolicyType) => void
}

const VLANPoolForm = (props: VLANPoolFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const edit = props.edit && !props.networkView
  const formRef = useRef<StepsFormLegacyInstance<VLANPoolPolicyType>>()
  const { data } = useGetVLANPoolPolicyDetailQuery({ params }, { skip: !edit })
  const [ createVLANPoolPolicy ] = useAddVLANPoolPolicyMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
      if (!edit) {
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
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit VLAN Pool' })
          : $t({ defaultMessage: 'Add VLAN Pool' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'VLAN Pools' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'VLAN Pools' }), link: tablePath }
        ]}
      />
      <StepsFormLegacy<VLANPoolPolicyType>
        formRef={formRef}
        onCancel={() => props.networkView? props.backToNetwork?.():navigate(linkToPolicies)}
        onFinish={async (data) => {
          return handleVLANPoolPolicy(data)
        }}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <VLANPoolSettingForm edit={edit}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}

export default VLANPoolForm
