import React, { useState } from 'react'

import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { Drawer, Tabs } from '@acx-ui/components'
import { ActionType }   from '@acx-ui/rc/utils'

import { RequiredDependency } from '../WorkflowPanel'

import ActionsLibrary   from './ActionsLibrary'
import WorkflowsLibrary from './WorkflowsLibrary'


interface ActionsLibraryDrawerProps {
  visible: boolean,
  onClose: () => void,
  onClickAction: (type: ActionType) => void,
  relationshipMap: Partial<Record<ActionType, RequiredDependency>>
  existingActionTypes?: Set<ActionType>,
  workflowId: string,
  priorNode?: NodeProps
}

export enum LibraryType {
  ACTIONS = 'ACTIONS',
  WORKFLOWS = 'WORKFLOWS'
}

export default function ActionsLibraryDrawer (props: ActionsLibraryDrawerProps) {
  const { $t } = useIntl()

  const {
    relationshipMap,
    existingActionTypes = new Set(),
    onClose,
    onClickAction,
    workflowId,
    priorNode,
    visible
  } = props

  const [activeKey, setActiveKey] = useState(LibraryType.ACTIONS)

  const onTabChange = (tab: string) => {
    setActiveKey(LibraryType[tab as keyof typeof LibraryType])
  }

  return (
    <Drawer
      width={650}
      visible={visible}
      onClose={onClose}
      children={
        <Tabs onChange={onTabChange} activeKey={activeKey}>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Actions Library' })}
            key={LibraryType.ACTIONS}
            children={<ActionsLibrary
              onClickAction={onClickAction}
              existingActionTypes={existingActionTypes}
              relationshipMap={relationshipMap}/>
            }
          />
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Workflows Library' })}
            key={LibraryType.WORKFLOWS}
            children={<WorkflowsLibrary
              onClose={onClose}
              workflowId={workflowId}
              stepId={priorNode?.id}
            />}
          />
        </Tabs>
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{ cancel: $t({ defaultMessage: 'Close' }) }}
          onCancel={onClose}
        />}
    />
  )
}
