import { useEffect, useState } from 'react'

import { Form, Typography }                    from 'antd'
import { useIntl }                             from 'react-intl'
import { resolvePath, useNavigate, useParams } from 'react-router-dom'

import {
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import {
  WorkflowForm
} from '@acx-ui/rc/components'
import { CommonAsyncResponse, useAddWorkflowMutation, useSearchInProgressWorkflowListQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  usePolicyListBreadcrumb,
  Workflow,
  WorkflowDetailsTabKey
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

interface WorkflowFormField extends Workflow {}
export default function WorkflowPageForm () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath( { type: PolicyType.WORKFLOW, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const [isCreating, setIsCreating] = useState(false)
  const [addWorkflow] = useAddWorkflowMutation()

  const { data: existingWorkflowData, isLoading, isFetching } =
    useSearchInProgressWorkflowListQuery(
      { params: { excludeContent: 'true' }, payload: { page: 1, pageSize: 1 } })

  const [isMaxWorkflowsExceeded, setIsMaxWorkflowsExceeded] = useState(true)

  useEffect(() => {
    if(!existingWorkflowData || existingWorkflowData?.totalCount >= 500) {
      setIsMaxWorkflowsExceeded(true)
    } else {
      setIsMaxWorkflowsExceeded(false)
    }
  }, [existingWorkflowData])

  const handleAddWorkflow = async (data: Workflow, callback?: (v: CommonAsyncResponse)=>void) => {
    return addWorkflow({ payload: {
      ...data
    },
    callback: callback
    }).unwrap()
  }

  const onSubmit = async () => {
    const callback = (res : CommonAsyncResponse) =>{
      const link = getPolicyDetailsLink({
        type: PolicyType.WORKFLOW,
        oper: PolicyOperation.DETAIL,
        policyId: res.id,
        activeTab: WorkflowDetailsTabKey.OVERVIEW
      })
      const path = resolvePath(link, `/${tenantId}/t`)
      navigate(path, { replace: true })
    }
    try {
      await form.validateFields()
      // eslint-disable-next-line max-len
      await handleAddWorkflow(form.getFieldsValue(), callback)
      setIsCreating(true)
    } catch (error) {
      return Promise.resolve()
    }
  }

  const onCancel = ()=> {
    navigate(linkToPolicies, { replace: true })
  }

  const buttonLabel = {
    submit: $t({ defaultMessage: 'Next' })
  }


  return (
    <>
      <PageHeader
        breadcrumb={usePolicyListBreadcrumb(PolicyType.WORKFLOW)}
        title={$t({ defaultMessage: 'Add Workflow' })}
      />
      <Loader states={[{ isLoading: isCreating || isLoading, isFetching: isFetching }]}>
        {isMaxWorkflowsExceeded && <p><Typography.Text type='danger' strong>
          {$t({ defaultMessage: 'No more workflows may be created. ' +
            'The maximum number of workflows has been reached.' })}
        </Typography.Text></p>}
        <StepsForm<WorkflowFormField>
          form={form}
          editMode={false}
          buttonLabel={buttonLabel}
          onCancel={()=>onCancel()}
          onFinish={onSubmit}
          disabled={isMaxWorkflowsExceeded}>
          <StepsForm.StepForm<WorkflowFormField>
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            layout={'vertical'}
          >
            <WorkflowForm isEdit={false}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>)
}