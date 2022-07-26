import React from 'react'

import {
  Form,
  Input,
  Select
} from 'antd'

import { Button, Subtitle }      from '@acx-ui/components'
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
    <>
      <Form.Item
        name='cloudpathServerId'
        label='Cloudpath Server'
        rules={[{ required: true }]}>
        <Select placeholder='Select...' children={selectOptions} />
      </Form.Item>

      <Button type='link'>Add Server</Button>

      {selected && (<>
        <Form.Item
          label='Deployment Type'
          children={selected.deploymentType}
        />
        <Subtitle level={4}>
          Radius Authentication Service
        </Subtitle>
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
    </>
  )
}
