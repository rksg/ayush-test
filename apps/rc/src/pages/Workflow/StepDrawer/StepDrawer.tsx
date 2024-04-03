import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import { NodeProps } from 'reactflow'

import { Drawer } from '@acx-ui/components'
import {
  useCreateWorkflowChildStepMutation,
  useCreateWorkflowStepMutation,
  useCreateWorkflowStepUnderOptionMutation,
  workflowApi
} from '@acx-ui/rc/services'
import { ActionType, ActionTypeTitle, isSplitActionType, WorkflowActionDef } from '@acx-ui/rc/utils'
import { store }                                                             from '@acx-ui/store'

import ActionSelectedForm from './ActionSelectedForm'

enum StepType {
  Basic = 'stepDto',
  Split = 'splitStepDto'
}

export interface StepDrawerProps {
  workflowId: string
  visible: boolean,
  actionType: ActionType,
  onClose: () => void,
  selectedActionDef: WorkflowActionDef

  priorNode?: NodeProps
}

export default function StepDrawer (props: StepDrawerProps) {
  const { $t } = useIntl()
  const params = useParams()
  const {
    workflowId: serviceId, visible, onClose,
    actionType, priorNode, selectedActionDef
  } = props
  const [ formInstance ] = Form.useForm()
  const [ createStepMutation ] = useCreateWorkflowStepMutation()
  const [ createChildStepMutation ] = useCreateWorkflowChildStepMutation()
  const [ createStepUnderOptionMutation ] = useCreateWorkflowStepUnderOptionMutation()


  const onSave = async () => {
    console.log('OnSave :: ', formInstance.getFieldsValue())
    console.log('onSave :: priorActionType = ', priorNode?.type)

    formInstance.validateFields()
      .then(async (formContent) => {
        console.log('OK :: ', formContent)
        console.log('params :: ', params)

        // TODO: If priorNode is Split action type -> call different api to create step
        if (priorNode?.type === ActionType.USER_SELECTION_SPLIT) {
          console.log('createStepUnderOptionMutation', priorNode)
          await createStepUnderOptionMutation({
            params: { serviceId, stepId: priorNode.data.splitStepId, optionId: priorNode.id },
            payload: {
              type: isSplitActionType(actionType) ? 'splitStepDto' : 'stepDto',
              // FIXME: How to pass the actionDefinitionId to here?
              enrollmentActionId: formContent.actionId,
              ...formContent
            },
            skip: !serviceId
          })
        } else {
          if (actionType === ActionType.USER_SELECTION_SPLIT) {
            console.log('createSplitStep', actionType)
          } else {
            console.log('createBasicStep', actionType)
          }

          priorNode?.id
            ? await createChildStepMutation({
              params: { serviceId, stepId: priorNode.id },
              payload: {
                type: isSplitActionType(actionType) ? StepType.Split : StepType.Basic,
                enrollmentActionId: formContent.actionId,
                ...formContent
              },
              skip: !serviceId
            })
            : await createStepMutation({
              params: { serviceId },
              payload: {
                type: isSplitActionType(actionType) ? StepType.Split : StepType.Basic,
                enrollmentActionId: formContent.actionId,
                ...formContent
              },
              skip: !serviceId
            })
        }

        onClose()

        // FIXME: Due to Activity failure, so I manually invalidate the cache tags.
        setTimeout(() => {
          store.dispatch(workflowApi.util.invalidateTags([{ type: 'Step' }]))
        }, 3000)
      })
      .catch((err) => {
        console.log('Failed to create step reason = ', err)
      })
  }


  return (
    <Drawer
      title={$t(ActionTypeTitle[actionType])}
      width={650}
      visible={visible}
      onClose={onClose}
      children={
        <ActionSelectedForm
          form={formInstance}
          actionDef={selectedActionDef}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{ save: $t({ defaultMessage: 'Add Step' }) }}
          onSave={onSave}
          onCancel={onClose}
        />
      }
    />
  )
}
