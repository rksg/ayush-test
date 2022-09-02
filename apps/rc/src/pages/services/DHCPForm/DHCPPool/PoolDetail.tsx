
import { useState, useRef, useEffect, useContext } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import TextArea                                                      from 'antd/lib/input/TextArea'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { Button, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { Drawer }                               from '@acx-ui/components'
import { DHCPPool, networkWifiIpRegExp }        from '@acx-ui/rc/utils'
import { validationMessages }                   from '@acx-ui/utils'

import DHCPFormContext from '../DHCPFormContext'

import { OptionDetail } from './OptionDetail'


export function PoolDetail (props:{
  visible: boolean,
  setVisible: (visible: boolean) => void,
  selectedData: DHCPPool,
}) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { Option } = Select
  const formRef = useRef<StepsFormInstance<DHCPPool>>()
  const form = Form.useFormInstance()

  const { updateSaveState, saveState } = useContext(DHCPFormContext)
  const nameValidator = async (value: string) => {
    if(_.find(saveState.dhcpPools, (item)=>{return item.name === value})){
      const entityName = intl.$t({ defaultMessage: 'Pool Name' })
      const key = 'name'
      return Promise.reject(intl.$t(validationMessages.duplication, { entityName, key }))
    }
    return Promise.resolve()
  }
  const updateSaveData = () => {
    if(_.find(formRef.current?.getFieldsError(), (item)=>{return item.errors.length>0})){
      return false
    }
    const dhcpPool = formRef.current?.getFieldsValue() || selectedData
    saveState?.dhcpPools?.push({ ...dhcpPool })

    updateSaveState(Object.assign({}, { ...saveState,...form.getFieldsValue() }))
    onClose()
    return true
  }

  const { visible, setVisible, selectedData } = props
  const onClose = () => {
    updateSaveState(Object.assign({}, { ...saveState,...form.getFieldsValue() }))
    formRef?.current?.resetFields()
    setVisible(false)
  }
  useEffect(() => {
    if (selectedData) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(selectedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData])
  const getContent = visible?
    <StepsForm.StepForm formRef={formRef}>
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Pool Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            children={<TextArea />}
          />
          <Form.Item
            name='allowWired'
            label={$t({ defaultMessage: 'Allow AP wired clients' })}
            children={<Switch defaultChecked={false}
            />}
          />
          <Form.Item
            name='ip'
            label={$t({ defaultMessage: 'IP Address' })}
            rules={[
              { required: true },
              { validator: (_, value) => networkWifiIpRegExp(intl, value) }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='mask'
            label={$t({ defaultMessage: 'Subnet Mask' })}
            rules={[
              { required: true },
              { validator: (_, value) => networkWifiIpRegExp(intl, value) }
            ]}
            children={<Input />}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Excluded Range' })}
          >
            <Space><Form.Item name='excludedRangeStart'
              rules={[
                { required: false },
                { validator: (_, value) => networkWifiIpRegExp(intl, value) }
              ]}
              children={<Input/>}
            />-
            <Form.Item
              name='excludedRangeEnd'
              rules={[
                { required: false },
                { validator: (_, value) => networkWifiIpRegExp(intl, value) }
              ]}
              children={<Input />}
            />
            </Space>
          </Form.Item>
          <Form.Item
            name='primaryDNS'
            label={$t({ defaultMessage: 'Primary DNS IP' })}
            rules={[
              { validator: (_, value) => networkWifiIpRegExp(intl, value) }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='secondaryDNS'
            label={$t({ defaultMessage: 'Secondary DNS IP' })}
            rules={[
              { validator: (_, value) => networkWifiIpRegExp(intl, value) }
            ]}
            children={<Input />}
          />
          <Form.Item>
            <Space>
              <Form.Item
                name='leaseTime'
                rules={[
                  { required: true }
                ]}
                label={$t({ defaultMessage: 'Lease Time' })}
              >
                <InputNumber min={1} max={1440} style={{ width: '100%' }} />
              </Form.Item>
              <Select defaultValue={'Hours'}>
                <Option value={'Hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'Minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Space>
          </Form.Item>
          <Form.Item
            name='vlan'
            label={$t({ defaultMessage: 'VLAN' })}
            children={<InputNumber min={1} max={300} style={{ width: '100%' }} />}
          />
        </Col>
        <OptionDetail></OptionDetail>
        <Button key='Cancel' type='primary' onClick={onClose}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
        <Button key='add'
          type='primary'
          onClick={()=>{
            formRef.current?.validateFields()
            setTimeout(()=>updateSaveData(), 1000)
          }
          }>
          {$t({ defaultMessage: 'Add' })}
        </Button>
      </Row>
    </StepsForm.StepForm>:null

  return (

    <Drawer
      title={$t({ defaultMessage: 'Add DHCP Pool' })}
      visible={visible}
      onClose={onClose}
      children={getContent}
      width={900}
    />

  )

}
