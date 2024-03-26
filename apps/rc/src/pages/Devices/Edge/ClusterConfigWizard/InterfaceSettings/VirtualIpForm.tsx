import { useContext, useEffect } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { toLower }                     from 'lodash'
import { useIntl }                     from 'react-intl'

import { useStepFormContext }                        from '@acx-ui/components'
import { EdgeClusterVirtualIpSettingForm, TypeForm } from '@acx-ui/rc/components'
import { EdgePortInfo }                              from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { InterfaceSettingsFormType } from './types'
import { getLanInterfaces }          from './utils'

export const VirtualIpForm = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const { form } = useStepFormContext()
  const lanInterfaces = getLanInterfaces(
    form.getFieldValue('lagSettings'),
    form.getFieldValue('portSettings'),
    clusterInfo
  )

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Cluster Virtual IP' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Please select the interfaces for SmartEdges 
      and assign virtual IPs for seamless failover:` })}
    </Typography.Text>
  </Space>

  const content = <Row>
    <Col span={14}>
      <EdgeClusterVirtualIpSettingForm
        currentClusterStatus={clusterInfo}
        lanInterfaces={lanInterfaces}
      />
    </Col>
  </Row>

  // merge lanInterfaces into vipConfig
  useEffect(() => {
    // eslint-disable-next-line max-len
    const currentVipConfig = form.getFieldValue('vipConfig') as InterfaceSettingsFormType['vipConfig']
    if(!currentVipConfig) return

    const editVipConfig = [] as InterfaceSettingsFormType['vipConfig']
    if(lanInterfaces) {
      for(let i=0; i < currentVipConfig.length; i++) {
        const currentConfig = currentVipConfig[i]
        const interfaces = {} as { [key: string]: EdgePortInfo }

        if(currentConfig.interfaces) {
          for(let serialNumber of Object.keys(currentConfig.interfaces)) {
            const config = currentConfig.interfaces[serialNumber]
            const tmp = lanInterfaces?.[config.serialNumber]?.find(item =>
              toLower(item.portName) === toLower(config.portName))
            interfaces[config.serialNumber] = tmp || {} as EdgePortInfo
          }
        }

        editVipConfig.push({
          vip: currentConfig.vip,
          interfaces
        })
      }
    }

    form.setFieldValue('vipConfig', editVipConfig)
  }, [])

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}
