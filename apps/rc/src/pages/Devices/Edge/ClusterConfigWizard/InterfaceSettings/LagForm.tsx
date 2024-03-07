import { useContext } from 'react'

import { Form, Input, Space, Typography } from 'antd'
import { useIntl }                        from 'react-intl'

import { NodesTabs, TypeForm } from '@acx-ui/rc/components'

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

  const content = <NodesTabs
    nodeList={clusterInfo?.edgeList}
    content={
      <Form.List
        name='lagSettings'
        initialValue={[{}]}
      >
        {(fields) => fields.map(
          () => <>
            <Form.Item name={[0, 'test1']} children={<Input />} />
            <Form.Item name={[0, 'test2']} children={<Input />} />
          </>
        )}
      </Form.List>
    }
  />

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}