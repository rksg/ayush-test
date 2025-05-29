import { ReactNode, useMemo, useState } from 'react'

import { Popover, Row, Space }                              from 'antd'
import { useIntl }                                          from 'react-intl'
import { Handle, isNode, NodeProps, Position, useNodeId, useNodes } from 'reactflow'

import { Button, Loader, showActionModal, Tooltip }                                                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                    from '@acx-ui/feature-toggle'
import { DeleteOutlined, EditOutlined, EndFlag, EyeOpenOutlined, MoreVertical, Plus, StartFlag, WarningCircleSolid } from '@acx-ui/icons'
import { useDeleteWorkflowStepDescendantsByIdMutation, useDeleteWorkflowStepByIdMutation,
  useDeleteWorkflowStepByIdV2Mutation } from '@acx-ui/rc/services'
import { ActionType, ActionTypeTitle, MaxAllowedSteps, MaxTotalSteps, StepStatusReason, StepStatusCodes, WorkflowUrls } from '@acx-ui/rc/utils'
import { hasAllowedOperations, hasPermission }                                       from '@acx-ui/user'
import { getOpsApi }                                                                 from '@acx-ui/utils'

import { WorkflowActionPreviewModal } from '../../../../WorkflowActionPreviewModal'
import { useWorkflowContext }         from '../WorkflowContextProvider'

import * as UI               from './styledComponents'
import { EditorToolbarIcon } from './styledComponents'

