import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import {
  SwitchSlot2,
  Vlan,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'

import { GroupedVlanPort, VlanPort, PortSetting } from '../index.utils'

import { PortsStep }       from './PortsStep'
import { SelectModelStep } from './SelectModelStep'

export interface PortsModalSetting {
  enableSlot2?: boolean
  enableSlot3?: boolean
  enableSlot4?: boolean
  family: string
  model: string
  selectedOptionOfSlot2?: string
  selectedOptionOfSlot3?: string
  portSettings: PortSetting[]
  slots: SwitchSlot2[]
}

export function PortsModal (props: {
  open: boolean,
  onSave:(values: PortsModalSetting)=>void,
  onCancel?: ()=>void,
  editRecord?: VlanPort,
  vlanList: Vlan[],
  vlanPortList: GroupedVlanPort[],
}) {
  const { $t } = useIntl()
  const {
    open, editRecord, onSave, onCancel, vlanList, vlanPortList
    // switchFamilyModel, portSlotsData = [], stackMember, vlanId
  } = props
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [modelPorts, setModelPorts] = useState({} as GroupedVlanPort)

  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const modules = Object.keys(ICX_MODELS_MODULES).filter(
    key => isSupport8100 || key !== 'ICX8100'
  )
  const familiesData = modules.map(key => {
    return { label: `ICX-${key.split('ICX')[1]}`, value: key }
  })

  useEffect(()=>{
    setEditMode(open && !!editRecord)

    if (open && editRecord) {
      const [family, model] = editRecord.familymodel?.split('-') ?? []
      const slots = editRecord?.slots
      const enableSlot = Array.from({ length: 2 }, (_, index) => {
        //slot2, slot3
        const slotNumber = index + 2
        const slot = slots?.filter(item => item.slotNumber === slotNumber)[0]
        return slot || { slotNumber, enable: false, option: undefined }
      })

      form.setFieldsValue({
        family,
        model,
        portSettings: editRecord?.ports,
        editRecord: editRecord,
        enableSlot: enableSlot,
        // enableSlot2: selectedEnable2.enable,
        // enableSlot3: selectedEnable3.enable,
        // enableSlot4: selectedEnable4.enable,
        // ...( selectedEnable2.option ? { selectedOptionOfSlot2: selectedEnable2.option } : {}),
        // ...( selectedEnable3.option ? { selectedOptionOfSlot3: selectedEnable3.option } : {}),
        enableSlot2: enableSlot[0].enable,
        enableSlot3: enableSlot[1].enable,
        ...( enableSlot[0].option ? { selectedOptionOfSlot2: enableSlot[0].option } : {}),
        ...( enableSlot[1].option ? { selectedOptionOfSlot3: enableSlot[1].option } : {}),
        slots: editRecord.slots
      })

      setModelPorts(vlanPortList?.find(
        model => model.id === `${family}-${model}`) as GroupedVlanPort
      )

    } else if (open) {
      const values = form.getFieldsValue(true)
      form.setFieldsValue({
        ...values,
        slots: [],
        portSettings: []
      })
    }

  }, [form, open, editRecord])

  const onSaveModel = async (data: PortsModalSetting) => {
    const isValid = !!(data.family && data.model)
    setNoModelMsg(!isValid)

    if (isValid) {
      setModelPorts(vlanPortList?.find(
        model => model.id === `${data.family}-${data.model}`) as GroupedVlanPort
      )
    }
    return isValid
  }

  const onFinish = async (data: PortsModalSetting) => {
    const isValid = !!(
      data.portSettings?.map(p => p.untaggedVlan.concat(p.taggedVlans)).flat()?.length
    )
    if (!isValid) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Configure at least one VLAN' }), //TODO
        content: $t({  // eslint-disable-next-line max-len
          defaultMessage: 'Please ensure that at least one Tagged or Untagged VLAN is configured.'
        })
      })
      return
    }

    onSave(data)
  }

  return (
    <Modal
      visible={open}
      width='80%'
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={onCancel}
      destroyOnClose={true}
      closable={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
      data-testid='vlanSettingModal'
    >
      <StepsForm
        form={form}
        editMode={editMode}
        onCancel={onCancel}
        onFinish={onFinish}
        style={{ paddingBlockEnd: 0 }}
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
            <Typography.Text style={{ fontSize: '12px' }} type='danger'>
              {$t({ defaultMessage: 'No model selected' })}
            </Typography.Text>
          }
          <SelectModelStep
            editMode={editMode}
            editRecord={editRecord}
            families={familiesData}
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Set Ports' })}
        >
          <PortsStep
            editRecord={editRecord}
            vlanList={vlanList}
            modelPorts={modelPorts}
          />
        </StepsForm.StepForm>

      </StepsForm>
    </Modal>
  )
}