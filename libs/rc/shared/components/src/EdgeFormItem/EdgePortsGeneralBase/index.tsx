import { ReactNode, useEffect, useState } from 'react'

import { Form, FormInstance } from 'antd'
import _                      from 'lodash'
import { useIntl }            from 'react-intl'

import { Tabs, Tooltip }                                                               from '@acx-ui/components'
import { EdgeLag, EdgePort, EdgePortInfo, EdgePortWithStatus, getEdgePortDisplayName } from '@acx-ui/rc/utils'

import { PortConfigForm } from './PortConfigForm'

export interface EdgePortConfigFormType {
  [portId: string]: EdgePortWithStatus[]
}

interface TabData {
  label: string
  value: string
  content: ReactNode
  isLagPort?: boolean
}

interface PortsGeneralProps<T> {
  statusData: EdgePortInfo[]
  lagData?: EdgeLag[]
  isEdgeSdLanRun: boolean
  form: FormInstance<T>
  activeTab?: string
  onTabChange?: (activeTab: string) => void
  fieldHeadPath?: string[]
}

export const EdgePortsGeneralBase = <T,>(props: PortsGeneralProps<T>) => {
  const {
    statusData,
    lagData,
    isEdgeSdLanRun,
    activeTab,
    onTabChange,
    fieldHeadPath = []
  } = props
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState<string>('')
  const form = Form.useFormInstance()
  const data = (fieldHeadPath
    ? _.get(form.getFieldsValue(true), fieldHeadPath)
    : form.getFieldsValue(true)) as { [portId:string ]: EdgePort[] }

  let unLagPort = ''
  let tabs = [] as TabData[]
  Object.keys(data).forEach((formlistItemKey) => {
    const portConfig = data[formlistItemKey][0]
    const innerPortFormID = portConfig.interfaceName!
    const portStatus = _.find(statusData, { portName: portConfig.interfaceName })

    tabs.push({
      label: getEdgePortDisplayName(portConfig),
      value: innerPortFormID,
      content: <Form.List name={fieldHeadPath.concat([innerPortFormID])}>
        {(fields) => fields.map(
          ({ key }) => <PortConfigForm
            formRef={form}
            formListItemKey={key+''}
            fieldHeadPath={fieldHeadPath.concat([innerPortFormID, `${key}`])}
            portsDataRootPath={fieldHeadPath}
            key={`${innerPortFormID}_${key}`}
            id={portConfig.interfaceName!}
            isEdgeSdLanRun={isEdgeSdLanRun}
            statusData={portStatus}
            lagData={lagData}
          />
        )}
      </Form.List>,
      isLagPort: portStatus?.isLagMember
    })

    if(!unLagPort && !portStatus?.isLagMember) {
      unLagPort = innerPortFormID
    }
  })



  // TODO: is needed?
  // useEffect(() => {
  //   if(!dataRef.current) {
  //     dataRef.current = data
  //     return
  //   }
  //   if(!isEqual(dataRef.current, data)) {
  //     dataRef.current = data
  //     form.resetFields()
  //   }
  // }, [data])

  useEffect(() => {
    setCurrentTab(unLagPort)
  }, [unLagPort])

  const handleTabChange = (value: string) => {
    (activeTab ? onTabChange : setCurrentTab)?.(value)
  }

  return <Tabs
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
}