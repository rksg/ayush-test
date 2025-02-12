import { DefaultOptionType } from 'antd/lib/select'

import {
  // getSwitchPortLabel,
  // StackMember,
  SwitchSlot2 as SwitchSlot,
  // PortStatusMessages,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'

// import { Tooltip } from '@acx-ui/components'
// import * as UI from './styledComponents'
// import { getIntl } from '@acx-ui/utils'

export interface PortsType {
  label: string,
  value: string
}

export const getPortsModule = (slots: SwitchSlot[], isSwitchLevel?: boolean) => {
  const tmpSlots = isSwitchLevel ? slots : [slots] as unknown as SwitchSlot[][]
  const module = tmpSlots.map(slotData => {
    return (slotData as SwitchSlot[])
      ?.filter((slot: SwitchSlot) => slot?.portStatus)
      ?.map((slot: SwitchSlot) => {
        return slot?.portStatus?.map(item => {
          return {
            label: item.portNumber.toString(),
            value: item.portIdentifier || `1/${slot.slotNumber}/${item.portNumber.toString()}`
          }
        })
      })
  })

  return module
}

export const selectedGroupByPrefix = (selected: string[]) => {
  return selected.reduce((acc: { [key: string]: string[] }, str: string) => {
    const parts = str.split('/')
    const prefix = parts.slice(0, 2).join('/') // 1/1, 1/2, 1/3, 2/1, 2/2, 3/1
    if (!acc[prefix]) {
      acc[prefix] = []
    }
    acc[prefix].push(str)
    return acc
  }, {} as { [key: string]: string[] })
}

export const getUnit = (module: PortsType[][]) => {
  return Number(module.flat()[0]?.value?.split('/')[0])
}

// export const getUnitTitle = (module: PortsType[][], stackMembers?: StackMember[]) => {
//   const unit = getUnit(module)
//   const member = stackMembers?.filter(member => member.unitId === unit)?.[0]
//   return member ? `${unit} - ${member?.model}` : ''
// }

export const getModule = (module: PortsType[][], slot: string, unit: number) => {
  // const unit = getUnit(module)
  const index = module.findIndex(subArray =>
    subArray.some(item => item.value === `${unit}/${slot}/1`)
  )
  return module[index]

  // const unit = getUnit(module)
  // return module.find(subArray =>
  //   subArray.some(item => item.value === `${unit}/${slot}/1`)
  // ) || []
}

////////refactor
// type SlotOptionsResult = {
//   slots: Slot[]
//   slotOptionLists: ModelsType[][]
// }

// export interface ModelsType {
//   label: string
//   value: string
// }

export const getModelModules = (family: string, model: string): string[][] => { //: SlotOptionsResult
  const familyIndex = family as keyof typeof ICX_MODELS_MODULES
  const modelIndex = model as keyof typeof familyList

  const familyList = ICX_MODELS_MODULES[familyIndex]
  return familyList[modelIndex]
}

export const getSlots = (family: string, model: string): DefaultOptionType[][] => { //: SlotOptionsResult
  // const familyIndex = family as keyof typeof ICX_MODELS_MODULES
  // const modelIndex = model as keyof typeof familyList

  // const familyList = ICX_MODELS_MODULES[familyIndex]
  // const modelModules = familyList[modelIndex]
  const modelModules = getModelModules(family, model)
  const slotOptionLists = [
    createSlotOptions(modelModules, 1) ?? [],
    createSlotOptions(modelModules, 2) ?? [],
    createSlotOptions(modelModules, 3) ?? []
  ]

  return slotOptionLists
}

const createSlotOptions = (modelModules: string[][], slotIndex: number) => {
  const slotOptions = []
  if (modelModules.length > slotIndex) {
    for (let value of modelModules?.[slotIndex]) {
      const name = value.toString().split('X').join(' X ')
      slotOptions.push({ label: name, value: value.toString() })
    }
  }
  return slotOptions
}

export const checkIfModuleFixed = (family: string, model: string): {
  moduleSelectionEnable?: boolean,
  module2SelectionEnable?: boolean,
  enableSlot2?: boolean,
  enableSlot3?: boolean,
  // selectedOptionOfSlot2?: DefaultOptionType['value'],
  // selectedOptionOfSlot3?: DefaultOptionType['value']
} => {
  if (!family) return {}

  // const { slotOptionLists } = getSlots(family, model)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [ optionListForSlot1, optionListForSlot2, optionListForSlot3 ] = slotOptionLists

  if (family === 'ICX7550') {
    return {
      moduleSelectionEnable: true,
      module2SelectionEnable: false,
      enableSlot2: true
      // selectedOptionOfSlot2: optionListForSlot2[0]?.value
    }
  }

  if (family === 'ICX8200') {
    return {
      moduleSelectionEnable: false,
      module2SelectionEnable: false,
      enableSlot2: true
      // selectedOptionOfSlot2: optionListForSlot2[0]?.value ?? ''
    }
  }

  if (family === 'ICX8100') {
    return {
      moduleSelectionEnable: false,
      module2SelectionEnable: false,
      enableSlot2: true
      // selectedOptionOfSlot2: optionListForSlot2[0]?.value
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
        return {
          moduleSelectionEnable: false,
          enableSlot2: true,
          enableSlot3: true
          // selectedOptionOfSlot2: optionListForSlot2[0]?.value,
          // selectedOptionOfSlot3: optionListForSlot3[0]?.value
        }
        // setModuleSelectionEnable(false)
        // form.setFieldValue('enableSlot2', true)
        // form.setFieldValue('enableSlot3', true)
        // form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
        // form.setFieldValue('selectedOptionOfSlot3', optionListForSlot3[0]?.value)
        break

      case 'C08P':
      case 'C08PT':
      case '48ZP':
      case '48FS':
      case '48F':
        return {
          moduleSelectionEnable: false,
          enableSlot2: true
          // selectedOptionOfSlot2: optionListForSlot2[0]?.value
        }

        // setModuleSelectionEnable(false)
        // form.setFieldValue('enableSlot2', true)
        // form.setFieldValue('selectedOptionOfSlot2', optionListForSlot2[0]?.value)
        break

      default:
        return {
          moduleSelectionEnable: true
        }
        // setModuleSelectionEnable(true)
        break
    }
  }
  return {}
}
