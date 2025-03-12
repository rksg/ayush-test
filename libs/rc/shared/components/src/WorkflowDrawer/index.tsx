import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                    from '@acx-ui/components'
import { useUpdateWorkflowMutation } from '@acx-ui/rc/services'
import { Workflow }                  from '@acx-ui/rc/utils'

import { WorkflowForm } from '../WorkflowForm'

interface WorkflowDrawerProps {
  visible: boolean,
  onClose: () => void,
  data: Workflow
}


export function WorkflowDrawer (props: WorkflowDrawerProps) {
  const { visible, onClose, data } = props
  const { $t } = useIntl()
  const [updateWorkflow] = useUpdateWorkflowMutation()
  const [form] = Form.useForm()
  const handleUpdateWorkflow = async (originData:Workflow|undefined,
    submittedData: Partial<Workflow> ) => {
    if (originData === undefined) return
    const workflowKeys = ['name', 'description'] as const
    const patchData = {}

    workflowKeys.forEach(key => {
      if (submittedData[key] !== originData[key]) {
        Object.assign(patchData, { [key]: submittedData[key] })
      }
    })
    return updateWorkflow({ params: { id: originData.id },
      payload: patchData as Workflow }).unwrap()
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      await handleUpdateWorkflow(data, form.getFieldsValue())
    } catch (e) {
      return Promise.resolve()
    }
    onClose()
  }


  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'Save' })
      }}
      onSave={onSave}
      onCancel={() => onClose()}
    />)


  return (
    <Drawer
      destroyOnClose={true}
      title={$t({ defaultMessage: 'Edit Workflow' })}
      width={'360px'}
      visible={visible}
      onClose={() => onClose()}
      children={
        <Form
          form={form}
          preserve={false}
          layout={'vertical'}
          name={'workflowForm'}
          initialValues={data}
        >
          <WorkflowForm
            policyId={data.id!}
            isEdit
          />
        </Form>
      }
      footer={footer}
    />
  )
}