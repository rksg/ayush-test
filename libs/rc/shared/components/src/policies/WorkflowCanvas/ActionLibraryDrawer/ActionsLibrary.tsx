
import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Collapse, GridCol, GridRow, Loader }      from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { useGetWorkflowActionDefinitionListQuery } from '@acx-ui/rc/services'
import { ActionType }                              from '@acx-ui/rc/utils'


import { RequiredDependency } from '../WorkflowPanel'

import ActionCard from './ActionCard'
import * as UI    from './styledComponents'

const { Panel } = Collapse

interface ActionLibraryProps {
  onClickAction: (type: ActionType) => void,
  relationshipMap: Partial<Record<ActionType, RequiredDependency>>
  existingActionTypes?: Set<ActionType>
}

const starterActions: ActionType[] = [
  ActionType.AUP,
  ActionType.DISPLAY_MESSAGE
]
const deviceOnboardingActions: ActionType[] = [
  ActionType.DPSK,
  ActionType.MAC_REG
]
const resultActions: ActionType[] = [
  ActionType.DATA_PROMPT
]

export default function ActionsLibrary (props: ActionLibraryProps) {
  const { $t } = useIntl()
  const {
    relationshipMap,
    existingActionTypes = new Set(),
    onClickAction
  } = props


  const isCertActionEnabled = useIsSplitOn(Features.WORKFLOW_CERTIFICATE_TEMPLATE_ACTION)
  const dynamicDeviceOnboardingActions = useMemo(() => {
    const actions = [...deviceOnboardingActions]

    if (isCertActionEnabled) {
      actions.push(ActionType.CERT_TEMPLATE)
    }

    return actions
  }, [deviceOnboardingActions, isCertActionEnabled])

  const { defMap, isDefLoading } = useGetWorkflowActionDefinitionListQuery({
    params: {
      pageSize: '1000',
      page: '0',
      sort: 'name,asc'
    }
  }, {
    selectFromResult: ({ data, isLoading }) => (
      {
        defMap: data?.content?.reduce((map, def) => map.set(def.actionType, def.id), new Map()),
        isDefLoading: isLoading
      }
    )
  })

  const onClick = (type: ActionType) => {
    if(defMap?.get(type)) {
      onClickAction(type)
    }
  }

  const isDenied = (actionType: ActionType): boolean => {
    const dependency = relationshipMap[actionType]

    if (dependency && dependency.type !== 'NONE') {
      switch (dependency.type) {
        case 'ONE_OF':
          return ![...dependency.required].some(item => existingActionTypes?.has(item))
        case 'ALL':
          return ![...dependency.required].every(item => existingActionTypes?.has(item))
      }
    }
    return false
  }

  return (
    <Loader
      states={[
        { isLoading: false, isFetching: isDefLoading }
      ]}
    >
      <UI.Collapse defaultActiveKey={[1, 2, 3]} ghost={true}>
        <Panel header={$t({ defaultMessage: 'User Interaction' })} key={1}>
          <GridRow>
            {starterActions.map(actionType =>
              <GridCol key={actionType.toString()} col={{ span: 12 }}>
                <ActionCard
                  actionType={actionType}
                  handleClick={onClick}
                  disabled={isDenied(actionType)}
                />
              </GridCol>
            )}
          </GridRow>
        </Panel>
        <Panel header={$t({ defaultMessage: 'Device Onboarding' })} key={2}>
          <GridRow>
            {dynamicDeviceOnboardingActions.map(actionType =>
              <GridCol key={actionType.toString()} col={{ span: 12 }}>
                <ActionCard
                  actionType={actionType}
                  handleClick={onClick}
                  disabled={isDenied(actionType)}
                />
              </GridCol>
            )}
          </GridRow>
        </Panel>
        <Panel header={$t({ defaultMessage: 'Operational' })} key={3}>
          <GridRow>
            {resultActions.map(actionType =>
              <GridCol key={actionType.toString()} col={{ span: 12 }}>
                <ActionCard
                  actionType={actionType}
                  handleClick={onClick}
                  disabled={isDenied(actionType)}
                />
              </GridCol>
            )}
          </GridRow>
        </Panel>
      </UI.Collapse>
    </Loader>
  )
}
