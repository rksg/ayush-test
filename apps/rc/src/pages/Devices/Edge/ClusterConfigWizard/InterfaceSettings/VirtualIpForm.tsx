import { useContext } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { useStepFormContext }                        from '@acx-ui/components'
import { EdgeClusterVirtualIpSettingForm, TypeForm } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { getLanInterfaces } from './utils'

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

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}
