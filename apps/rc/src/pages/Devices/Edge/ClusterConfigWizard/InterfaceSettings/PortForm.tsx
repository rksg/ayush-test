import { useContext } from 'react'

import { Form, Input, Space, Typography } from 'antd'
import { useIntl }                        from 'react-intl'

import { NodesTabs, TypeForm } from '@acx-ui/rc/components'

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

  const content = <NodesTabs
    nodeList={clusterInfo?.edgeList}
    content={
      <Form.List
        name='portSettings'
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