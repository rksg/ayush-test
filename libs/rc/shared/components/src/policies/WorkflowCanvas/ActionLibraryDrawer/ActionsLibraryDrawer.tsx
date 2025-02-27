import React from 'react'

import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { Drawer }     from '@acx-ui/components'
import { ActionType } from '@acx-ui/rc/utils'

import { RequiredDependency } from '../WorkflowPanel'

import ActionsLibraryTabs from './ActionsLibraryTabs'


interface ActionsLibraryDrawerProps {
  visible: boolean,
  onClose: () => void,
  onClickAction: (type: ActionType) => void,
  relationshipMap: Partial<Record<ActionType, RequiredDependency>>
  existingActionTypes?: Set<ActionType>,
  onConfigureClose: () => void,
  workflowId: string,
  priorNode?: NodeProps
}

export default function ActionsLibraryDrawer (props: ActionsLibraryDrawerProps) {
  const { $t } = useIntl()
  const {
    visible,
    onClose
  } = props

  return (
    <Drawer
      width={650}
      visible={visible}
      onClose={onClose}
      children={
        <ActionsLibraryTabs {...props}/>
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{ cancel: $t({ defaultMessage: 'Close' }) }}
          onCancel={onClose}
        />}
    />
  )
}
