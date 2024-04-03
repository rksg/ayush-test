import { ReactNode } from 'react'

import { Space }                                  from 'antd'
import { useIntl }                                from 'react-intl'
import { useParams }                              from 'react-router-dom'
import { Handle, NodeProps, Position, useNodeId } from 'reactflow'

import { Button, Loader, showActionModal }                                     from '@acx-ui/components'
import { MoreVertical, Plus }                                                  from '@acx-ui/icons'
import { useDeleteSplitOptionByIdMutation, useDeleteWorkflowStepByIdMutation } from '@acx-ui/rc/services'
import { ActionType }                                                          from '@acx-ui/rc/utils'

import { useWorkflowContext } from '../WorkflowPanel'

import { CustomDiv, EditHandle, SourceHandle, TargetHandle, WorkflowNode } from './styledComponents'

function getHandlePosition (partitionCount: number, index: number) {
  const onePartition = 100 / (partitionCount + 1)

  return onePartition * (index + 1)
}

export default function BaseActionNode (props: NodeProps
  & { children: ReactNode, name?: string }
  & { splitCount?: string[] })
{
  const { $t } = useIntl()
  const nodeId = useNodeId()
  const { serviceId } = useParams()
  // FIXME: Maybe it is not necessary
  const splitCount = props.splitCount ?? ['a']
  const {
    nodeState, actionDrawerState, actionModalState,
    splitOptionDrawerState
  } = useWorkflowContext()
  const [ deleteStep, { isLoading: isDeleteStepLoading } ] = useDeleteWorkflowStepByIdMutation()
  const [ deleteOption, { isLoading: isDeleteOptionLoading }] = useDeleteSplitOptionByIdMutation()

  const onHandleNode = (node?: NodeProps) => {
    console.log('Interacted Node = ', node)
    nodeState.setInteractedNode(node)
  }

  const onEditClick = () => {
    onHandleNode(props)
    console.log('Edit btn Click!', props)
    actionModalState.onOpen(props.type as ActionType, props.data.enrollmentActionId)
  }

  const onAddClick = (isTopNode: boolean) => {
    onHandleNode(props)
    console.log('Add btn Click!', props)

    if (props.type === ActionType.USER_SELECTION_SPLIT.toString()
    && !props.data?.splitStepId) {
      splitOptionDrawerState.onOpen()
    } else {
      actionDrawerState.onOpen()
    }
  }

  const onDeleteClick = () => {
    onHandleNode(props)
    console.log('Delete btn Click!', nodeId, props)
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
            params: { serviceId, stepId: props.data.splitStepId, optionId: nodeId }
          }).unwrap()
          : deleteStep({ params: { serviceId, stepId: nodeId } })
            .unwrap()
      }
    })
  }

  return (
    <WorkflowNode selected={props.selected}>
      <Loader states={[
        { isLoading: false, isFetching: isDeleteStepLoading },
        { isLoading: false, isFetching: isDeleteOptionLoading }
      ]}>
        <Space direction={'vertical'} align={'center'} style={{ width: '100%' }}>
          {props.children}
        </Space>
      </Loader>
      <EditHandle>
        <Handle hidden={!props.selected} type={'source'} position={Position.Right} >
          <Button
            style={{ background: 'white' }}
            shape={'circle'}
            size={'small'}
            icon={<MoreVertical />}
            onClick={onDeleteClick}
          />
        </Handle>
      </EditHandle>


      {/*<CustomDiv>*/}
      {/*  <Handle type={'source'} position={Position.Top}>*/}
      {/*    <div className={'circle'} />*/}
      {/*  </Handle>*/}
      {/*</CustomDiv>*/}


      <TargetHandle>
        <Handle
          type='target'
          position={Position.Top}
          className={'circle'}
        >
          {/*{props.selected &&*/}
          {/*  <Button*/}
          {/*    style={{ color: 'white', background: 'white' }}*/}
          {/*    shape={'circle'}*/}
          {/*    size={'small'}*/}
          {/*    icon={<Plus />}*/}
          {/*    onClick={() => onAddClick(true)}*/}
          {/*  />*/}
          {/*}*/}
        </Handle>
      </TargetHandle>

      {splitCount.map((split, index) => {
        return (
          <SourceHandle selected={props.selected} key={index}>
            <Handle
              onClick={() => {
                console.log('Click Handler')
              }}
              id={`${index}`}
              key={split}
              type={'source'}
              position={Position.Bottom}
              style={{ left: `${getHandlePosition(splitCount.length, index)}%` }}
            >
              {props.selected &&
                <Button
                  style={{ background: 'white' }}
                  shape={'circle'}
                  size={'small'}
                  icon={<Plus />}
                  onClick={() => onAddClick(false)}
                />
              }
            </Handle>
          </SourceHandle>
        )
      })}
    </WorkflowNode>
  )
}

