import { useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Radio, RadioChangeEvent,Row,Select } from 'antd'
import { useIntl }                                                           from 'react-intl'

import { Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import {
  AclExtendedRule,
  AclStandardRule,
  validateSwitchStaticRouteIp
} from '@acx-ui/rc/utils'

import { SelectModelStep } from './SelectModelStep'
import { UntaggedPortsStep } from './UntaggedPortsStep'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export interface VlanSettingInterface {
  enableSlot2?: boolean
  enableSlot3?: boolean
  enableSlot4?: boolean
  family: string
  model: string
  selectedOptionOfSlot2?: string
  selectedOptionOfSlot3?: string
  selectedOptionOfSlot4?: string
}

export function VlanPortsModal (props: {
  open: boolean,
  aclType: string,
  onSave?:(values: AclStandardRule | AclExtendedRule)=>void,
  onCancel?: ()=>void,
  editRecord?: AclStandardRule | AclExtendedRule
  currrentRecords?: AclStandardRule[] | AclExtendedRule[]
}) {
  const { Option } = Select
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [sourceSpecific, setSourceSpecific] = useState(false)
  const [destinationSpecific, setDestinationSpecific] = useState(false)
  const [disabledField, setDisabledField] = useState(true)
  const [visible, setVisible] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({ family: '', model: '' })

  useEffect(()=>{
    form.resetFields()
    setSourceSpecific(false)
    setDestinationSpecific(false)
    if (props.open && props.editRecord) {
      form.setFieldsValue(props.editRecord)
    }
  }, [form, props.open, props.editRecord])

  const onSrcSourceChange = (e: RadioChangeEvent) => {
    setSourceSpecific(e.target.value === 'specific')
  }

  const onDestSourceChange = (e: RadioChangeEvent) => {
    setDestinationSpecific(e.target.value === 'specific')
  }

  const onProtocolChange = function (value: string) {
    setDisabledField(value === 'ip')
  }

  return (
    <Modal
      visible={props.open}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={props.onCancel}
      destroyOnClose={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
    >
      <StepsForm
        onCancel={() => {
          showToast({ type: 'info', content: 'Cancel' })
          setVisible(false)
        }}
        onFinish={async (data) => {
          console.log(data)
          await wait(1000) // mimic external service call
          showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
          setVisible(false)
        }}
      >
        <StepsForm.StepForm
          title='Select Model'
          onFinish={async (data) => {
            setVlanSettingValues(data)
            console.log(data)
            return true
          }}
        >
          <SelectModelStep />
        </StepsForm.StepForm>
        <StepsForm.StepForm title='Untagged Ports'>
          <UntaggedPortsStep vlanSettings={vlanSettingValues} />
        </StepsForm.StepForm>
        <StepsForm.StepForm title='Tagged Ports'>
          <Row gutter={20}>
            <Col span={10}>
              <StepsForm.Title children='Tagged Ports' />
              <Form.Item name='field8' label='Field 8'>
                <Input />
              </Form.Item>
              <Form.Item name='field9' label='Field 9'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </Modal>
  )
}