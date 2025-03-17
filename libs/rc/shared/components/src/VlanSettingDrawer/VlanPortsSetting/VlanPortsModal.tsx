import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import _                    from 'lodash'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, showActionModal, StepsForm } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useSwitchPortlistQuery }                       from '@acx-ui/rc/services'
import {
  SwitchModelPortData,
  TrustedPort,
  Vlan,
  SwitchSlot,
  SwitchSlot2,
  StackMember,
  SwitchPortViewModelQueryFields,
  SwitchPortViewModel,
  getFamilyAndModel
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { PortsUsedByProps } from '..'

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
  stackMember?: StackMember[]
}

export function VlanPortsModal (props: {
  vlanId?: number,
  open: boolean,
  onSave:(values: SwitchModelPortData)=>void,
  onCancel?: ()=>void,
  editRecord?: SwitchModelPortData,
  currrentRecords?: SwitchModelPortData[],
  vlanList: Vlan[],
  switchFamilyModel?: string,
  portSlotsData?: SwitchSlot[][]
  portsUsedBy?: PortsUsedByProps
  stackMember?: StackMember[]
}) {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const { open, editRecord, onSave, onCancel,
    vlanList, switchFamilyModel, portSlotsData = [], portsUsedBy, stackMember, vlanId } = props
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({
      family: '',
      model: '',
      trustedPorts: []
    })

  const isSwitchLevel = !!switchFamilyModel

  const portPayload = {
    page: 1,
    pageSize: 10000,
    filters: { switchId: [serialNumber] },
    sortField: 'portIdentifierFormatted',
    sortOrder: 'ASC',
    fields: [...SwitchPortViewModelQueryFields]
  }
  const { data: portList } = useSwitchPortlistQuery({
    params: { tenantId },
    payload: portPayload,
    enableRbac: true
  }, { skip: !isSwitchFlexAuthEnabled })

  useEffect(()=>{
    setEditMode(open && !!editRecord)

    if (open && isSwitchLevel) {
      const [ family, model ] = getFamilyAndModel(switchFamilyModel)
      const initValues = {
        family, model,
        slots: portSlotsData as unknown as SwitchSlot2[],
        switchFamilyModels: {
          id: '',
          model: switchFamilyModel,
          slots: portSlotsData as unknown as SwitchSlot2[],
          taggedPorts: [],
          untaggedPorts: []
        },
        trustedPorts: [],
        stackMember
      }

      if (editRecord) {
        setVlanSettingValues({
          ...initValues,
          switchFamilyModels: {
            ...initValues.switchFamilyModels,
            ..._.omit(editRecord, 'slots')
          }
        })
      } else {
        form.setFieldsValue(initValues)
        setVlanSettingValues(initValues)
      }
    } else if (open && editRecord) {
      const [ family, model ] = getFamilyAndModel(editRecord.model)
      setVlanSettingValues({
        family, model, switchFamilyModels: editRecord, trustedPorts: [], stackMember
      })
    } else {
      setVlanSettingValues({ family: '', model: '', trustedPorts: [] })
    }
  }, [form, open, editRecord])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSaveModel = async (data: any) => {
    if(data.family && data.model !== ''){
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
        ...data.switchFamilyModels,
        taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
      }
    })
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSaveTagged = async (data: any) => {
    setVlanSettingValues({
      ...vlanSettingValues,
      switchFamilyModels: {
        ...vlanSettingValues.switchFamilyModels,
        ...data.switchFamilyModels,
        untaggedPorts: vlanSettingValues.switchFamilyModels?.untaggedPorts || []
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
    const enableSlot2 = isSwitchLevel
      ? vlanSettingValues?.enableSlot2 : data.enableSlot2
    const enableSlot3 = isSwitchLevel
      ? vlanSettingValues?.enableSlot3 : data.enableSlot3
    const slots = isSwitchLevel
      ? vlanSettingValues.switchFamilyModels?.slots : data.switchFamilyModels.slots

    const untaggedPorts = isSwitchLevel
      ? vlanSettingValues.switchFamilyModels?.untaggedPorts
      : vlanSettingValues.switchFamilyModels?.untaggedPorts
        ?.filter((value: string) => value.startsWith('1/1/') ||
          (enableSlot2 && value.startsWith('1/2/')) ||
          (enableSlot3 && value.startsWith('1/3/')))

    const taggedPorts = isSwitchLevel
      ? vlanSettingValues.switchFamilyModels?.taggedPorts
      : vlanSettingValues.switchFamilyModels?.taggedPorts
        ?.filter((value: string) => value.startsWith('1/1/') ||
          (enableSlot2 && value.startsWith('1/2/')) ||
          (enableSlot3 && value.startsWith('1/3/')))

    if (_.isEmpty(taggedPorts) && _.isEmpty(untaggedPorts)) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Tagged or Untagged Port is not Configured' }),
        content: $t({  // eslint-disable-next-line max-len
          defaultMessage: 'Please ensure that at least one Tagged or Untagged Port is configured.'
        })
      })
      return
    }

    switchFamilyModelsData.model
      = isSwitchLevel ? switchFamilyModel : data.family + '-' + data.model

    switchFamilyModelsData.slots
      = slots?.map((slot: { slotNumber: number; enable: boolean }) => ({
        slotNumber: slot.slotNumber,
        enable: slot.enable,
        option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
      }))
    switchFamilyModelsData.untaggedPorts = untaggedPorts
    switchFamilyModelsData.taggedPorts = taggedPorts
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
      title={isSwitchLevel
        ? $t({ defaultMessage: '{action} Ports for {switchFamilyModel}' }, {
          action: editMode ? $t({ defaultMessage: 'Edit' }) : $t({ defaultMessage: 'Add' }),
          switchFamilyModel
        })
        : $t({ defaultMessage: 'Select Ports By Model' })
      }
      data-testid='vlanSettingModal'
    >
      <VlanPortsContext.Provider value={{
        vlanSettingValues, setVlanSettingValues,
        vlanList,
        editMode,
        isSwitchLevel,
        switchFamilyModel,
        portSlotsData,
        portsUsedBy,
        vlanId
      }}>
        <StepsForm
          form={form}
          editMode={editMode}
          onCancel={onCancel}
          onFinish={onFinish}
          style={{ paddingBlockEnd: 0 }}
        >
          { !isSwitchLevel && <StepsForm.StepForm
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
          </StepsForm.StepForm>}
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Untagged Ports' })}
            onFinish={onSaveUntagged}
          >
            <UntaggedPortsStep portsData={portList?.data as SwitchPortViewModel[]} />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Tagged Ports' })}
            onFinish={onSaveTagged}
          >
            <TaggedPortsStep portsData={portList?.data as SwitchPortViewModel[]} />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </Modal>
  )
}
