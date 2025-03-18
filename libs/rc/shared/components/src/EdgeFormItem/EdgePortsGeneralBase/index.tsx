import { ReactNode, useEffect, useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Tabs, Tooltip } from '@acx-ui/components'
import { Features }      from '@acx-ui/feature-toggle'
import {
  ClusterNetworkSettings,
  EdgeLag, EdgePort,
  EdgePortInfo,
  EdgePortWithStatus,
  getEdgePortDisplayName,
  isInterfaceInVRRPSetting,
  validateEdgeGateway
} from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady }   from '../../useEdgeActions'
import { EdgePortCommonFormProps } from '../PortCommonForm'

import { PortConfigForm } from './PortConfigForm'
import * as UI            from './styledComponents'

export interface EdgePortConfigFormType {
  [portId: string]: EdgePortWithStatus[]
}

interface TabData {
  label: string
  value: string
  content: ReactNode
  isLagPort?: boolean
}

interface PortsGeneralProps extends Pick<EdgePortCommonFormProps, 'formFieldsProps'> {
  statusData?: EdgePortInfo[]
  lagData?: EdgeLag[]
  isEdgeSdLanRun: boolean
  activeTab?: string
  onTabChange?: (activeTab: string) => void
  fieldHeadPath?: string[]
  isCluster?: boolean
  vipConfig?: ClusterNetworkSettings['virtualIpSettings']
}

export const EdgePortsGeneralBase = (props: PortsGeneralProps) => {
  const {
    statusData,
    lagData,
    isEdgeSdLanRun,
    activeTab,
    onTabChange,
    fieldHeadPath = [],
    isCluster,
    formFieldsProps,
    vipConfig = []
  } = props
  const { $t } = useIntl()
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const [currentTab, setCurrentTab] = useState<string>('')
  const form = Form.useFormInstance()
  const data = (fieldHeadPath.length
    ? _.get(form.getFieldsValue(true), fieldHeadPath)
    : form.getFieldsValue(true)) as { [portId:string ]: EdgePort[] }

  let unLagPort = ''
  let tabs = [] as TabData[]
  Object.keys(data)?.forEach((formlistItemKey) => {
    const portConfig = data[formlistItemKey][0]
    const innerPortFormID = portConfig.interfaceName!
    const portStatus = _.find(statusData, { portName: portConfig.interfaceName })
    const isLagPort = lagData?.some(lag => lag.lagMembers
      ? lag.lagMembers.filter(member => member?.portId === portConfig.id)[0]
      : false)

    tabs.push({
      label: getEdgePortDisplayName(portConfig),
      value: innerPortFormID,
      content: <Form.List name={fieldHeadPath.concat([innerPortFormID])}>
        {(fields) => fields.map(
          ({ key }) => <PortConfigForm
            formListItemKey={key+''}
            fieldHeadPath={fieldHeadPath.concat([innerPortFormID, `${key}`])}
            key={`${innerPortFormID}_${key}`}
            id={portConfig.interfaceName!}
            isEdgeSdLanRun={isEdgeSdLanRun}
            statusData={portStatus}
            lagData={lagData}
            isCluster={isCluster}
            formFieldsProps={
              {
                ...formFieldsProps,
                portType: {
                  ..._.get(formFieldsProps, 'portType'),
                  disabled: isInterfaceInVRRPSetting(
                    portStatus?.serialNumber ?? '',
                    innerPortFormID,
                    vipConfig
                  )
                }
              }
            }
          />
        )}
      </Form.List>,
      isLagPort: isLagPort
    })

    if(!unLagPort && !isLagPort) {
      unLagPort = innerPortFormID
    }
  })

  useEffect(() => {
    setCurrentTab(unLagPort)
  }, [unLagPort])

  const handleTabChange = (value: string) => {
    (activeTab ? onTabChange : setCurrentTab)?.(value)
  }

  return <>
    <UI.StyledHiddenFormItem
      name='validate'
      rules={[
        { validator: () => {
          const allPortsValues = (fieldHeadPath.length
            ? _.get(form.getFieldsValue(true), fieldHeadPath)
            : form.getFieldsValue(true)) as { [portId:string ]: EdgePort[] }
          const portsData =_.flatten(Object.values(allPortsValues)) as EdgePort[]
          return validateEdgeGateway(portsData, lagData ?? [], isDualWanEnabled)
        } }
      ]}
      children={<input hidden/>}
    />
    <Tabs
      activeKey={activeTab || currentTab}
      onChange={handleTabChange}
      type='third'
    >
      { tabs.map(item =>
        <Tabs.TabPane
          tab={
            item.isLagPort ?
              <Tooltip title={$t({ defaultMessage: `This port is a LAG member 
                          and cannot be configured independently.` })}>
                {item.label}
              </Tooltip> :
              item.label
          }
          key={item.value}
          disabled={item.isLagPort} >
          {item.content}
        </Tabs.TabPane>
      )}
    </Tabs>
  </>
}