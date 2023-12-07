import { useRef, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { useAddAAAPolicyTemplateMutation }                                        from '@acx-ui/msp/services'
import { useAaaPolicyQuery, useAddAAAPolicyMutation, useUpdateAAAPolicyMutation } from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  generatePolicyPageHeaderTitle,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  policyTypeLabelMapping,
  useConfigTemplate
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
  const formRef = useRef<StepsFormLegacyInstance<AAAPolicyType>>()
  const { data } = useAaaPolicyQuery({ params }, { skip: !props.edit })
  const createAAAPolicy = useAddInstance()

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
    if (edit) {
      await updateAAAPolicy({ params, payload: data }).unwrap()
    } else {
      await createAAAPolicy({ params, payload: data }).unwrap().then((res)=>{
        data.id = res?.response?.id
      })
    }
    props.networkView? props.backToNetwork?.(data) : navigate(linkToPolicies, { replace: true })
  }
  const handleAAAPolicy = async (data: AAAPolicyType) => {
    try {
      await addOrUpdateAAA(data, edit)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!props.networkView &&<PageHeader
        title={generatePolicyPageHeaderTitle(edit, false, PolicyType.AAA)}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t(policyTypeLabelMapping[PolicyType.AAA]), link: tablePath }
        ]}
      />}
      <StepsFormLegacy<AAAPolicyType>
        formRef={formRef}
        onCancel={() => props.networkView? props.backToNetwork?.():navigate(linkToPolicies)}
        onFinish={async (data) => {return handleAAAPolicy(data)}}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={edit}
            saveState={saveState}
            type={props.type}
            networkView={props.networkView}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
export default AAAForm

function useAddInstance () {
  const { isTemplate } = useConfigTemplate()
  const [ createAAAPolicy ] = useAddAAAPolicyMutation()
  const [ createAAAPolicyTemplate ] = useAddAAAPolicyTemplateMutation()

  return isTemplate ? createAAAPolicyTemplate : createAAAPolicy
}
