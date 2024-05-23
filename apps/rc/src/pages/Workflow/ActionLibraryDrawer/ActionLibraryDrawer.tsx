import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Collapse, Drawer, GridCol, GridRow, Loader } from '@acx-ui/components'
import { useGetWorkflowActionDefinitionListQuery }    from '@acx-ui/rc/services'
import { ActionType }                                 from '@acx-ui/rc/utils'


import * as UI                from '../WorkflowNode/styledComponents'
import { RequiredDependency } from '../WorkflowPanel'

import ActionCard from './ActionCard'

const { Panel } = Collapse

interface ActionLibraryProps {
  visible: boolean,
  onClose: () => void,
  onClickAction: (id: string, type: ActionType) => void,

  relationshipMap: Partial<Record<ActionType, RequiredDependency>>
  existingActionTypes?: Set<ActionType>
}


// TODO: Split each ActionType to related Toggle (Starter, Authorization, Results...)
const starterActions: ActionType[] = [
  ActionType.AUP,
  ActionType.DISPLAY_MESSAGE
]
const authorizationActions: ActionType[] = [ActionType.DPSK]
const resultActions: ActionType[] = [ActionType.DATA_PROMPT]

export default function ActionLibraryDrawer (props: ActionLibraryProps) {
  const { $t } = useIntl()
  const { visible, relationshipMap, existingActionTypes, onClose, onClickAction } = props

  const onClick = (type: ActionType) => {
    if(defMap?.get(type)) {
      onClickAction(defMap?.get(type), type)
    }
  }

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


  useEffect(() => {
    console.log('existingActionTypes = ', existingActionTypes)
    console.log('Definitions :: ', defMap)
    console.log('RelationshipMap :: ', relationshipMap)
  }, [existingActionTypes])

  const isDenied = (actionType: ActionType): boolean => {
    const dependency = relationshipMap[actionType]
    // console.log('isDenied ?', dependency, actionType)
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
    <Drawer
      title={$t({ defaultMessage: 'Actions Library' })}
      width={650}
      visible={visible}
      onClose={onClose}
      children={
        <Loader
          // FIXME: seems not working?? no loading state?!
          states={[
            { isLoading: isDefLoading, isFetching: isDefLoading }
          ]}
        >
          {/* TODO: if defMap not found, do not display the ActionCard */}
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
            <Panel header={$t({ defaultMessage: 'Authentication' })} key={2}>
              <GridRow>
                {authorizationActions.map(actionType =>
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
      }
      footer={<Drawer.FormFooter
        buttonLabel={{
          cancel: $t({ defaultMessage: 'Close' })
        }}
        onCancel={onClose}
      />}
    />
  )
}
