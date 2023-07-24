
import { useState, useEffect } from 'react'

import { Row, Col, Form, Select, Input } from 'antd'

import { Card }        from '@acx-ui/components'
import { TrustedPort } from '@acx-ui/rc/utils'
import { getIntl }     from '@acx-ui/utils'

import { VlanTrustPortInterface } from './index'
export interface PortsType {
  label: string,
  value: string
}

export function TrustedPortsStep (props: {
  vlanSettingValues: VlanTrustPortInterface,
  editRecord?: TrustedPort
}) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { vlanSettingValues, editRecord } = props
  const [portsModule1, setPortsModule1] = useState<PortsType[]>([])
  const [portsModule2, setPortsModule2] = useState<PortsType[]>([])
  const [portsModule3, setPortsModule3] = useState<PortsType[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if(vlanSettingValues){
      if(vlanSettingValues.switchFamilyModels?.slots[0] &&
        vlanSettingValues.switchFamilyModels?.slots[0].portStatus!== undefined){
        const portModule1List1 = vlanSettingValues.switchFamilyModels?.slots[0].portStatus?.map(
          ( item: { portNumber: number }) => ({
            label: `1/1/${item.portNumber.toString()}`,
            value: `1/1/${item.portNumber.toString()}`
          }))
        setPortsModule1(portModule1List1)
      }
      if(vlanSettingValues.switchFamilyModels?.slots[1] &&
        vlanSettingValues.switchFamilyModels?.slots[1].portStatus!== undefined){
        const portModule1List2 = vlanSettingValues.switchFamilyModels?.slots[1].portStatus?.map(
          ( item: { portNumber: number }) => ({
            label: `1/2/${item.portNumber.toString()}`,
            value: `1/2/${item.portNumber.toString()}`
          }))
        setPortsModule2(portModule1List2)
      }
      if(vlanSettingValues.switchFamilyModels?.slots[2] &&
        vlanSettingValues.switchFamilyModels?.slots[2].portStatus!== undefined){
        const portModule1List3 = vlanSettingValues.switchFamilyModels?.slots[2].portStatus?.map(
          ( item: { portNumber: number }) => ({
            label: `1/3/${item.portNumber.toString()}`,
            value: `1/3/${item.portNumber.toString()}`
          }))
        setPortsModule3(portModule1List3)
      }
      form.setFieldValue(['trustedPorts', 'model'], vlanSettingValues.switchFamilyModels?.model)
      form.setFieldValue(['trustedPorts', 'slots'], vlanSettingValues.switchFamilyModels?.slots)
    }
    if(editRecord){
      form.setFieldsValue({
        trustedPorts: {
          trustPorts: editRecord.trustPorts,
          model: editRecord.model,
          vlanDemand: editRecord.vlanDemand,
          slots: editRecord.slots
        },
        switchFamilyModels: editRecord
      })
      setSelected(editRecord.trustPorts)
    }
  }, [vlanSettingValues, editRecord])

  return (
    <>
      <Row gutter={20}>
        <Col>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col>
          <Card type='solid-bg'>
            <Row gutter={20}>
              <Col>
                <label style={{ color: 'var(--acx-neutrals-60)' }}>
                  {$t({ defaultMessage: 'Trusted Ports:' })}
                </label>
                <Form.Item
                  name={['trustedPorts', 'trustPorts']}
                  label={<label>{$t({ defaultMessage: 'You may select up to 4 ports' })}</label>}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please enter Trusted Ports' })
                  }]}
                  data-testid='trustPortsList'
                  children={
                    <Select
                      mode='multiple'
                      options={[
                        ...portsModule1,
                        ...portsModule2,
                        ...portsModule3
                      ]}
                      onChange={() => {
                        form.setFieldValue(['trustedPorts', 'trustPorts'],
                          form.getFieldValue(['trustedPorts', 'trustPorts']).slice(0, 4)
                        )
                        setSelected(form.getFieldValue(['trustedPorts', 'trustPorts']).slice(0, 4))
                      }}
                      style={{ width: '400px' }}
                    />}
                />
                {
                  $t({ defaultMessage: 'Selected Ports:' }) + ' ' + selected
                }
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Form.Item
        name={['trustedPorts', 'trustedPortType']}
        initialValue={'all'}
        hidden={true}
        children={<Input />}
      />
      <Form.Item
        name={['trustedPorts', 'model']}
        hidden={true}
        children={<Input />} />
      <Form.Item
        name={['trustedPorts', 'vlanDemand']}
        initialValue={false}
        hidden={true}
        children={<Input />} />
      <Form.Item
        name={['trustedPorts', 'slots']}
        hidden={true}
        children={<Input />} />
      {editRecord && <Form.Item name={'switchFamilyModels'} hidden={true} children={<Input />}/>}
    </>
  )
}