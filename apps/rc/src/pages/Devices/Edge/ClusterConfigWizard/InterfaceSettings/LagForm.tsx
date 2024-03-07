import { useContext } from 'react'

import { Form, Space, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { NodesTabs, TypeForm }    from '@acx-ui/rc/components'
import { ClusterNetworkSettings } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

export const LagForm = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'LAG Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the LAG for all SmartEdges in this cluster 
      ({clusterName}) if needed, or click 'Next' to skip:` },
      { clusterName: clusterInfo?.name })}
    </Typography.Text>
  </Space>

  const content = <Form.Item
    name='lagSettings'
    children={<LagSettingView />}
  />

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}

interface LagSettingViewProps {
  value?: ClusterNetworkSettings['lagSettings']
  onChange?: (data: unknown) => void
}

const LagSettingView = (props: LagSettingViewProps) => {
  const { value, onChange } = props
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  return (
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => (
          <>
            {value?.find(item => item.serialNumber === serialNumber)?.lags.length}
          </>
        )
      }
    />
  )
}