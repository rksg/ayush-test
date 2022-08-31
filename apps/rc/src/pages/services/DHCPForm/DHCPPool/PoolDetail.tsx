
import { useState, useRef } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, StepsForm, StepsFormInstance, Subtitle } from '@acx-ui/components'
import { DHCPPool }            from '@acx-ui/rc/utils'
import TextArea from 'antd/lib/input/TextArea'
import PoolDetailContext from './PoolDetailContext'
import { Drawer } from '@acx-ui/components'
import { OptionDetail } from './OptionDetail'

export function PoolDetail() {
  const { $t } = useIntl()
  const { Option } = Select
  const formRef = useRef<StepsFormInstance<DHCPPool>>()
  const [state] = useState()
  const [saveState, updateSaveState] = useState<DHCPPool>({
    name: '',
    allowWired: false,
    ip: '',
    mask: '',
    primaryDNS: '',
    secondaryDNS: '',
    dhcpOptions: [],
    leaseTime: 24,
    vlan: 300
  })
  const transferProps = (props: Partial<typeof state>) => {

  }
  const data = { ...saveState }
  const checkprops = () =>{
    const aa = formRef
  }
  const nameValidator = async (value: string) => {
    // const payload = { ...serviceListPayload, searchString: value }
    // const list = (await getServiceList({ params, payload }, true)
    //   .unwrap()).data.map(n => ({ name: n.name }))
    // return checkObjectNotExists(list, value, 'Service')
    return Promise.resolve()
  }
  const updateSaveData = (saveData: Partial<DHCPPool>) => {
    updateSaveState({ ...saveState, ...saveData })
  }

  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const getContent =
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
              { validator: (_, value) => { return value ? Promise.resolve() : Promise.reject() } }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='mask'
            label={$t({ defaultMessage: 'Subnet Mask' })}
            rules={[
              { required: true },
              { validator: (_, value) => { return value ? Promise.resolve() : Promise.reject() } }
            ]}
            children={<Input />}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Excluded Range' })}
          >
            <Space><Form.Item name='excludedRangeStart'><Input /></Form.Item>-
              <Form.Item
                name='excludedRangeEnd'
              >
                <Input />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item
            name='primaryDNS'
            label={$t({ defaultMessage: 'Primary DNS IP' })}
            rules={[
              { validator: (_, value) => { return (value) ? Promise.resolve() : Promise.reject() } }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='secondaryDNS'
            label={$t({ defaultMessage: 'Secondary DNS IP' })}
            rules={[
              { validator: (_, value) => { return (value) ? Promise.resolve() : Promise.reject() } }
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
        <Button key='add' type='primary' onClick={() => checkprops()}>
          {$t({ defaultMessage: 'Add' })}
        </Button>
      </Row>
    </StepsForm.StepForm>

  return (
    <
    >
      <Form.Item
        name='tags'
        label={$t({ defaultMessage: 'Set DHCP Pools' })}
        children={<Button
          onClick={onOpen}>{$t({ defaultMessage: 'Add DHCP Pool' })}</Button>}
      />
      <Drawer
        title={$t({ defaultMessage: 'Add DHCP Pool' })}
        visible={visible}
        onClose={onClose}
        children={getContent}
        width={900}
      />

    </>
  )

}
