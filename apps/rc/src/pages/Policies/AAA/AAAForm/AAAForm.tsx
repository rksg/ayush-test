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
  PolicyOperation,
  PolicyType,
  useConfigTemplate,
  usePolicyBreadcrumb,
  usePolicyInstanceListPath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

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
  const linkToInstanceList = usePolicyInstanceListPath(PolicyType.AAA, PolicyOperation.LIST)
  const params = useParams()
  const { type, edit, networkView, backToNetwork } = props
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<AAAPolicyType>>()
  const { data } = useAaaPolicyQuery({ params }, { skip: !isEdit })
  const { isTemplate } = useConfigTemplate()
  const breadcrumb = usePolicyBreadcrumb(PolicyType.AAA, PolicyOperation.LIST)
  const createAAAPolicy = useAddInstance()
  const [ updateAAAPolicy ] = useUpdateAAAPolicyMutation()
  const [saveState, updateSaveState] = useState<AAAPolicyType>({ name: '' })

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveState({ ...saveState, ...data })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAAAPolicy = async (data: AAAPolicyType) => {
    const requestPayload = { params, payload: data }
    try {
      if (isEdit) {
        await updateAAAPolicy(requestPayload).unwrap()
      } else {
        await createAAAPolicy(requestPayload).unwrap().then(res => data.id = res?.response?.id)
      }
      networkView ? backToNetwork?.(data) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    networkView ? backToNetwork?.() : navigate(linkToInstanceList)
  }

  return (
    <>
      {!networkView && <PageHeader
        title={generatePolicyPageHeaderTitle(isEdit, isTemplate, PolicyType.AAA)}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<AAAPolicyType>
        formRef={formRef}
        onCancel={onCancel}
        onFinish={handleAAAPolicy}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={isEdit}
            saveState={saveState}
            type={type}
            networkView={networkView}/>
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
