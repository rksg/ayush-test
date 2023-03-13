import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import _                    from 'lodash'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm } from '@acx-ui/components'
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
  const { open, editRecord, onSave, onCancel, vlanList } = props
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({ family: '', model: '', trustedPorts: [] })

  useEffect(()=>{
    form.resetFields()
    if (open && editRecord) {
      setEditMode(true)
      const family = editRecord.model.split('-')[0]
      const model = editRecord.model.split('-')[1]
      setVlanSettingValues({ family, model, switchFamilyModels: editRecord, trustedPorts: [] })
    }
  }, [form, open, editRecord])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSaveModel = async (data: any) => {
    if(data.family && data.model){
      setNoModelMsg(false)
      if(editMode){
        setVlanSettingValues({
          ...data,
          switchFamilyModels: {
            ...data.switchFamilyModels,
            untaggedPorts: editRecord?.untaggedPorts,
            taggedPorts: editRecord?.taggedPorts
          }
        })
      }else{
        setVlanSettingValues(data)
      }
      return true
    }
    setNoModelMsg(true)
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSaveUntagged = async (data: any) => {
    setVlanSettingValues({
      ...vlanSettingValues,
      switchFamilyModels: {
        ...vlanSettingValues.switchFamilyModels,
        ...data.switchFamilyModels
      }
    })
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (data: any) => {
    const switchFamilyModelsData = {
      ...data.switchFamilyModels,
      title: '',
      vlanConfigName: ''
    }
    switchFamilyModelsData.model = data.family + '-' + data.model
    switchFamilyModelsData.slots = data.switchFamilyModels.slots.map(
      (slot: { slotNumber: number; enable: boolean }) => ({
        slotNumber: slot.slotNumber,
        enable: slot.enable,
        option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
      }))
    switchFamilyModelsData.ports = data.switchFamilyModels.untaggedPorts.length +
      data.switchFamilyModels.taggedPorts.length
    switchFamilyModelsData.untaggedPorts = data.switchFamilyModels.untaggedPorts.join(',')
    switchFamilyModelsData.taggedPorts = data.switchFamilyModels.taggedPorts.join(',')
    onSave(switchFamilyModelsData)
  }

  return (
    <Modal
      visible={open}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={onCancel}
      destroyOnClose={true}
      closable={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
      data-testid='vlanSettingModal'
    >
      <VlanPortsContext.Provider value={{
        vlanSettingValues, setVlanSettingValues, vlanList, editMode }}>
        <StepsForm
          onCancel={onCancel}
          onFinish={onFinish}
        >
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Select Model' })}
            onFinish={onSaveModel}
          >
            <div>
              <label style={{ color: 'var(--acx-neutrals-60)' }}>
                {$t({ defaultMessage: 'Select family and model to be configured:' })}
              </label>
            </div>
            {noModelMsg &&
              <Typography.Text type='danger'>
                {$t({ defaultMessage: 'No model selected' })}
              </Typography.Text>
            }
            <SelectModelStep editMode={editRecord !== undefined}/>
          </StepsForm.StepForm>
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Untagged Ports' })}
            onFinish={onSaveUntagged}
          >
            <UntaggedPortsStep />
          </StepsForm.StepForm>
          <StepsForm.StepForm title={$t({ defaultMessage: 'Tagged Ports' })}>
            <TaggedPortsStep />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </Modal>
  )
}