import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import { Node }    from 'reactflow'

import { Loader }                                                                                                                                                                                    from '@acx-ui/components'
import { ListSolid }                                                                                                                                                                                 from '@acx-ui/icons'
import { useGetUIConfigurationQuery, useGetWorkflowActionDefinitionListQuery, useGetWorkflowStepsByIdQuery, useLazyGetUIConfigurationBackgroundImageQuery, useLazyGetUIConfigurationLogoImageQuery } from '@acx-ui/rc/services'
import { ActionType, UIConfiguration, WorkflowStep, defaultConfiguration, toReactFlowData }                                                                                                          from '@acx-ui/rc/utils'

import { EnrollmentPortalDesignModal } from '../EnrollmentPortalDesignModal'

import { ActionNavigationDrawer } from './ActionNavigationDrawer'
import * as UI                    from './styledComponents'


export interface WorkflowActionPreviewProps {
  id: string
  step?: WorkflowStep
}
export function WorkflowActionPreview (props: WorkflowActionPreviewProps) {
  const [marked, setMarked] = useState({
    desk: true,
    tablet: false,
    mobile: false
  })
  const [screen, setScreen] = useState('desk')
  const { $t } = useIntl()
  const { id, step } = props
  const [selectedStepId, setSelectedStepId] = useState(step?.id)
  const [stepMap, setStepMap] = useState(new Map<string, WorkflowStep>())
  const [UIConfig, setUIConfig] = useState<UIConfiguration>(defaultConfiguration)
  const [portalVisible, setPortalVisible] = useState(false)
  const [navigatorVisible, setNavigatorVisible] = useState(false)
  const [nodes, setNodes] = useState<Node<WorkflowStep, ActionType>[]>([])
  const configurationQuery = useGetUIConfigurationQuery({ params: { id: id } })
  const [getUIConfigLogoImage] = useLazyGetUIConfigurationLogoImageQuery()
  const [getUIConfigBackgroundImage] = useLazyGetUIConfigurationBackgroundImageQuery()
  const fetchImage = async (imageType: string) => {
    if (imageType === 'logoImages')
      return getUIConfigLogoImage({ params: { id: id } } ).unwrap()
    else if (imageType === 'backgroundImages')
      return getUIConfigBackgroundImage({ params: { id: id } } ).unwrap()
    return Promise.resolve()
  }

  useEffect(()=>{
    if (configurationQuery.isLoading) return
    if (configurationQuery.data) {
      setUIConfig(configurationQuery.data)
      if(configurationQuery.data.uiStyleSchema.logoImageFileName) {
        fetchImage('logoImages')
          .then(res => {
            if (res) {
              setUIConfig({
                ...UIConfig!,
                logoImage: res.fileUrl
              })
            }
          })
      }

      if (configurationQuery.data.uiStyleSchema.backgroundImageName) {
        fetchImage('backgroundImages')
          .then(res => {
            if (res) {
              setUIConfig({
                ...UIConfig!,
                backgroundImage: res.fileUrl
              })
            }
          })
      }
    }
  }, [configurationQuery])

  const { data: actionDefsData, ...defQuery } = useGetWorkflowActionDefinitionListQuery({
    params: { pageSize: '1000', page: '0', sort: 'name,asc' }
  }, { skip: props.step !== undefined })


  const { data: stepsData, ...stepQuery } = useGetWorkflowStepsByIdQuery({
    params: { policyId: id, pageSize: '1000', page: '0', sort: 'id,ASC' }
  }, { skip: props.step !== undefined })

  useEffect(() => {
    if (!actionDefsData || !stepsData ) return

    const defsMap = actionDefsData?.content
      ?.reduce((map, def) => map.set(def.id, def.actionType), new Map())
    const { nodes } = toReactFlowData(stepsData?.content, defsMap)
    setNodes(nodes as Node<WorkflowStep, ActionType>[])
    setStepMap(new Map<string, WorkflowStep>(stepsData?.content.map(v => [v.id, v])))
    setSelectedStepId(nodes.find(node => node.type !== 'START' as ActionType)?.data.id)
  }, [stepsData, actionDefsData])

  useEffect(()=>{
    if (step) {
      setNodes([{
        id: step.id,
        type: step.actionType,
        position: { x: 0, y: 0 },
        data: {
          ...step,
          isStart: false,
          isEnd: false
        }
      }])
      setStepMap(map => map.set(step.id, step))
    }

  }, [step])

  return (
    <Loader states={[stepQuery, defQuery, configurationQuery]}>
      <div style={{ width: '100%', minWidth: 1100, height: '100%', minHeight: 800 }}>
        <UI.LayoutHeader>
          <div style={{ display: 'flex' }}>
            <div
              style={{ flex: '0 0 365px', display: 'flex', paddingTop: 4 }}>
              <div style={{ fontSize: 16, color: 'var(--acx-primary-black)', fontWeight: 600 }}>
                {$t({ defaultMessage: 'Action Preview:' })}
              </div>
              <div style={{ fontSize: 16, color: 'var(--acx-primary-black)', marginLeft: '4px' }}>
                {$t({ defaultMessage: `{
                    type, select,
                    AUP {Acceptable Use Policy (AUP)}
                    DATA_PROMPT {Display a Form}
                    DISPLAY_MESSAGE {Custom Message}
                    other {}
                  }` }, {
                  type: stepMap.get(selectedStepId ?? '')?.actionType
                })}
              </div>
              <div style={{ marginLeft: '8px' }}
                onClick={()=>setNavigatorVisible(!navigatorVisible)}>
                <ListSolid/>
              </div>
            </div>
            <div style={{ flex: 'auto', textAlign: 'center' }}>
              <UI.DesktopOutlined $marked={marked.desk}
                title='deskicon'
                onClick={()=>{
                  setScreen('desk')
                  setMarked({ desk: true, tablet: false, mobile: false })
                }}/>
              <UI.TabletOutlined $marked={marked.tablet}
                title='tableticon'
                onClick={()=>{
                  setScreen('tablet')
                  setMarked({ desk: false, tablet: true, mobile: false })
                }}/>
              <UI.MobileOutlined $marked={marked.mobile}
                title='mobileicon'
                onClick={()=>{
                  setScreen('mobile')
                  setMarked({ desk: false, tablet: false, mobile: true })
                }}/>
            </div>
            <div
              style={{
                flex: '0 0 513px',
                textAlign: 'right',
                verticalAlign: 'middle',
                paddingRight: 80,
                paddingTop: 4
              }}>
              <div>
                <UI.Button type='default'
                  size='small'
                  style={{ fontSize: '14px' }}
                  onClick={()=>{
                    setNavigatorVisible(false)
                    setPortalVisible(true)
                  }}>
                  {$t({ defaultMessage: 'Portal Design' })}
                </UI.Button>
              </div>
            </div>
          </div>
        </UI.LayoutHeader>
        <UI.LayoutContent id={'actiondemocontent'} $isPreview={true} style={{ minHeight: '750px' }}>
          <UI.LayoutView $type={screen}
            style={{ backgroundImage: 'url("'+ UIConfig?.backgroundImage+'")',
              backgroundColor: UIConfig.uiColorSchema?.backgroundColor }}>
            <div>
              {selectedStepId && getStepPreview(stepMap.get(selectedStepId ?? ''))}
            </div>
          </UI.LayoutView>
        </UI.LayoutContent>
      </div>
      {<ActionNavigationDrawer
        visible={navigatorVisible}
        onClose={()=>setNavigatorVisible(false)}
        selectedStepId={selectedStepId}
        nodes={nodes}
        onSelect={(v:string)=>setSelectedStepId(v)}
      />}
      {
        portalVisible &&
        <EnrollmentPortalDesignModal
          id={id}
          onFinish={()=>setPortalVisible(false)}
        />
      }
    </Loader>
  )
}

function getStepPreview (step?: WorkflowStep) {
  if (!step) return undefined
  return<></>
}