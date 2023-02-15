import { useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Radio, RadioChangeEvent,Row,Select } from 'antd'
import { useIntl }                                                           from 'react-intl'

import { Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import {
  AclExtendedRule,
  AclStandardRule,
  SwitchModelPortData,
  TrustedPort,
  validateSwitchStaticRouteIp
} from '@acx-ui/rc/utils'

import { SelectModelStep }   from './SelectModelStep'
import { TaggedPortsStep }   from './TaggedPortsStep'
import { UntaggedPortsStep } from './UntaggedPortsStep'
import VlanPortsContext      from './VlanPortsContext'

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
  switchFamilyModels?: SwitchModelPortData
  trustedPorts: TrustedPort[]
}

export function VlanPortsModal (props: {
  open: boolean,
  aclType: string,
  onSave:(values: SwitchModelPortData)=>void,
  onCancel?: ()=>void,
  editRecord?: SwitchModelPortData
  currrentRecords?: SwitchModelPortData[]
}) {
  const { Option } = Select
  const { $t } = useIntl()
  const { onSave } = props
  const [form] = Form.useForm()
  const [sourceSpecific, setSourceSpecific] = useState(false)
  const [destinationSpecific, setDestinationSpecific] = useState(false)
  const [disabledField, setDisabledField] = useState(true)
  const [visible, setVisible] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({ family: '', model: '', trustedPorts: [] })

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
      <VlanPortsContext.Provider value={{ vlanSettingValues, setVlanSettingValues }}>
        <StepsForm
          onCancel={() => {
            showToast({ type: 'info', content: 'Cancel' })
            setVisible(false)
          }}
          onFinish={async (data) => {
            console.log(data)
            const switchFamilyModelsData = data.switchFamilyModels
            onSave(switchFamilyModelsData)
            await wait(1000) // mimic external service call
            showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
            setVisible(false)
          }}
        >
          <StepsForm.StepForm
            title='Select Model'
            onFinish={async (data) => {
              console.log(vlanSettingValues, data)
              setVlanSettingValues(data)
              return true
            }}
          >
            <SelectModelStep />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            title='Untagged Ports'
            onFinish={async (data) => {
              setVlanSettingValues({
                ...vlanSettingValues,
                switchFamilyModels: {
                  ...vlanSettingValues.switchFamilyModels,
                  ...data.switchFamilyModels
                }
              })
              return true
            }}
          >
            <UntaggedPortsStep />
          </StepsForm.StepForm>
          <StepsForm.StepForm title='Tagged Ports'>
            <TaggedPortsStep />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </Modal>
  )
}