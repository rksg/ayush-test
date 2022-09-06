
import { useState, useRef, useEffect, useContext } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import TextArea                                                      from 'antd/lib/input/TextArea'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { StepsForm, StepsFormInstance }                      from '@acx-ui/components'
import { Drawer }                                            from '@acx-ui/components'
import { DHCPPool, networkWifiIpRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'
import { validationMessages }                                from '@acx-ui/utils'

import DHCPFormContext             from '../DHCPFormContext'
import { CancelButton, AddButton } from '../styledComponents'

import { OptionDetail } from './OptionDetail'
import { PoolList }     from './PoolTable'


export function PoolDetail () {
  const { $t } = useIntl()
  const intl = useIntl()
  const { Option } = Select
  const formRef = useRef<StepsFormInstance<DHCPPool>>()
  const form = Form.useFormInstance()
  const [ addOn, setAddOn ] = useState(false)
  const [selectedData, setSelectedData] = useState<DHCPPool>({
    id: 0,
    name: '',
    allowWired: false,
    ip: '',
    mask: '',
    primaryDNS: '',
    secondaryDNS: '',
    excludedRangeStart: '',
    excludedRangeEnd: '',
    dhcpOptions: [],
    leaseTime: 24,
    vlan: 300
  })
  const { updateSaveState, saveState } = useContext(DHCPFormContext)
  const nameValidator = async (value: string) => {
    const { id } = { ...formRef.current?.getFieldsValue(), ...selectedData }
    if(_.find(saveState.dhcpPools, (item)=>{return item.name === value && id !== item.id})){
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
    const dhcpPool = { ...selectedData, ...formRef.current?.getFieldsValue() }
    if(saveState.dhcpPools.length === 0){
      dhcpPool.id = new Date().getTime()
    }else if(dhcpPool.id === 0 && saveState.dhcpPools.length>0){
      dhcpPool.id = new Date().getTime()
    }
    const findIndex = _.findIndex(saveState.dhcpPools, (item)=>{return dhcpPool.id === item.id})
    if(findIndex > -1){
      saveState.dhcpPools[findIndex] = dhcpPool
    }
    else saveState?.dhcpPools?.push({ ...dhcpPool })

    updateSaveState({ ...saveState,...form.getFieldsValue() })
    if(addOn){
      formRef?.current?.setFieldsValue({ id: 0 })
      return
    }
    onClose()
    return true
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    updateSaveState({ ...saveState,...form.getFieldsValue() })
    formRef?.current?.resetFields()
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
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
            name='id'
            style={{ height: 0 }}
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
              { validator: (_, value) => subnetMaskIpRegExp(intl, value) }
            ]}
            children={<Input />}
          />
          <Form.Item
            required={false}
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
              <Select defaultValue={'Hours'} style={{ marginTop: 6 }}>
                <Option value={'Days'}>{$t({ defaultMessage: 'Days' })}</Option>
                <Option value={'Hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'Minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Space>
          </Form.Item>
          <Form.Item
            name='vlan'
            rules={[
              { required: true }
            ]}
            label={$t({ defaultMessage: 'VLAN' })}
            children={<InputNumber min={1} max={4094} style={{ width: '100%' }} required/>}
          />
          <Form.Item name='dhcpOptions' style={{ height: 0 }}></Form.Item>
        </Col>
        <OptionDetail optionData={selectedData.dhcpOptions}></OptionDetail>
        {selectedData.id === 0 &&<label><Input type={'checkbox'}
          checked={addOn}
          onClick={()=>{setAddOn(!addOn)}}
          style={{ width: '20px', top: '3px' }}/>{$t({ defaultMessage: 'Add other pool' })}</label>}
        <CancelButton key='Cancel'
          type='primary'
          onClick={onClose}
        >
          {$t({ defaultMessage: 'Cancel' })}
        </CancelButton>
        <AddButton key='add'
          type='primary'
          onClick={async ()=> {
            await formRef.current?.validateFields()
            updateSaveData()
          }
          }>
          {selectedData.id === 0 && $t({ defaultMessage: 'Add' })}
          {selectedData.id !== 0 && $t({ defaultMessage: 'Update' })}
        </AddButton>
      </Row>
    </StepsForm.StepForm>:null

  return (
    <>
      <PoolList poolData={saveState?.dhcpPools || []}
        updatePoolData={(poolsData: DHCPPool[]) => {
          updateSaveState({ ...saveState, ...{ dhcpPools: poolsData } })
        }}
        showPoolForm={(selectedPool: DHCPPool): void => {
          onOpen()
          formRef?.current?.setFieldsValue(selectedPool)
          setSelectedData({ ...selectedPool })

        }} />
      <Drawer
        title={$t({ defaultMessage: 'Add DHCP Pool' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        width={900}
      />
    </>

  )

}
