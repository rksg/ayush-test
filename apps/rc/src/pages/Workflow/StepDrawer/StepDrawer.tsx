import { useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { Button, Drawer, Loader }                                                                   from '@acx-ui/components'
import { EyeOpenSolid }                                                                             from '@acx-ui/icons'
import {  useLazyGetActionByIdQuery }                                                               from '@acx-ui/rc/services'
import { ActionDefaultValueMap, ActionType, ActionTypeTitle, GenericActionData, WorkflowActionDef } from '@acx-ui/rc/utils'

import { AupSettings }           from '../WorkflowActionForm/AupSettings'
import { DataPromptActionForm }  from '../WorkflowActionForm/DataPromptActionForm'
import { DisplayMessageSetting } from '../WorkflowActionForm/DisplayMessageSettings'

import { useWorkflowStepActions } from './useWorkflowStepAction'


export interface StepDrawerProps {
  isEdit: boolean,
  actionId?: string,
  workflowId: string
  visible: boolean,
  actionType: ActionType,
  onClose: () => void,
  selectedActionDef?: WorkflowActionDef

  priorNode?: NodeProps
}

// FIXME: Use enum to make sure new ActionType to be added into this Map
const actionFormMap = {
  [ActionType.AUP]: AupSettings,
  [ActionType.DATA_PROMPT]: DataPromptActionForm,
  [ActionType.DPSK]: () => <></>,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageSetting,
  [ActionType.USER_SELECTION_SPLIT]: () => <></>
}

export default function StepDrawer (props: StepDrawerProps) {
  const { $t } = useIntl()
  const {
    workflowId: serviceId, visible, onClose,
    actionType, priorNode, selectedActionDef,
    isEdit, actionId
  } = props
  const ActionForm = actionFormMap[actionType]
  const defaultValue = Object.entries(ActionDefaultValueMap[actionType])
    .reduce((acc: Record<string, string | boolean>, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'boolean') {
        acc[key] = value
      } else {
        acc[key] = $t(value)
      }
      return acc
    }, {})

  const [ formInstance ] = Form.useForm()

  const { createStepWithActionMutation: createStep, patchActionMutation } = useWorkflowStepActions()
  const [actionData, setActionData] = useState<GenericActionData | undefined>()
  const [ getActionById, {
    isLoading: isActionLoading,
    isFetching: isActionFetching,
    isError: isActionError
  } ] = useLazyGetActionByIdQuery()


  useEffect(() => {
    formInstance.resetFields()

    if (!isEdit) {
      formInstance.setFieldsValue(defaultValue)
      return
    }

    if (!actionId) return

    getActionById({ params: { serviceId, actionId } })
      .then((result) => {
        setActionData(result?.data)
        formInstance.setFieldsValue(result?.data)
      })

  }, [actionId, isEdit])

  const onSave = async () => {
    try {
      const formContent = await formInstance.validateFields()

      isEdit
        ? actionData && await patchActionMutation(actionData, formContent).then(onClose)
        : await createStep(serviceId, actionType, formContent, priorNode?.id, onClose)
    } catch (ex) {
      console.error('Failed to create/update step. isEdit=', isEdit, ' reason=', ex)
    }
  }

  return (
    <Drawer
      title={$t(ActionTypeTitle[actionType])}
      destroyOnClose
      width={650}
      visible={visible}
      onClose={onClose}
      children={
        <Loader
          states={[
            { isLoading: isActionLoading, isFetching: isActionFetching }
          ]}
        >
          <Form
            name={'actionForm'}
            disabled={isActionError}
            preserve={false}
            form={formInstance}
            layout={'vertical'}
          >
            <ActionForm />
          </Form>
        </Loader>
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: isEdit
              ? $t({ defaultMessage: 'Save Step' })
              : $t({ defaultMessage: 'Add Step' })
          }}
          onSave={onSave}
          onCancel={onClose}
          showSaveButton={!isActionError}
          extra={
            <Button
              type={'link'}
              icon={<EyeOpenSolid/>}
            >
              {$t({ defaultMessage: 'Preview' })}
            </Button>
          }
        />
      }
      footerStyle={{
        backgroundColor: '#f8f8fa',
        margin: '0px',
        padding: '20px'
      }}
    />
  )
}
