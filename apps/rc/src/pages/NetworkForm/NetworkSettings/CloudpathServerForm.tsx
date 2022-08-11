import React, { useContext } from 'react'

import {
  Form,
  Input,
  Select
} from 'antd'
import { useIntl } from 'react-intl'


import { Button, Subtitle }      from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'

import NetworkFormContext from '../NetworkFormContext'

const { Option } = Select

export function CloudpathServerForm () {
  const { editMode } = useContext(NetworkFormContext)
  const { $t } = useIntl()
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
        label={$t({ defaultMessage: 'Cloudpath Server' })}
        rules={[{ required: true }]}>
        <Select placeholder={$t({ defaultMessage: 'Select...' })}
          children={selectOptions}
          disabled={editMode} />
      </Form.Item>

      <Button type='link'>{ $t({ defaultMessage: 'Add Server' }) }</Button>

      {selected && (<>
        <Form.Item
          label={$t({ defaultMessage: 'Deployment Type' })}
          children={selected.deploymentType}
        />
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Radius Authentication Service' }) }
        </Subtitle>
        <Form.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            selected.authRadius.primary.ip +
            ':' +
            selected.authRadius.primary.port
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Radius Shared secret' })}
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
