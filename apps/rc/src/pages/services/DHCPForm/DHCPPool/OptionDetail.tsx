import { useEffect, useState, useContext } from 'react'

import { Col, Form, Input, Row, Switch } from 'antd'
import _ from 'lodash'
import { useIntl } from 'react-intl'
import { Modal } from '@acx-ui/components'

import {
  Button,
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { useVenueListQuery } from '@acx-ui/rc/services'
import { useTableQuery, DHCPOption } from '@acx-ui/rc/utils'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'format',
    'value'
  ]
}

const defaultArray: DHCPOption[] = []

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export function OptionDetail() {
  const form = Form.useFormInstance()
  const options = Form.useWatch('options')

  const { $t } = useIntl()



  const [tableData, setTableData] = useState(defaultArray)

  const handleSaveData = () => {

    form.setFieldsValue({ dhcpOptions: [] })
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const footer = [
    <Button key='back' onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>,
    <Button key='forward' onClick={handleSaveData}>
      {$t({ defaultMessage: 'Save' })}
    </Button>
  ]
  const getContent=<StepsForm.StepForm>
    <Row gutter={20}>
      <Col span={12}>
        <Form.Item
          name='id'
          label={$t({ defaultMessage: 'Option ID' })}
          rules={[
            { required: true }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Option Name' })}
          children={<Input />}
        />
        <Form.Item
          name='format'
          label={$t({ defaultMessage: 'IP Address' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='value'
          label={$t({ defaultMessage: 'Subnet Mask' })}
          rules={[
            { required: true },
            { validator: (_, value) => { return value ? Promise.resolve() : Promise.reject() } }
          ]}
          children={<Input />}
        />
      </Col>
    </Row>
  </StepsForm.StepForm>
  useEffect(() => {
    setTableData(form.getFieldsValue()['dhcpOptions'] || [
      { id: 1, name: 'RLP Server', format: 'Hex', value: 'AA:BB:CC:DD:EE:FF' },
      { id: 2, name: 'NTP Servers', format: 'IP', value: '999.999.999.999/99' },
      { id: 3, name: 'DHCP Message', format: 'ASCII', value: 'Abdelfafdd' }
    ])
  }, [form])

  const columns: TableProps<DHCPOption>['columns'] = [
    {
      title: $t({ defaultMessage: 'Option ID' }),
      dataIndex: 'id',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Option Name' }),
      dataIndex: 'name',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Option Format' }),
      dataIndex: 'format',
      width: 10,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Option Value' }),
      width: 50,
      dataIndex: 'value'
    }
  ]

  return (


    <Form.Item name='dhcpOptions'>
      <p>{$t({ defaultMessage: 'Add DHCP options' })}
        <Button key='addOpt'
          type='primary'
          style={{ right: '-100px' }}
          onClick={onOpen}>
          {$t({ defaultMessage: 'Add option' })}
        </Button></p>
      <Loader>
        <Table
          rowKey='id'
          style={{ width: '800px' }}
          columns={columns}
          dataSource={[...tableData]}
          type={'tall'}

        />
      </Loader>
      <Modal
        title={$t({ defaultMessage: 'DHCP option' })}
        visible={visible}
        onCancel={onClose}
        width={800}
        footer={footer}
      >
        {getContent}
      </Modal>
    </Form.Item>
  )
}
