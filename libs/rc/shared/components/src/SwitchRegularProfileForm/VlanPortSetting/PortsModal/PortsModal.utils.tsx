import { DefaultOptionType } from 'antd/lib/select'

import {
  SwitchSlot2 as SwitchSlot,
  ICX_MODELS_MODULES
} from '@acx-ui/rc/utils'

export interface PortsType {
  label: string,
  value: string
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
    createSlotOptions(modelModules, 1) ?? [],
    createSlotOptions(modelModules, 2) ?? [],
    createSlotOptions(modelModules, 3) ?? []
  ]

  return slotOptionLists
}

export const selectedGroupByPrefix = (selected: string[]) => {
  // Output:
  // {
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
