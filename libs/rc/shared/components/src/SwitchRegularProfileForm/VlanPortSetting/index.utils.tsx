import _ from 'lodash'

import {
  SwitchModelSlot
} from '@acx-ui/rc/utils'

export interface Slot {
  slotNumber: number
  enable: boolean
  option: string
}

export const checkIfModuleFixed = (family: string, model: string): { //TODO
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

export const formatSlotConfigForSaving = (slots: Slot[]) => {
  return _.sortBy(slots?.map(slot => {
    return {
      slotNumber: slot.slotNumber,
      enable: slot.enable,
      ...( slot.slotNumber !== 1 ? { option: slot.option } : {})
    }
  }), 'slotNumber')
}

export const getModuleKey = (family: string, model: string, slots: SwitchModelSlot[]) => {
  const familymodel = `${family}-${model}`
  const moduleFixed = checkIfModuleFixed(family, model)
  const isDefaultModule = moduleFixed?.moduleSelectionEnable === false
  const enableModuleInfo = slots
    ?.filter(slot => slot.slotNumber !== 1)
    .map(slot => {
      return `Module ${slot.slotNumber}: ${slot.option}`
    }).sort()

  const moduleCategory = isDefaultModule ? ['Module: Default'] : enableModuleInfo

  return moduleCategory?.length ?
    `${familymodel}_${moduleCategory.join(', ')}` : `${familymodel}_--`
}