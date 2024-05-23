import { ReactNode } from 'react'

import { Popover, Space }                         from 'antd'
import { useIntl }                                from 'react-intl'
import { useParams }                              from 'react-router-dom'
import { Handle, NodeProps, Position, useNodeId } from 'reactflow'

import { Button, Loader, showActionModal }                                     from '@acx-ui/components'
import { DeleteOutlined, EditOutlined, EyeOpenOutlined, MoreVertical, Plus }   from '@acx-ui/icons'
import { useDeleteSplitOptionByIdMutation, useDeleteWorkflowStepByIdMutation } from '@acx-ui/rc/services'
import { ActionType }                                                          from '@acx-ui/rc/utils'


import { useWorkflowContext } from '../WorkflowPanel/WorkflowContextProvider'

import * as UI from './styledComponents'

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
    nodeState, actionDrawerState,
    stepDrawerState
  } = useWorkflowContext()
  const [ deleteStep, { isLoading: isDeleteStepLoading } ] = useDeleteWorkflowStepByIdMutation()
  const [ deleteOption, { isLoading: isDeleteOptionLoading }] = useDeleteSplitOptionByIdMutation()

  const onHandleNode = (node?: NodeProps) => {
    nodeState.setInteractedNode(node)
  }

  const onEditClick = () => {
    console.log('[EditBtnClick]', nodeId, props)

    onHandleNode(props)
    stepDrawerState.onOpen(true, 'definitionId', props.type as ActionType)
  }

  const onAddClick = () => {
    console.log('[AddBtnClick]', nodeId, props)

    onHandleNode(props)
    actionDrawerState.onOpen()
  }

  const onDeleteClick = () => {
    console.log('[DeleteBtnClick]', nodeId, props)

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
            params: { serviceId, stepId: props.data.splitStepId, optionId: nodeId }
          }).unwrap()
          : deleteStep({ params: { serviceId, stepId: nodeId } })
            .unwrap()
      }
    })
  }

  const onPreviewClick = () => {
    console.log('[PreviewBtnClick]', nodeId, props)
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
    <UI.WorkflowNode selected={props.selected}>
      <Loader states={[
        { isLoading: false, isFetching: isDeleteStepLoading },
        { isLoading: false, isFetching: isDeleteOptionLoading }
      ]}>
        <Space direction={'vertical'} align={'center'} style={{ width: '100%' }}>
          {props.children}
        </Space>
      </Loader>
      <UI.EditHandle>
        <Handle hidden={!props.selected} type={'source'} position={Position.Right} >
          <Popover
            content={stepToolBar}
            trigger={'hover'}
          >
            <Button
              style={{ background: 'white' }}
              shape={'circle'}
              size={'small'}
              icon={<MoreVertical />}
              // onClick={onEditClick}
            />
          </Popover>
        </Handle>
      </UI.EditHandle>


      {/* <CustomDiv>
        <Handle type={'source'} position={Position.Top}>
          <div className={'circle'} />
        </Handle>
      </CustomDiv> */}


      <UI.TargetHandle>
        <Handle
          type='target'
          position={Position.Top}
          className={'circle'}
        />
      </UI.TargetHandle>

      {splitCount.map((split, index) => {
        return (
          <UI.SourceHandle selected={props.selected} key={index}>
            <Handle
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
                  onClick={onAddClick}
                />
              }
            </Handle>
          </UI.SourceHandle>
        )
      })}
    </UI.WorkflowNode>
  )
}
