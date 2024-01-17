import { useRef, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import {
  useAaaPolicyQuery,
  useAddAAAPolicyMutation,
  useUpdateAAAPolicyMutation,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation
} from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  generatePolicyPageHeaderTitle,
  PolicyOperation,
  PolicyType,
  useConfigTemplate,
  usePolicyBreadcrumb,
  usePolicyPreviousPath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import { AAASettingForm } from './AAASettingForm'


type AAAFormProps = {
  type?: string,
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: AAAPolicyType) => void
}
export const AAAForm = (props: AAAFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.AAA, PolicyOperation.LIST)
  const params = useParams()
  const { type, edit, networkView, backToNetwork } = props
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<AAAPolicyType>>()
  const { isTemplate } = useConfigTemplate()
  const breadcrumb = usePolicyBreadcrumb(PolicyType.AAA, PolicyOperation.LIST)
  const { data } = useGetInstance(isEdit)
  const createInstance = useAddInstance()
  const updateInstance = useUpdateInstance()
  const [saveState, setSaveState] = useState<AAAPolicyType>({ name: '' })

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      setSaveState({ ...saveState, ...data })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAAAPolicy = async (data: AAAPolicyType) => {
    const requestPayload = { params, payload: data }
    try {
      if (isEdit) {
        await updateInstance(requestPayload).unwrap()
      } else {
        await createInstance(requestPayload).unwrap().then(res => data.id = res?.response?.id)
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
        editMode={isEdit}
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

function useAddInstance () {
  const { isTemplate } = useConfigTemplate()
  const [ createAAAPolicy ] = useAddAAAPolicyMutation()
  const [ createAAAPolicyTemplate ] = useAddAAAPolicyTemplateMutation()

  return isTemplate ? createAAAPolicyTemplate : createAAAPolicy
}

function useGetInstance (isEdit: boolean) {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const aaaPolicyResult = useAaaPolicyQuery({ params }, { skip: !isEdit || isTemplate })
  // eslint-disable-next-line max-len
  const aaaPolicyTemplateResult = useGetAAAPolicyTemplateQuery({ params }, { skip: !isEdit || !isTemplate })

  return isTemplate ? aaaPolicyTemplateResult : aaaPolicyResult
}

function useUpdateInstance () {
  const { isTemplate } = useConfigTemplate()
  const [ updateAAAPolicy ] = useUpdateAAAPolicyMutation()
  const [ updateAAAPolicyTemplate ] = useUpdateAAAPolicyTemplateMutation()

  return isTemplate ? updateAAAPolicyTemplate : updateAAAPolicy
}
