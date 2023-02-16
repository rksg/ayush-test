import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import { Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import {
  SwitchModelPortData,
  TrustedPort,
  Vlan
} from '@acx-ui/rc/utils'

import { SelectModelStep }   from './SelectModelStep'
import { TaggedPortsStep }   from './TaggedPortsStep'
import { UntaggedPortsStep } from './UntaggedPortsStep'
import VlanPortsContext      from './VlanPortsContext'
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
  onSave:(values: SwitchModelPortData)=>void,
  onCancel?: ()=>void,
  editRecord?: SwitchModelPortData,
  currrentRecords?: SwitchModelPortData[],
  vlanList: Vlan[]
}) {
  const { $t } = useIntl()
  const { onSave, vlanList } = props
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [visible, setVisible] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({ family: '', model: '', trustedPorts: [] })

  useEffect(()=>{
    form.resetFields()
    if (props.open && props.editRecord) {
      setEditMode(true)
      form.setFieldsValue(props.editRecord)
    }
  }, [form, props.open, props.editRecord])

  return (
    <Modal
      visible={props.open}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={props.onCancel}
      destroyOnClose={true}
      closable={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
    >
      <VlanPortsContext.Provider value={{ vlanSettingValues, setVlanSettingValues, vlanList }}>
        <StepsForm
          editMode={editMode}
          onCancel={props.onCancel}
          onFinish={async (data) => {
            const switchFamilyModelsData = {
              ...data.switchFamilyModels,
              title: '',
              vlanConfigName: ''
            }
            switchFamilyModelsData.slots = data.switchFamilyModels.slots.map(
              (slot: { slotNumber: number; enable: boolean }) => ({
                slotNumber: slot.slotNumber,
                enable: slot.enable,
                option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
              }))
            switchFamilyModelsData.ports = data.switchFamilyModels.untaggedPorts.length +
              data.switchFamilyModels.taggedPorts.length
            switchFamilyModelsData.untaggedPorts = switchFamilyModelsData.untaggedPorts.join(',')
            switchFamilyModelsData.taggedPorts = switchFamilyModelsData.taggedPorts.join(',')
            onSave(switchFamilyModelsData)
            setVisible(false)
          }}
        >
          <StepsForm.StepForm
            title='Select Model'
            onFinish={async (data) => {
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