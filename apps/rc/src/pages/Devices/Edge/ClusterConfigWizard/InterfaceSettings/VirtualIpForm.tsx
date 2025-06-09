import { useContext } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { useStepFormContext }                                               from '@acx-ui/components'
import { Features }                                                         from '@acx-ui/feature-toggle'
import { EdgeClusterVirtualIpSettingForm, TypeForm, useIsEdgeFeatureReady } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import { transformFromApiToFormData } from '../SubInterfaceSettings/utils'

import { getAvailableVipInterfaces } from './utils'

export const VirtualIpForm = () => {
  const { $t } = useIntl()
  const { clusterInfo, clusterSubInterfaceSettings } = useContext(ClusterConfigWizardContext)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const { form } = useStepFormContext()

  const subInterfaceSettingsFormData = isEdgeCoreAccessSeparationReady ? {
    portSubInterfaces: form.getFieldValue('portSubInterfaces'),
    lagSubInterfaces: form.getFieldValue('lagSubInterfaces')
  } : transformFromApiToFormData(clusterSubInterfaceSettings)
  const lanInterfaces = getAvailableVipInterfaces(
    form.getFieldValue('lagSettings'),
    form.getFieldValue('portSettings'),
    subInterfaceSettingsFormData,
    clusterInfo
  )

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Cluster Virtual IP' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Please select the interfaces for RUCKUS Edges 
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
