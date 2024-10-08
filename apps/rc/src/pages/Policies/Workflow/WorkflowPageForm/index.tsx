import { Form }                                from 'antd'
import { useIntl }                             from 'react-intl'
import { resolvePath, useNavigate, useParams } from 'react-router-dom'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import {
  WorkflowForm
} from '@acx-ui/rc/components'
import { CommonAsyncResponse, useAddWorkflowMutation } from '@acx-ui/rc/services'
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

  const [addWorkflow] = useAddWorkflowMutation()
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
      <StepsForm<WorkflowFormField>
        form={form}
        editMode={false}
        buttonLabel={buttonLabel}
        onCancel={()=>onCancel()}
        onFinish={async ()=> {onSubmit()}
        }>
        <StepsForm.StepForm<WorkflowFormField>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
          layout={'vertical'}
        >
          <WorkflowForm isEdit={false}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>)
}