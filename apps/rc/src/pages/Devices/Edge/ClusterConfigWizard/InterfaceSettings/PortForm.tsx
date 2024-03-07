import { useContext } from 'react'

import { Form, Space, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { NodesTabs, TypeForm }    from '@acx-ui/rc/components'
import { ClusterNetworkSettings } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

export const PortForm = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Port General Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Configure the port general settings for 
      all SmartEdges in this cluster ({clusterName}):` },
      { clusterName: clusterInfo?.name })}
    </Typography.Text>
  </Space>

  const content = <Form.Item
    name='portSettings'
    children={<PortSettingView />}
  />

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}

interface PortSettingViewProps {
  value?: ClusterNetworkSettings['portSettings']
  onChange?: (data: unknown) => void
}

const PortSettingView = (props: PortSettingViewProps) => {
  const { value, onChange } = props
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  return (
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => (
          <>
            {value?.find(item => item.serialNumber === serialNumber)?.ports.length}
          </>
        )
      }
    />
  )
}