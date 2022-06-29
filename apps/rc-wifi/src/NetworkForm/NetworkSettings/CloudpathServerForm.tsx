import React from 'react'

import {
  Form,
  Input,
  Select,
  Typography
} from 'antd'

import { Button }                from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'

const { Option } = Select

export function CloudpathServerForm () {
  const selectedId = Form.useWatch('cloudpathServerId')
  const { selectOptions, selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selectOptions: data?.map(item => <Option key={item.id}>{item.name}</Option>) ?? [],
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })

  return (
    <React.Fragment>
      <Form.Item
        name='cloudpathServerId'
        label='Cloudpath Server'
        rules={[{ required: true }]}>
        <Select placeholder='Select...' children={selectOptions} />
      </Form.Item>

      <Button type='link' style={{ padding: 0 }}>Add Server</Button>

      {selected && (<>
        <Form.Item
          label='Deployment Type'
          children={selected.deploymentType}
        />
        <Typography.Title level={4}>
          Radius Authentication Service
        </Typography.Title>
        <Form.Item
          label='IP Address'
          children={
            selected.authRadius.primary.ip +
            ':' +
            selected.authRadius.primary.port
          }
        />
        <Form.Item
          label='Radius Shared secret'
          children={<Input.Password
            readOnly
            bordered={false}
            value={selected.authRadius.primary.sharedSecret}
          />}
        />
      </>)}
    </React.Fragment>
  )
}
