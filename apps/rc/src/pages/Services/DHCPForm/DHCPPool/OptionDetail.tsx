import { useEffect, useState, useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Modal, StepsFormInstance } from '@acx-ui/components'
import {
  Button,
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPOption }         from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'


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

export function OptionDetail (props:{
  optionData: DHCPOption[]
}) {
  const style= {
    top: '20px',
    backgroundColor: 'transparent',
    right: '-500px',
    zIndex: '1',
    color: '#5496ea',
    fontWeight: 600,
    border: 0,
    cursor: 'pointer',
    fontSize: '14px'
  }
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const { optionData } = props
  const formRef = useRef<StepsFormInstance<DHCPOption>>()

  const [tableData, setTableData] = useState(optionData)
  const idValidator = async (value: number) => {
    if(_.find(tableData, (item)=>{return item.id === value})){
      const entityName = $t({ defaultMessage: 'Option ID' })
      const key = 'id'
      return Promise.reject($t(validationMessages.duplication, { entityName, key }))
    }
    return Promise.resolve()
  }
  const handleSaveData = () => {
    if(_.find(formRef.current?.getFieldsError(), (item)=>{return item.errors.length>0})){
      return false
    }
    const dhcpOption = formRef.current?.getFieldsValue()
    form.getFieldsValue()['dhcpOptions'].push({ ...dhcpOption })
    setTableData(form.getFieldsValue()['dhcpOptions'])
    onClose()
    return true
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    formRef?.current?.resetFields()
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const footer = [
    <Button key='back' onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>,
    <Button key='forward'
      onClick={
        ()=>{
          formRef.current?.validateFields()
          setTimeout(()=>handleSaveData(), 1000)
        }
      }>
      {$t({ defaultMessage: 'Save' })}
    </Button>
  ]
  const getContent=visible?<StepsForm.StepForm formRef={formRef}>
    <Row gutter={20}>
      <Col span={12}>
        <Form.Item
          name='id'
          label={$t({ defaultMessage: 'Option ID' })}
          rules={[
            { required: true },
            { validator: (_, value) => idValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Option Name' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='format'
          label={$t({ defaultMessage: 'Option Format' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='value'
          label={$t({ defaultMessage: 'Option value' })}
          rules={[
            { required: true },
            { validator: (_, value) => { return value ? Promise.resolve() : Promise.reject() } }
          ]}
          children={<Input />}
        />
      </Col>
    </Row>
  </StepsForm.StepForm>:null


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
      <p>{$t({ defaultMessage: 'Add DHCP options:' })}
        <Button key='addOpt'
          style={style}
          type='primary'
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
        width={400}
        footer={footer}
      >
        {getContent}
      </Modal>
    </Form.Item>
  )
}
