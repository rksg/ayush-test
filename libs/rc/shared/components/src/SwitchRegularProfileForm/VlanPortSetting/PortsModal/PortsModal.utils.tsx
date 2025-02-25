import { FormInstance }      from 'antd'
import { DefaultOptionType } from 'antd/lib/select'

import {
  SwitchSlot2 as SwitchSlot,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'

import { PortsType } from '../index.utils'

// export interface PortsType {
//   label: string,
//   value: string
// }

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

export const getPortsModule = (slots: SwitchSlot[], isSwitchLevel?: boolean) => {
  const normalizedSlots = isSwitchLevel ? slots : [slots] //as unknown as SwitchSlot[][]
  return normalizedSlots.map(slotData => {
    return (slotData as SwitchSlot[])
      .filter(slot => slot.portStatus)
      .map(slot => {
        return slot.portStatus?.map(item => {
          return {
            label: item.portNumber.toString(),
            value: item.portIdentifier || `1/${slot.slotNumber}/${item.portNumber.toString()}`
          }
        })
      })
  })
}

export const getPortsModule2 = (slots: SwitchSlot[], isSwitchLevel?: boolean) => {
  const normalizedSlots = isSwitchLevel ? slots : [slots] //as unknown as SwitchSlot[][]
  return normalizedSlots.map(slotData => {
    return (slotData as SwitchSlot[])
      .filter(slot => slot.portStatus)
      .map(slot => {
        // const [slotNumber, _] = slot.slotPortInfo?.split('X') || ''
        // return Array.from({ length: Number(slotNumber) }, (_, i) => {
        //   const index = i+1
        //   return {
        //     label: index.toString(),
        //     value: `1/${slot.slotNumber}/${index.toString()}`
        //   }
        // })

        return slot.portStatus?.map(item => {
          return {
            label: item.portNumber.toString(),
            value: item.portIdentifier || `1/${slot.slotNumber}/${item.portNumber.toString()}`
          }
        })

      })
  })
}

export const getUnit = (module: DefaultOptionType[][]) => {
  return Number(module.flat()[0]?.value?.toString().split('/')[0])
}

export const getModule = (module: PortsType[][], slot: string, unit: number) => {
  const index = module.findIndex(subArray =>
    subArray.some(item => item.value === `${unit}/${slot}/1`)
  )
  return module[index]
}

export const getModelModules = (family: string, model: string): string[][] => {
  const familyIndex = family as keyof typeof ICX_MODELS_MODULES
  const modelIndex = model as keyof typeof familyList

  const familyList = ICX_MODELS_MODULES[familyIndex]
  return familyList[modelIndex]
}

export const getSlots = (family: string, model: string): DefaultOptionType[][] => {
  const modelModules = getModelModules(family, model)
  const slotOptionLists = [
    createSlotOptions(modelModules, 1),
    createSlotOptions(modelModules, 2),
    createSlotOptions(modelModules, 3)
  ]

  return slotOptionLists
}

export const selectedGroupByPrefix = (selected: string[]) => {
  // Output: {
  //   '1/1': ['1/1/1', '1/1/2', '1/1/3'],
  //   '1/2': ['1/2/1', '1/2/2'],
  //   '2/1': ['2/1/1'],
  //   '3/1': ['3/1/1', '3/1/2', '3/1/3']
  // }

  if (selected.length === 0) {
    return {}
  }
  return selected.reduce((acc: { [key: string]: string[] }, str: string) => {
    const parts = str.split('/')
    const prefix = parts.slice(0, 2).join('/')
    if (!acc[prefix]) {
      acc[prefix] = []
    }
    acc[prefix].push(str)
    return acc
  }, {} as { [key: string]: string[] })
}

export const generateSlotData = (
  slotNumber: number, family: string, model: string, form: FormInstance
) => {
  const slotOptionLists = getSlots(family, model)
  const optionList = slotNumber === 1 ? [] : slotOptionLists?.[slotNumber - 2] //TODO

  const isEnable = slotNumber === 1 ? true : form.getFieldValue(`enableSlot${slotNumber}`)
  const selectedOption = form.getFieldValue(`selectedOptionOfSlot${slotNumber}`)

  if (isEnable) {
    let totalPortNumber: string = '0'
    let slotPortInfo: string = ''
    const defaultOption = optionList[0]?.value
    const slotOption = optionList?.length > 1 && !selectedOption
      ? defaultOption : selectedOption

    if (optionList?.length > 1) {
      slotPortInfo = slotOption
      totalPortNumber = slotPortInfo.split('X', 1)[0]
    }
    if ((optionList?.length === 1 || totalPortNumber === '0') &&
    family !== '' && model !== '') {
      const familyIndex = family as keyof typeof ICX_MODELS_MODULES
      const familyList = ICX_MODELS_MODULES[familyIndex]
      const modelIndex = model as keyof typeof familyList
      slotPortInfo = slotOption || familyList[modelIndex][slotNumber - 1][0]
      totalPortNumber = slotPortInfo.split('X')[0]
    }

    return {
      slotNumber: slotNumber,
      enable: isEnable,
      option: slotOption,
      slotPortInfo: slotPortInfo,
      portStatus: generatePortData(totalPortNumber)
    }
  }
  return null
}

export const generatePortData = (totalNumber: string) => {
  let ports = []
  for (let i = 1; i <= Number(totalNumber); i++) {
    let port = { portNumber: i, portTagged: '' }
    ports.push(port)
  }
  return ports
}
