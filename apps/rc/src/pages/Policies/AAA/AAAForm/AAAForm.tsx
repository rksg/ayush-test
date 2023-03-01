import { useRef, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAaaPolicyQuery, useAddAAAPolicyMutation, useUpdateAAAPolicyMutation } from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import AAASettingForm from './AAASettingForm'


type AAAFormProps = {
  type?: string,
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: AAAPolicyType) => void
}
const AAAForm = (props: AAAFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const edit = props.edit && !props.networkView
  const formRef = useRef<StepsFormInstance<AAAPolicyType>>()
  const { data } = useAaaPolicyQuery({ params }, { skip: !props.edit })
  const [ createAAAPolicy ] = useAddAAAPolicyMutation()

  const [ updateAAAPolicy ] = useUpdateAAAPolicyMutation()
  const [saveState, updateSaveState] = useState<AAAPolicyType>({
    name: ''
  })
  const updateSaveData = (saveData: Partial<AAAPolicyType>) => {
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
  const addOrUpdateAAA = async (data: AAAPolicyType, edit: boolean) =>{
    if (!edit) {
      await createAAAPolicy({
        params,
        payload: data
      }).unwrap().then((res)=>{
        data.id = res?.response?.id
      })
    } else {
      await updateAAAPolicy({
        params,
        payload: data
      }).unwrap()
    }
    props.networkView? props.backToNetwork?.(data) : navigate(linkToPolicies, { replace: true })
  }
  const handleAAAPolicy = async (data: AAAPolicyType) => {
    try {
      await addOrUpdateAAA(data, edit)
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
      {!props.networkView &&<PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit AAA (802.1x) Server' })
          : $t({ defaultMessage: 'Add AAA (802.1x) Server' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: tablePath }
        ]}
      />}
      <StepsForm<AAAPolicyType>
        formRef={formRef}
        onCancel={() => props.networkView? props.backToNetwork?.():navigate(linkToPolicies)}
        onFinish={async (data) => {return handleAAAPolicy(data)}}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={edit} saveState={saveState} type={props.type}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
export default AAAForm