export default function BaseStepNode (props: NodeProps
  & { children: ReactNode, name?: string })
{
  const { $t } = useIntl()
  const workflowValidationEnhancementFFToggle =
    useIsSplitOn(Features.WORKFLOW_ENHANCED_VALIDATION_ENABLED)

  const nodeId = useNodeId()
  const nodes = useNodes()
  const isOverMaximumSteps = useMemo(() => nodes.length >= MaxTotalSteps, [nodes])
  const [ isPreviewOpen, setIsPreviewOpen ] = useState(false)
  const {
    nodeState, actionDrawerState,
    stepDrawerState, workflowId
  } = useWorkflowContext()
  const [ deleteStep, { isLoading: isDeleteStepLoading } ] = useDeleteWorkflowStepByIdMutation()
  const [ deleteAndDetachStep, { isLoading: isDeleteDetachStepLoading }]
    = useDeleteWorkflowStepByIdV2Mutation()
  const [ deleteStepDescendants, { isLoading: isDeleteStepDescendantsLoading }]
    = useDeleteWorkflowStepDescendantsByIdMutation()

  const {isNodeValid, validationErrors} = useMemo(() => {
    // @ts-ignore
    const validationErrors = props.data?.statusReasons.filter(reason => reason.statusCode !== StepStatusCodes.DisconnectedStep)
    return { isNodeValid: (!validationErrors || validationErrors.length === 0), validationErrors}

  }, [props.data])

  const onHandleNode = (node?: NodeProps) => {
    nodeState.setInteractedNode(node)
  }

  const onEditClick = () => {
    onPreviewClose()
    onHandleNode(props)
    stepDrawerState.onOpen(true, props.type as ActionType)
  }

  const onAddClick = () => {
    if (isOverMaximumSteps) return
    onHandleNode(props)
    actionDrawerState.onOpen()
  }

  const onDeleteClick = () => {
    onPreviewClose()
    onHandleNode(props)
    stepDrawerState.onClose()

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Step' }),
        entityValue: $t(ActionTypeTitle[props.type as ActionType])
          ?? $t({ defaultMessage: 'Step' })
      },
      content:
        $t({ defaultMessage: 'Do you want to delete this step?' }),
      onOk: () => {
        deleteStep({ params: { policyId: workflowId, stepId: nodeId } }).unwrap()
      }
    })
  }

  const onDeleteStepClick = (selectedKey:string) => {
    onPreviewClose()
    onHandleNode(props)
    stepDrawerState.onClose()

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: selectedKey === 'deleteStepDescendants' ?
          $t({ defaultMessage: 'Action\'s Children' })
          : $t({ defaultMessage: 'Action' }),
        entityValue: $t(ActionTypeTitle[props.type as ActionType])
          ?? $t({ defaultMessage: 'Action' })
      },
      content: selectedKey === 'deleteStepDescendants' ?
        $t({ defaultMessage: 'Do you want to delete all children of this action?' })
        : $t({ defaultMessage: 'Do you want to delete this action?' }),
      onOk: () => {
        selectedKey === 'deleteStepDescendants' ?
          deleteStepDescendants({ params: { policyId: workflowId, stepId: nodeId } }).unwrap()
          : deleteAndDetachStep({ params: { policyId: workflowId, stepId: nodeId } }).unwrap()
      }
    })
  }

  const onPreviewClick = () => {
    setIsPreviewOpen(true)
  }

  const onPreviewClose = () => {
    setIsPreviewOpen(false)
  }

  const stepToolBar = (
    <Space size={12} direction={'horizontal'}>
      <Tooltip title={$t({ defaultMessage: 'Edit this action' })}>
        <Button
          size={'small'}
          type={'link'}
          rbacOpsIds={[getOpsApi(WorkflowUrls.patchAction)]}
          disabled={!hasAllowedOperations([getOpsApi(WorkflowUrls.patchAction)])}
          icon={<EditorToolbarIcon><EditOutlined/></EditorToolbarIcon>}
          onClick={onEditClick}
        />
      </Tooltip>
      <Tooltip title={$t({ defaultMessage: 'Preview this action' })}>
        <Button
          size={'small'}
          type={'link'}
          icon={<EditorToolbarIcon><EyeOpenOutlined/></EditorToolbarIcon>}
          onClick={onPreviewClick}
        />
      </Tooltip>
      <Tooltip title={$t({ defaultMessage: 'Delete this action' })}>
        {workflowValidationEnhancementFFToggle ?
          <Popover
            zIndex={1000}
            content={
              <UI.DeleteMenu
                theme='dark'
                selectable={false}
                onClick={(e) => onDeleteStepClick(e.key)}
                items={[
                  { key: 'deleteStep', label: $t({ defaultMessage: 'Delete Action Only' }) },
                  { key: 'deleteStepDescendants',
                    label: $t({ defaultMessage: 'Delete Action\'s Children' }) }
                ]}
              />}
            trigger={'hover'}
            placement={'bottomLeft'}
            color={'var(--acx-primary-black)'}
            overlayInnerStyle={{ backgroundColor: 'var(--acx-primary-black)' }}
          >
            <Button
              size={'small'}
              type={'link'}
              rbacOpsIds={[getOpsApi(WorkflowUrls.deleteAction)]}
              disabled={!hasAllowedOperations([getOpsApi(WorkflowUrls.deleteAction)])}
              icon={<EditorToolbarIcon><DeleteOutlined/></EditorToolbarIcon>}
            />
          </Popover>
          :
          <Button
            size={'small'}
            type={'link'}
            rbacOpsIds={[getOpsApi(WorkflowUrls.deleteAction)]}
            disabled={!hasAllowedOperations([getOpsApi(WorkflowUrls.deleteAction)])}
            icon={<EditorToolbarIcon><DeleteOutlined/></EditorToolbarIcon>}
            onClick={onDeleteClick}
          />
        }
      </Tooltip>
    </Space>)


  return (
    <UI.StepNode selected={props.selected}
      invalid={workflowValidationEnhancementFFToggle && !isNodeValid}>
      <Loader states={[
        { isLoading: false, isFetching: (isDeleteStepLoading
          || isDeleteDetachStepLoading || isDeleteStepDescendantsLoading) }
      ]}>
        {props.children}
      </Loader>

      {(isPreviewOpen && props?.data?.enrollmentActionId && workflowId) &&
        <WorkflowActionPreviewModal
          workflowId={workflowId}
          step={props?.data}
          onClose={onPreviewClose}
        />
      }

      {props.selected &&
        <Popover
          zIndex={1000}
          content={stepToolBar}
          trigger={'hover'}
          color={'var(--acx-primary-black)'}
          overlayInnerStyle={{ backgroundColor: 'var(--acx-primary-black)' }}
        >
          <UI.EditButton>
            <MoreVertical />
          </UI.EditButton>
        </Popover>
      }

      {props.selected &&
        <Tooltip
          title={isOverMaximumSteps
            ? $t({ defaultMessage: 'You have reached the maximum number of {number} steps' },
              { number: MaxAllowedSteps })
            : ''}
        >
          <UI.PlusButton
            onClick={onAddClick}
            disabled={isOverMaximumSteps ||
              !hasPermission({ rbacOpsIds: [getOpsApi(WorkflowUrls.createAction)] })}
          >
            <Plus />
          </UI.PlusButton>
        </Tooltip>

      }

      <Handle
        type='target'
        position={Position.Top}
      />

      <Handle
        type={'source'}
        position={Position.Bottom}
      />

      {(!isNodeValid && workflowValidationEnhancementFFToggle) &&
        <Tooltip
          showArrow={false}
          // @ts-ignore
          title={validationErrors?.map(reason =>
            <Row>{ reason.statusReason }</Row>)}>
          <UI.InvalidIcon>
            <WarningCircleSolid />
          </UI.InvalidIcon>
        </Tooltip>
      }

      {props.data.isStart &&
        <UI.FlagIcon
          offset={workflowValidationEnhancementFFToggle && !isNodeValid}>
          <StartFlag />
        </UI.FlagIcon>
      }

      {props.data.isEnd &&
        <UI.FlagIcon
          offset={workflowValidationEnhancementFFToggle && !isNodeValid}>
          <EndFlag />
        </UI.FlagIcon>
      }
    </UI.StepNode>
  )
}
