import { ReactNode } from 'react'

import { Popover }                                from 'antd'
import { useIntl }                                from 'react-intl'
import { useParams }                              from 'react-router-dom'
import { Handle, NodeProps, Position, useNodeId } from 'reactflow'

import { Button, Loader, showActionModal }                                                       from '@acx-ui/components'
import { DeleteOutlined, EditOutlined, EndFlag, EyeOpenOutlined, MoreVertical, Plus, StartFlag } from '@acx-ui/icons'
import { useDeleteSplitOptionByIdMutation, useDeleteWorkflowStepByIdMutation }                   from '@acx-ui/rc/services'
import { ActionType }                                                                            from '@acx-ui/rc/utils'


import { useWorkflowContext } from '../WorkflowPanel/WorkflowContextProvider'

import * as UI from './styledComponents'

export default function BaseStepNode (props: NodeProps
  & { children: ReactNode, name?: string }
  & { splitCount?: string[] })
{
  const { $t } = useIntl()
  const nodeId = useNodeId()
  const { policyId } = useParams()
  // FIXME: Maybe it is not necessary
  const splitCount = props.splitCount ?? ['a']
  const {
    nodeState, actionDrawerState,
    stepDrawerState
  } = useWorkflowContext()
  const [ deleteStep, { isLoading: isDeleteStepLoading } ] = useDeleteWorkflowStepByIdMutation()
  const [ deleteOption, { isLoading: isDeleteOptionLoading }] = useDeleteSplitOptionByIdMutation()

  const onHandleNode = (node?: NodeProps) => {
    nodeState.setInteractedNode(node)
  }

  const onEditClick = () => {
    onHandleNode(props)
    stepDrawerState.onOpen(true, 'definitionId', props.type as ActionType)
  }

  const onAddClick = () => {
    onHandleNode(props)
    actionDrawerState.onOpen()
  }

  const onDeleteClick = () => {
    // console.log('[DeleteBtnClick]', nodeId, props)

    onHandleNode(props)
    stepDrawerState.onClose()

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Step' }),
        entityValue: props.name
      },
      content:
        $t({ defaultMessage: 'Do you want to delete this step?' }),
      onOk: () => {
        props.type === ActionType.USER_SELECTION_SPLIT && props.data?.splitStepId
          ? deleteOption({
            params: { policyId, stepId: props.data.splitStepId, optionId: nodeId }
          }).unwrap()
          : deleteStep({ params: { policyId, stepId: nodeId } })
            .unwrap()
      }
    })
  }

  const onPreviewClick = () => {
    // TODO: Need to implement
  }

  const stepToolBar = (<>
    <Button
      type={'link'}
      icon={<EditOutlined/>}
      onClick={onEditClick}
    />
    <Button
      type={'link'}
      icon={<EyeOpenOutlined/>}
      onClick={onPreviewClick}
    />
    <Button
      type={'link'}
      icon={<DeleteOutlined/>}
      onClick={onDeleteClick}
    />
  </>)


  return (
    <UI.StepNode selected={props.selected}>
      <Loader states={[
        { isLoading: false, isFetching: isDeleteStepLoading },
        { isLoading: false, isFetching: isDeleteOptionLoading }
      ]}>
        {props.children}
      </Loader>

      {props.selected &&
        <Popover
          content={stepToolBar}
          trigger={'hover'}
        >
          <UI.EditButton>
            <MoreVertical />
          </UI.EditButton>
        </Popover>
      }

      {props.selected &&
        <UI.PlusButton onClick={onAddClick}>
          <Plus />
        </UI.PlusButton>
      }

      <Handle
        type='target'
        position={Position.Top}
      />

      <Handle
        type={'source'}
        position={Position.Bottom}
      />

      {props.data.isStart &&
        <UI.FlagIcon>
          <StartFlag />
        </UI.FlagIcon>
      }

      {props.data.isEnd &&
        <UI.FlagIcon>
          <EndFlag />
        </UI.FlagIcon>
      }
    </UI.StepNode>
  )
}
