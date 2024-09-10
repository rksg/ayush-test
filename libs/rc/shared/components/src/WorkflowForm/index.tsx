import { useEffect, useRef, useState } from 'react'

import { Form }         from 'antd'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import {
  StepsForm,
  Loader } from '@acx-ui/components'
import {
  useGetWorkflowByIdQuery,
  useAddWorkflowMutation,
  useUpdateWorkflowMutation,
  AsyncCommonResponse
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  getPolicyDetailsLink,
  Workflow,
  WorkflowDetailsTabKey,
  PublishStatus
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { WorkflowSettingForm } from './WorkflowSetting/WorkflowSettingForm'

export enum WorkflowFormMode {
  CREATE,
  EDIT
}

export interface WorkflowFormProps {
  mode: WorkflowFormMode
}

export interface WorkflowFormField extends Workflow {}

export function WorkflowForm (props: WorkflowFormProps) {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { mode } = props
  const isEdit = mode === WorkflowFormMode.EDIT
  const [ hasMutated, setHasMutated ] = useState(false)
  const [ready, setReady] = useState(isEdit)
  const [form] = Form.useForm<WorkflowFormField>()
  const originData = useRef<Workflow>()
  const tablePath = isEdit ?
    getPolicyDetailsLink({
      type: PolicyType.WORKFLOW,
      oper: PolicyOperation.DETAIL,
      policyId: policyId !!,
      activeTab: WorkflowDetailsTabKey.OVERVIEW
    }) :
    getPolicyRoutePath( { type: PolicyType.WORKFLOW,
      oper: PolicyOperation.LIST })

  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(tablePath)

  const [addWorkflow] = useAddWorkflowMutation()
  const [
    updateWorkflow,
    { isLoading: isUpdating }
  ] = useUpdateWorkflowMutation()
  const handleAddWorkflow = async (data: Workflow, callback?: (v: AsyncCommonResponse)=>void) => {
    return addWorkflow({ payload: {
      ...data,
      publishedDetails: { status: 'WORK_IN_PROGRESS' as PublishStatus }
    },
    callback: callback
    }).unwrap()
  }

  const handleUpdateWorkflow = async (originData:Workflow|undefined,
    submittedData: Partial<Workflow>, shouldPublish: boolean, callback?: ()=>void ) => {
    if (originData === undefined) return
    const workflowKeys = ['name'] as const
    const patchData = {}

    workflowKeys.forEach(key => {
      if (submittedData[key] !== originData[key]) {
        Object.assign(patchData, { [key]: submittedData[key] })
      }
    })

    if (shouldPublish) {
      Object.assign(patchData, { publishedDetails: { status: 'PUBLISHED' as PublishStatus } } )
    }

    if (Object.keys(patchData).length === 0) {
      callback?.()
    }
    return updateWorkflow({ params: { id: originData.id },
      payload: patchData as Workflow, callback: callback }).unwrap()
  }



  const {
    data,
    isLoading
  } = useGetWorkflowByIdQuery(
    { params: { id: policyId } },
    { skip: !isEdit }
  )

  useEffect(() => {
    const createDraft = async () => {
      let draftName = 'draft-' + uuidv4()
      await handleAddWorkflow({ name: draftName }, (response: AsyncCommonResponse) => {
        originData.current = { id: response.id, name: draftName } as Workflow
        setReady(true)
      })
    }

    if (!hasMutated && !ready) {
      setHasMutated((state) => {
        if (!state) {
          createDraft()
        }
        return true
      })
    }
  }, [])


  useEffect(()=> {
    if (!data || isLoading) return
    if (isEdit) {
      const workflow = data as Workflow
      form.resetFields()
      form.setFieldsValue({
        ...workflow
      })
      originData.current = workflow
    }
  }, [data, isLoading])

  const onSubmit = async (shouldPublish: boolean) => {
    try {
      // eslint-disable-next-line max-len
      await handleUpdateWorkflow(originData.current, form.getFieldsValue(), shouldPublish, () => navigate(linkToPolicies, { replace: true }))
    } catch (error) {}
  }

  const onCancel = ()=> {
    navigate(linkToPolicies, { replace: true })
  }

  const buttonLabel = {
    submit: $t({ defaultMessage: 'Add' }),
    apply: $t({ defaultMessage: 'Apply & Publish' })
  }

  const customSubmit = isEdit ?
    {
      label: $t({ defaultMessage: 'Apply' }),
      onCustomFinish: async ()=>{
        onSubmit(false)
      }
    }: {
      label: $t({ defaultMessage: 'Add & Publish' }),
      onCustomFinish: async ()=>{
        onSubmit(true)
      }
    }

  return (
    <StepsForm<WorkflowFormField>
      form={form}
      editMode={isEdit}
      customSubmit={customSubmit}
      buttonLabel={buttonLabel}
      onCancel={()=>onCancel()}
      onFinish={async ()=> {
        if (isEdit) {
          onSubmit(true)
        } else {
          onSubmit(false)
        }
      }
      }>
      <StepsForm.StepForm<WorkflowFormField>
        name='settings'
        title={$t({ defaultMessage: 'Settings' })}
        layout={'vertical'}
      >
        <Loader states={[{
          isLoading: isLoading || !ready,
          isFetching: isUpdating
        }]}>
          <WorkflowSettingForm policyId={isEdit? policyId : originData.current?.id}/>
        </Loader>
      </StepsForm.StepForm>
    </StepsForm>)
}
