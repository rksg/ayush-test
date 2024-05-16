import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import _                    from 'lodash'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm } from '@acx-ui/components'
import { useGetLagListQuery }          from '@acx-ui/rc/services'
import {
  SwitchModelPortData,
  TrustedPort,
  Vlan,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

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
  vlanList: Vlan[],
  switchFamilyModel?: string
}) {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { open, editRecord, onSave, onCancel, vlanList, switchFamilyModel } = props
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({
      family: '',
      model: '',
      trustedPorts: []
    })

  const [portsUsedByLag, setPortsUsedByLag] = useState([] as string[])
  const { data: lagList }
    = useGetLagListQuery({ params: { tenantId, switchId } }, { skip: !switchId })


  /**  */
  // const getSlots = (selectedFamily: string, selectedModel: string) => {
  //   const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES

  //   const familyList = ICX_MODELS_MODULES[familyIndex]
  //   const modelIndex = selectedModel as keyof typeof familyList

  //   const slots = familyList[modelIndex]
  //   return familyList[modelIndex]
  // }

  useEffect(()=>{
    setEditMode(open && !!editRecord)

    if (open && editRecord) {
      const family = editRecord.model.split('-')[0]
      const model = editRecord.model.split('-')[1]
      setVlanSettingValues({ family, model, switchFamilyModels: editRecord, trustedPorts: [] })
    } else if (open && switchFamilyModel) {
      const [ family, model ] = switchFamilyModel.split('-')

      const switchFamilyModels = {
        id: '',
        model: switchFamilyModel,
        slots: [],
        taggedPorts: [],
        untaggedPorts: []
      }

      const port = updateModelPortData(
        switchFamilyModels, [], [], [], family, model
      )

      console.log(port)

      const moduleStatus = getModuleStatus(family, model, [], [])

      const initValue = {
        family,
        model,
        enableSlot2: moduleStatus?.enableSlot2,
        enableSlot3: moduleStatus?.enableSlot3,
        // enableSlot4: moduleStatus?.enableSlot4,
        selectedOptionOfSlot2: undefined,
        selectedOptionOfSlot3: undefined,
        selectedOptionOfSlot4: undefined,
        switchFamilyModels: {
          id: '',
          model: switchFamilyModel,
          slots: port[0]?.slots as any,
          taggedPorts: [],
          untaggedPorts: []
        },
        trustedPorts: []
      }

      form.setFieldsValue(initValue)
      setVlanSettingValues(initValue)

    } else {
      setVlanSettingValues({ family: '', model: '', trustedPorts: [] })
    }
  }, [form, open, editRecord])

  useEffect(()=>{
    if (lagList) {
      const ports = lagList.map(l => l.ports).flat()
      setPortsUsedByLag(ports as string[])
    }
  }, [lagList])

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

    const untaggedPorts = vlanSettingValues.switchFamilyModels?.untaggedPorts
      .filter((value: string) => value.startsWith('1/1/') ||
        (data.enableSlot2 && value.startsWith('1/2/')) ||
        (data.enableSlot3 && value.startsWith('1/3/')))

    const taggedPorts = vlanSettingValues.switchFamilyModels?.taggedPorts
      .filter((value: string) => value.startsWith('1/1/') ||
        (data.enableSlot2 && value.startsWith('1/2/')) ||
        (data.enableSlot3 && value.startsWith('1/3/')))

    switchFamilyModelsData.model = data.family + '-' + data.model
    switchFamilyModelsData.slots = data.switchFamilyModels.slots.map(
      (slot: { slotNumber: number; enable: boolean }) => ({
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
      title={$t({ defaultMessage: 'Select Ports By Model' })}
      data-testid='vlanSettingModal'
    >
      <VlanPortsContext.Provider value={{
        vlanSettingValues, setVlanSettingValues, vlanList, editMode,
        isSwitchLevel: !!switchFamilyModel,
        switchFamilyModel,
        portsUsedByLag
      }}>
        <StepsForm
          editMode={editMode}
          onCancel={onCancel}
          onFinish={onFinish}
          style={{ paddingBlockEnd: 0 }}
        >
          { !switchFamilyModel && <StepsForm.StepForm
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
            <UntaggedPortsStep />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Tagged Ports' })}
            onFinish={onSaveTagged}
          >
            <TaggedPortsStep />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </Modal>
  )
}

/** util */
interface ModelsType {
  label: string
  value: string
}

interface ModuleStatus {
  moduleSelectionEnable: boolean
  enableSlot2?: boolean
  enableSlot3?: boolean
  // enableSlot4?: boolean
  selectedOptionOfSlot2?: string
  selectedOptionOfSlot3?: string
  selectedOptionOfSlot4?: string
  module2SelectionEnable?: boolean
}

function getModuleStatus (
  family: string, model: string, optionListForSlot2: ModelsType[], optionListForSlot3: ModelsType[]) {
  if (family === 'ICX7550') {
    // setModuleSelectionEnable(true)
    // form.setFieldValue('enableSlot2', true)
    // form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
    // setModule2SelectionEnable(false)
    return {
      moduleSelectionEnable: true,
      enableSlot2: true,
      selectedOptionOfSlot2: optionListForSlot2[0]?.value,
      module2SelectionEnable: false
    }
  }

  if (family === 'ICX7150' || family === 'ICX7850') {
    switch (model) {
      case '24':
      case '24P':
      case '24F':
      case 'C10ZP':
      case 'C12P':
      case '48':
      case '48P':
      case '48PF':
      case '32Q':
        // setModuleSelectionEnable(false)
        // form.setFieldValue('enableSlot2', true)
        // form.setFieldValue('enableSlot3', true)
        // form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
        // form.setFieldValue('selectedOptionOfSlot3', optionListForSlot3[0]?.value)
        return {
          moduleSelectionEnable: false,
          enableSlot2: true,
          enableSlot3: true,
          selectedOptionOfSlot2: optionListForSlot2[0]?.value,
          selectedOptionOfSlot3: optionListForSlot3[0]?.value,
        }
        break

      case 'C08P':
      case 'C08PT':
      case '48ZP':
      case '48FS':
      case '48F':       
        // setModuleSelectionEnable(false)
        // form.setFieldValue('enableSlot2', true)
        // form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
        return {
          moduleSelectionEnable: false,
          enableSlot2: true,
          selectedOptionOfSlot2: optionListForSlot2[0]?.value,
        } 
        break

      default:
        // setModuleSelectionEnable(true)
        return {
          moduleSelectionEnable: true,
        } 
        break
    }
  }
  return
}

function updateModelPortData (
  switchFamilyModels: SwitchModelPortData,
  optionListForSlot2: ModelsType[], optionListForSlot3: ModelsType[], optionListForSlot4: ModelsType[],
  selectedFamily: string, selectedModel: string) {
  // for (let slotNumber = 1; slotNumber <= 4; slotNumber++) {
  //   updateSlotPortData(
  //     switchFamilyModels, optionListForSlot2, optionListForSlot3, optionListForSlot4,
  //     slotNumber, selectedFamily, selectedModel
  //   )
  // }
  return Array.from({ length: 4 }).map((ele, i) => {
    const slotNumber = (i ?? 0) + 1
    return updateSlotPortData(
      switchFamilyModels, optionListForSlot2, optionListForSlot3, optionListForSlot4,
      slotNumber, selectedFamily, selectedModel
    )
  })
}

function updateSlotPortData (
  switchFamilyModels: SwitchModelPortData,
  optionListForSlot2: ModelsType[], optionListForSlot3: ModelsType[], optionListForSlot4: ModelsType[],
  slotNumber: number, selectedFamily: string, selectedModel: string) {
  if (slotNumber === 1) {
    return generateSlotData(switchFamilyModels, slotNumber, true, [], '', selectedFamily, selectedModel)
  } else {
    const moduleStatus = getModuleStatus(
      selectedFamily, selectedModel, optionListForSlot2, optionListForSlot3
    )
    const enable = (moduleStatus?.[`enableSlot${slotNumber}` as keyof typeof moduleStatus] ?? false) as boolean //form.getFieldValue(`enableSlot${slotNumber}`)
    let option = (moduleStatus?.[`selectedOptionOfSlot${slotNumber}` as keyof typeof moduleStatus] ?? '') as string //form.getFieldValue(`selectedOptionOfSlot${slotNumber}`)
    let optionList = optionListForSlot2
    switch (slotNumber) {
      case 3:
        optionList = optionListForSlot3
        break
      case 4:
        optionList = optionListForSlot4
        break
    }
    if (!enable) {
      option = ''
    }
    else if (enable && !option) {
      option = optionList[0] ? optionList[0].value : option
    }

    const index = switchFamilyModels?.slots?.findIndex(
      (s: { slotNumber: number }) => s.slotNumber === slotNumber) || -1
    if (!enable && index !== -1) {
      switchFamilyModels?.slots?.splice(index, 1)
    }
    return generateSlotData(switchFamilyModels, slotNumber, enable, optionList, option, selectedFamily, selectedModel)
  }
}

function generatePortData (totalNumber: string) {
  let ports = []
  for (let i = 1; i <= Number(totalNumber); i++) {
    let port = { portNumber: i, portTagged: '' }
    ports.push(port)
  }
  return ports
}

function generateSlotData (
  switchFamilyModels: SwitchModelPortData,
  slotNumber: number, slotEnable: boolean, slotOptions: ModelsType[],
  slotOption: string, selectedFamily: string, selectedModel: string) {

  if (slotEnable) {
    let totalPortNumber: string = '0'
    let slotPortInfo: string = ''

    if (slotOptions.length > 1) {
      if (slotOption === '' || slotOption === undefined) {
        slotOption = slotOptions[0].value
      }
      slotPortInfo = slotOption
      totalPortNumber = slotPortInfo.split('X', 1)[0]
    }
    if ((slotOptions.length === 1 || totalPortNumber === '0') &&
    selectedFamily !== '' && selectedModel !== '') {
      const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES
      const familyList = ICX_MODELS_MODULES[familyIndex]
      const modelIndex = selectedModel as keyof typeof familyList
      slotPortInfo = slotOption || familyList[modelIndex][slotNumber - 1][0]
      totalPortNumber = slotPortInfo.split('X')[0]
    }

    const slotData = {
      slotNumber: slotNumber,
      enable: slotEnable,
      option: slotOption,
      slotPortInfo: slotPortInfo,
      portStatus: generatePortData(totalPortNumber)
    }

    const slotIndex = switchFamilyModels.slots?.findIndex(
      (s: { slotNumber: number }) => s.slotNumber === slotNumber)

    const tmpModelPortData = { ...switchFamilyModels }
    if (slotIndex === -1) {
      tmpModelPortData.slots.push(slotData)
    } else {
      if(switchFamilyModels.slots){
        tmpModelPortData.slots[slotIndex] = slotData
      }
    }
    tmpModelPortData.slots = tmpModelPortData.slots.sort(
      function (a: { slotNumber: number }, b: { slotNumber: number }) {
        return a.slotNumber > b.slotNumber ? 1 : -1
      })
    tmpModelPortData.model = selectedFamily + '-' + selectedModel

    return tmpModelPortData
    ///setSwitchFamilyModels(tmpModelPortData)

    //form.setFieldValue('switchFamilyModels', tmpModelPortData)
  }
  return
}
