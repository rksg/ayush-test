import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import {
  SwitchModelPortData,
  Vlan,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'

import { GroupedVlanPort, VlanPort, PortSetting } from '../index'

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
  switchFamilyModels?: SwitchModelPortData
}

export function PortsModal (props: {
  // vlanId?: number,
  open: boolean,
  onSave:(values: PortsModalSetting)=>void,
  onCancel?: ()=>void,
  editRecord?: VlanPort,
  // currrentRecords?: SwitchModelPortData[],
  vlanList: Vlan[],
  vlanPortList: GroupedVlanPort[],
}) {
  const { $t } = useIntl()
  // const { tenantId, serialNumber } = useParams()
  // const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const {
    open, editRecord, onSave, onCancel, vlanList, vlanPortList
    // switchFamilyModel, portSlotsData = [], stackMember, vlanId
  } = props
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [modelPorts, setModelPorts] = useState({} as GroupedVlanPort)

  // const [portsModule, setPortsModule] = useState<PortsType[][][]>([])
  // const [slot2, setSlot2] = useState<SwitchSlot>()
  // const [slot3, setSlot3] = useState<SwitchSlot>()

  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  // const [vlanSettingValues, setVlanSettingValues] =
  //   useState<VlanSettingInterface>({
  //     family: '',
  //     model: '',
  //     trustedPorts: []
  //   })

  // const isSwitchLevel = !!switchFamilyModel

  // const portPayload = {
  //   page: 1,
  //   pageSize: 10000,
  //   filters: { switchId: [serialNumber] },
  //   sortField: 'portIdentifierFormatted',
  //   sortOrder: 'ASC',
  //   fields: [...SwitchPortViewModelQueryFields]
  // }
  // const { data: portList } = useSwitchPortlistQuery({
  //   params: { tenantId },
  //   payload: portPayload,
  //   enableRbac: true
  // }, { skip: !isSwitchFlexAuthEnabled })

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
      // console.log('****** open: ', family, model, editRecord)
      // if (family && model) {
      //   setVlanSettingValues({
      //     family, model, switchFamilyModels: editRecord as any, trustedPorts: [], stackMember
      //   })
      // }

      const slots = editRecord?.slots
      const selectedEnable2
        = slots?.filter(item => item.slotNumber === 2)[0] || { enable: false, option: undefined }
      const selectedEnable3
        = slots?.filter(item => item.slotNumber === 3)[0] || { enable: false, option: undefined }
      const selectedEnable4
        = slots?.filter(item => item.slotNumber === 4)[0] || { enable: false, option: undefined }

      const enableSlot = Array.from({ length: 2 }, (_, index) => {
        const slot = slots?.filter(item => item.slotNumber === index + 2)[0]
        return slot || { enable: false, option: undefined }
      })

      // console.log('enableSlot: ', enableSlot)

      // console.log(
      //   {
      //     // family: selectedFamily,
      //     // model: selectedModel,
      //     family,
      //     model,
      //     portSettings: editRecord?.ports,
      //     editRecord: editRecord,
      //     enableSlot: enableSlot,
      //     enableSlot2: selectedEnable2.enable,
      //     enableSlot3: selectedEnable3.enable,
      //     enableSlot4: selectedEnable4.enable,
      //     ...( selectedEnable2.option ? { selectedOptionOfSlot2: selectedEnable2.option } : {}),
      //     ...( selectedEnable3.option ? { selectedOptionOfSlot3: selectedEnable3.option } : {})
      //     // selectedOptionOfSlot4: selectedEnable4.option
      //   }
      // )

      form.setFieldsValue({
      // family: selectedFamily,
      // model: selectedModel,
        family,
        model,
        portSettings: editRecord?.ports,
        editRecord: editRecord,
        enableSlot: enableSlot,
        enableSlot2: selectedEnable2.enable,
        enableSlot3: selectedEnable3.enable,
        enableSlot4: selectedEnable4.enable,
        ...( selectedEnable2.option ? { selectedOptionOfSlot2: selectedEnable2.option } : {}),
        ...( selectedEnable3.option ? { selectedOptionOfSlot3: selectedEnable3.option } : {}),
        switchFamilyModels: {
          //...data.switchFamilyModels
          id: `${family}-${model}`,
          model: editRecord.familymodel,
          slots: editRecord.slots
          // taggedPorts: [],
          // untaggedPorts: []
        }
        // selectedOptionOfSlot4: selectedEnable4.option

      //// switchFamilyModels: editRecord
      })

      setModelPorts(vlanPortList?.find(
        model => model.id === `${family}-${model}`) as GroupedVlanPort
      )

    } else if (open) {
      form.setFieldValue('switchFamilyModels', {
        id: '',
        model: '',
        slots: [],
        taggedPorts: [],
        untaggedPorts: []
      })
    }


    // if (open && isSwitchLevel) {
    //   const [ family, model ] = switchFamilyModel.split('-')
    //   const initValues = {
    //     family, model,
    //     slots: portSlotsData as unknown as SwitchSlot2[],
    //     switchFamilyModels: {
    //       id: '',
    //       model: switchFamilyModel,
    //       slots: portSlotsData as unknown as SwitchSlot2[],
    //       taggedPorts: [],
    //       untaggedPorts: []
    //     },
    //     trustedPorts: [],
    //     stackMember
    //   }

    //   if (editRecord) {
    //     setVlanSettingValues({
    //       ...initValues,
    //       switchFamilyModels: {
    //         ...initValues.switchFamilyModels,
    //         ..._.omit(editRecord, 'slots')
    //       }
    //     })
    //   } else {
    //     form.setFieldsValue(initValues)
    //     setVlanSettingValues(initValues)
    //   }
    // } else if (open && editRecord) {
    //   const family = editRecord.model.split('-')[0]
    //   const model = editRecord.model.split('-')[1]
    //   setVlanSettingValues({
    //     family, model, switchFamilyModels: editRecord, trustedPorts: [], stackMember
    //   })
    // } else {
    //   setVlanSettingValues({ family: '', model: '', trustedPorts: [] })
    // }

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

  // const onSavePorts = async (data: PortsModalSetting) => {
  //   console.log('onSavePorts: ', data)
  // }

  const onFinish = async (data: PortsModalSetting) => {
    // console.log('onFinish: ', data)
    const isValid = !!(
      data.portSettings?.map(p => p.untaggedVlan.concat(p.taggedVlans)).flat()?.length
    )
    if (!isValid) {
      showActionModal({ //TODO
        type: 'error',
        title: $t({ defaultMessage: 'Port is not Configured' }),
        content: $t({  // eslint-disable-next-line max-len
          defaultMessage: 'Please ensure that at least one Tagged or Untagged Port is configured.'
        })
      })
      return
    }

    onSave(data)

    // const switchFamilyModelsData = {
    //   ...data.switchFamilyModels,
    //   title: '',
    //   vlanConfigName: ''
    // }
    // const enableSlot2 = isSwitchLevel
    //   ? vlanSettingValues?.enableSlot2 : data.enableSlot2
    // const enableSlot3 = isSwitchLevel
    //   ? vlanSettingValues?.enableSlot3 : data.enableSlot3
    // const slots = isSwitchLevel
    //   ? vlanSettingValues.switchFamilyModels?.slots : data.switchFamilyModels.slots

    // const untaggedPorts = isSwitchLevel
    //   ? vlanSettingValues.switchFamilyModels?.untaggedPorts
    //   : vlanSettingValues.switchFamilyModels?.untaggedPorts
    //     ?.filter((value: string) => value.startsWith('1/1/') ||
    //       (enableSlot2 && value.startsWith('1/2/')) ||
    //       (enableSlot3 && value.startsWith('1/3/')))

    // const taggedPorts = isSwitchLevel
    //   ? vlanSettingValues.switchFamilyModels?.taggedPorts
    //   : vlanSettingValues.switchFamilyModels?.taggedPorts
    //     ?.filter((value: string) => value.startsWith('1/1/') ||
    //       (enableSlot2 && value.startsWith('1/2/')) ||
    //       (enableSlot3 && value.startsWith('1/3/')))

    // if (_.isEmpty(taggedPorts) && _.isEmpty(untaggedPorts)) {
    //   showActionModal({
    //     type: 'error',
    //     title: $t({ defaultMessage: 'Tagged or Untagged Port is not Configured' }),
    //     content: $t({  // eslint-disable-next-line max-len
    //       defaultMessage: 'Please ensure that at least one Tagged or Untagged Port is configured.'
    //     })
    //   })
    //   return
    // }

    // switchFamilyModelsData.model
    //   = isSwitchLevel ? switchFamilyModel : data.family + '-' + data.model

    // switchFamilyModelsData.slots
    //   = slots?.map((slot: { slotNumber: number; enable: boolean }) => ({
    //     slotNumber: slot.slotNumber,
    //     enable: slot.enable,
    //     option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
    //   }))
    // switchFamilyModelsData.untaggedPorts = untaggedPorts
    // switchFamilyModelsData.taggedPorts = taggedPorts



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
            editMode={editRecord !== undefined}
            editRecord={editRecord}
            families={familiesData}
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Set Ports' })}
          // onFinish={onSavePorts}
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