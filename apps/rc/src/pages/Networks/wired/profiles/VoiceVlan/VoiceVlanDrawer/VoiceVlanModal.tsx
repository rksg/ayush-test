import { Col, Form, Input, Row, Select } from 'antd'

import { Modal }         from '@acx-ui/components'
import { VoiceVlanModalData, VoiceVlanPort } from '@acx-ui/rc/utils'
import { getIntl }       from '@acx-ui/utils'
import { useEffect, useState } from 'react'
import { DefaultOptionType } from 'antd/lib/select'

export function VoiceVlanModal (props:{
  visible: boolean,
  handleCancel: () => void
  editPorts: VoiceVlanModalData
  tableData: VoiceVlanPort[]
  setTableData: React.Dispatch<React.SetStateAction<VoiceVlanPort[]>>
}) {
  const { $t } = getIntl()
  const { visible, handleCancel, tableData, setTableData, editPorts } = props
  const [form] = Form.useForm()
  const [vlanOptions, setVlanOptions] = useState<DefaultOptionType[]>([])

  useEffect(() => {
    if(editPorts){
      const vlans = editPorts?.vlanOptions?.map(i => ({
        label:$t( { defaultMessage: 'VLAN-ID: {vlan}' }, { vlan: i }),
        value: i
      }))
      setVlanOptions(vlans || [])
    }
  }, [editPorts])

  const onOk = () => {
    form.submit()
  }

  const onFinish = async (value: { voiceVlan:string }) => {
    const currentPort = editPorts.ports[0]
    const currentTableCopy = [...tableData]
    currentTableCopy.forEach(item => {
      if(item.taggedPort == currentPort){
        item.voiceVlan = value.voiceVlan
      }
    })
    setTableData(currentTableCopy)
    handleCancel()
  }

  return <Modal
    title={$t({ defaultMessage: 'Set Voice VLAN' })}
    visible={visible}
    okText={$t({ defaultMessage: 'Set' })}
    onOk={onOk}
    onCancel={handleCancel}
  >
    <Row gutter={24}>
      <Col span={12}>
        <Form
          form={form}
          onFinish={onFinish}
          layout='vertical'
          validateTrigger='onBlur'
        >
          <Form.Item
            label={$t({ defaultMessage: 'Voice VLAN' })}
            name='voiceVlan'
            initialValue={''}
            validateFirst
            children={<Select
              options={vlanOptions}
              placeholder={$t({ defaultMessage: 'Select...' })}
            />}
          />
        </Form>
      </Col>
    </Row>
  </Modal>
}