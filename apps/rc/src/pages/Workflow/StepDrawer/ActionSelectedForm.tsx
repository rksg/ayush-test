import { useState } from 'react'

import { Form, FormInstance, Input } from 'antd'
import { useIntl }                   from 'react-intl'

import { Button, Modal, ModalType, Select, StepsForm } from '@acx-ui/components'
import { useGetAllActionsByTypeQuery }                 from '@acx-ui/rc/services'
import {
  ActionType,
  ActionTypeNewTemplateTerms,
  ActionTypeSelectionTerms,
  ActionTypeTitle,
  SplitActionTypes, WorkflowActionDef
} from '@acx-ui/rc/utils'

import ActionGenericForm from '../WorkflowActionForm/ActionGenericForm'


interface ActionSelectedFormProps {
  form: FormInstance,
  actionDef: WorkflowActionDef
}

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
      // FIXME: DEMO [Currently, not support DPSK in BE]
      actionType: (ActionType.DPSK).includes(actionDef.toString())
        ? ActionType.AUP
        : actionDef.actionType.toString(),
      ...defaultActionTypePagination
    }
  }, {
    skip: SplitActionTypes.includes(actionDef.actionType),
    selectFromResult: ({ data, isLoading }) => {
      return {
        isLoading,
        options: data?.content?.map(type => {
          return {
            label: type.name,
            value: type.actionId
          }
        })
      }
    }
  })

  const actions = useGetAllActionsByTypeQuery({
    params: {
      // FIXME: possible need to switch the actionType between USER_SELECTION or AUTO_SELECTION
      actionType: ActionType.USER_SELECTION_SPLIT.toString(),
      ...defaultActionTypePagination
    }
  }, { skip: !SplitActionTypes.includes(actionDef.actionType) })

  const BaseSelectedForm = () => {
    return (<Form.Item
      name={'actionId'}
      // FIXME: need to eunm them
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

  const SplitSelectedForm = () => {
    return (
      <>
        <StepsForm.SectionTitle>
          {$t({ defaultMessage: 'Option 1' })}
        </StepsForm.SectionTitle>
        <Form.Item
          name={['splitOption', 'optionName']}
          label={$t({ defaultMessage: 'Option Name' })}
          rules={[
            { required: true }
          ]}
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name={['splitOption', 'enrollmentActionId']}
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

        <Form.Item
          // FIXME: May be the USER/AUTO Selection choice
          // TODO: Passing to the next StepDrawer to createSplitStep
          name={'actionDefinitionId'}
          hidden={true}
          initialValue={actionDef.id}
          children={<Input />}
        />
      </>
    )
  }



  return (
    <Form
      form={form}
      layout={'vertical'}
    >
      {SplitActionTypes.includes(actionDef.actionType)
        ? <SplitSelectedForm /> : <BaseSelectedForm />}
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
                console.log('Modal callback')
                setIsModalVisible(false)
              }}
            />}
          onCancel={() => setIsModalVisible(false)}
        />
      }

    </Form>
  )
}
