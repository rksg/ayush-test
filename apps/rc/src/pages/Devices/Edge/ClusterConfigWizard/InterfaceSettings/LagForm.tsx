import { useContext } from 'react'

import { Form, Space, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { useStepFormContext }     from '@acx-ui/components'
import { NodesTabs, TypeForm }    from '@acx-ui/rc/components'
import { ClusterNetworkSettings } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

export const LagForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const lagSettings = Form.useWatch('lagSettings', form) as ClusterNetworkSettings['lagSettings']
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

  const content = <Form.Item name='lagSettings'>
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => (
          <>
            {lagSettings.find(item => item.serialNumber === serialNumber)?.lags.length}
          </>
        )
      }
    />
  </Form.Item>

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}