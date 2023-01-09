import { useRef, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useVLANPoolPolicyQuery, useAddVLANPoolPolicyMutation, useUpdateVLANPoolPolicyMutation } from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
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
  const linkToPolicies = useTenantLink(getPolicyListRoutePath())
  const params = useParams()
  const edit = props.edit && !props.networkView
  const formRef = useRef<StepsFormInstance<VLANPoolPolicyType>>()
  const { data } = useVLANPoolPolicyQuery({ params })
  const [ createVLANPoolPolicy ] = useAddVLANPoolPolicyMutation()

  const [ updateVLANPoolPolicy ] = useUpdateVLANPoolPolicyMutation()
  const [saveState, updateSaveState] = useState<VLANPoolPolicyType>({
    policyName: '',
    vlans: ''
  })
  const updateSaveData = (saveData: Partial<VLANPoolPolicyType>) => {
    updateSaveState({ ...saveState, ...saveData })
  }
  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const handleVLANPoolPolicy = async () => {
    try {
      if (!edit) {
        await createVLANPoolPolicy({
          params,
          payload: saveState
        }).unwrap()
      } else {
        await updateVLANPoolPolicy({
          params,
          payload: saveState
        }).unwrap()
      }
      props.networkView? props.backToNetwork?.(data) : navigate(linkToPolicies, { replace: true })
    } catch(error) {
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }
  return (
    <>
      <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit VLAN Pool' })
          : $t({ defaultMessage: 'Add VLAN Pool' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath() }
        ]}
      />
      <StepsForm<VLANPoolPolicyType>
        formRef={formRef}
        onCancel={() => props.networkView? props.backToNetwork?.():navigate(linkToPolicies)}
        onFinish={async () => {return handleVLANPoolPolicy()}}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
          onFinish={async (data) => {
            updateSaveData(data)
            return true
          }}
        >
          <VLANPoolSettingForm edit={edit} saveState={saveState}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default VLANPoolForm
