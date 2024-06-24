import { useState } from 'react'

import { Form, FormInstance } from 'antd'
import { useIntl }            from 'react-intl'

import { Button, Modal, ModalType, Select } from '@acx-ui/components'
import { useGetAllActionsByTypeQuery }      from '@acx-ui/rc/services'
import {
  ActionTypeNewTemplateTerms,
  ActionTypeSelectionTerms,
  ActionTypeTitle,
  WorkflowActionDef
} from '@acx-ui/rc/utils'

import ActionGenericForm from '../WorkflowActionSettingForm/ActionGenericForm'


interface ActionSelectedFormProps {
  form: FormInstance,
  actionDef: WorkflowActionDef
}

// FIXME: Deprecated!
export default function ActionSelectedForm (props: ActionSelectedFormProps) {
  const { $t } = useIntl()
  const { form, actionDef } = props
  const [isModalVisible, setIsModalVisible] = useState(false)

  const defaultActionTypePagination = {
    pageSize: '1000',
    page: '0',
    sort: 'name,asc'
  }

  const { options, isLoading } = useGetAllActionsByTypeQuery({
    params: {
      actionType: actionDef.actionType.toString(),
      ...defaultActionTypePagination
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isLoading,
        options: data?.content?.map(type => {
          return {
            label: type.name,
            value: type.id
          }
        })
      }
    }
  })

  const BaseSelectedForm = () => {
    return (<Form.Item
      name={'actionId'}
      label={ActionTypeSelectionTerms[actionDef.actionType]
        ? $t(ActionTypeSelectionTerms[actionDef.actionType]!)
        : $t({ defaultMessage: 'Select an existing template to use:' })}
      rules={[
        { required: true }
      ]}
    >
      <Select
        showSearch
        options={options}
        loading={isLoading}
        filterOption={(input, option) =>
          ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
        }
      />
    </Form.Item>)
  }

  return (
    <Form
      form={form}
      layout={'vertical'}
    >
      <BaseSelectedForm />
      {ActionTypeNewTemplateTerms[actionDef.actionType] &&
        <Button
          type={'link'}
          onClick={() => setIsModalVisible(true)}
        >
          {$t(ActionTypeNewTemplateTerms[actionDef.actionType]!)}
        </Button>
      }

      {isModalVisible &&
        <Modal
          visible={true}
          destroyOnClose={true}
          title={$t({ defaultMessage: 'Add' }) + ' ' + $t(ActionTypeTitle[actionDef.actionType])}
          type={ModalType.ModalStepsForm}
          width={800}
          children={
            <ActionGenericForm
              actionType={actionDef.actionType}
              modalCallback={() => {
                setIsModalVisible(false)
              }}
            />}
          onCancel={() => setIsModalVisible(false)}
        />
      }

    </Form>
  )
}
