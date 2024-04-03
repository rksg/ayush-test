import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer, Select }                                            from '@acx-ui/components'
import { useCreateSplitOptionMutation, useGetAllActionsByTypeQuery } from '@acx-ui/rc/services'
import { ActionType }                                                from '@acx-ui/rc/utils'

const defaultActionTypePagination = {
  pageSize: '1000',
  page: '0',
  sort: 'name,asc'
}

interface AddSplitOptionDrawerProps {
  visible: boolean,
  onClose: () => void,
  workflowId: string,
  stepId: string,
  optionType: ActionType
}

export default function AddSplitOptionDrawer (props: AddSplitOptionDrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose, workflowId: serviceId, stepId, optionType } = props
  const [ formInstance ] = Form.useForm()
  const [ createOptionMutation ] = useCreateSplitOptionMutation()


  const onSave = async () => {
    try {
      await formInstance.validateFields()
      await createOptionMutation({
        params: { serviceId, stepId },
        payload: { ...formInstance.getFieldsValue() }
      }).unwrap()
      onClose()
    } catch (e) {
      return Promise.resolve()
    }
  }

  const actions = useGetAllActionsByTypeQuery({
    params: {
      // TODO: Need to support both of User and Auto selection option type
      actionType: optionType.toString(),
      ...defaultActionTypePagination
    }
  })

  return (
    <Drawer
      visible={visible}
      width={600}
      title={$t({ defaultMessage: 'Create an Option' })}
      onClose={onClose}
      footer={
        <Drawer.FormFooter
          buttonLabel={{ save: $t({ defaultMessage: 'Add Option' }) }}
          onSave={onSave}
          onCancel={onClose}
        />
      }
    >
      <Form
        layout={'vertical'}
        form={formInstance}
      >
        <Form.Item
          name={'optionName'}
          label={$t({ defaultMessage: 'Option Name' })}
          rules={[
            { required: true }
          ]}
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name={'enrollmentActionId'}
          label={$t({ defaultMessage: 'Split Option Template' })}
          rules={[
            { required: true }
          ]}
        >
          <Select
            loading={actions.isLoading}
            options={actions.data?.content?.map(action => ({
              label: action.name,
              value: action.actionId
            }))}
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
