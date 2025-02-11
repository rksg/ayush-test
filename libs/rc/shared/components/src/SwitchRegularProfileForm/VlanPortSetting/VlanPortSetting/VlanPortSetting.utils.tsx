// import { DefaultOptionType } from 'antd/lib/select'

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

export const getSlots = (family: string, model: string) => { //: SlotOptionsResult
  const familyIndex = family as keyof typeof ICX_MODELS_MODULES
  const modelIndex = model as keyof typeof familyList

  const familyList = ICX_MODELS_MODULES[familyIndex]
  const slots = familyList[modelIndex]
  const slotOptionLists = [
    createSlotOptions(slots, 1) ?? [],
    createSlotOptions(slots, 2) ?? [],
    createSlotOptions(slots, 3) ?? []
  ]

  return {
    slots,
    slotOptionLists
  }
}

const createSlotOptions = (slots: string[][], slotIndex: number) => {
  const slotOptions = []
  if (slots.length > slotIndex) {
    for (let value of slots?.[slotIndex]) {
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
  selectedOptionOfSlot2?: string,
  selectedOptionOfSlot3?: string
} => {
  if (!family) return {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slots, slotOptionLists } = getSlots(family, model)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ optionListForSlot1, optionListForSlot2, optionListForSlot3 ] = slotOptionLists

  if (family === 'ICX7550') {
    return {
      moduleSelectionEnable: true,
      module2SelectionEnable: false,
      enableSlot2: true,
      selectedOptionOfSlot2: optionListForSlot2[0]?.value
    }
  }

  if (family === 'ICX8200') {
    return {
      moduleSelectionEnable: false,
      module2SelectionEnable: false,
      enableSlot2: true,
      selectedOptionOfSlot2: optionListForSlot2[0]?.value
    }
  }

  if (family === 'ICX8100') {
    return {
      moduleSelectionEnable: false,
      module2SelectionEnable: false,
      enableSlot2: true,
      selectedOptionOfSlot2: optionListForSlot2[0]?.value
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
          enableSlot3: true,
          selectedOptionOfSlot2: optionListForSlot2[0]?.value,
          selectedOptionOfSlot3: optionListForSlot3[0]?.value
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
          enableSlot2: true,
          selectedOptionOfSlot2: optionListForSlot2[0]?.value
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

// TODO: reduce redundant code
// const getModuleContent = (
//   type: string, module: PortsType[], index: number,
//   slotIndex: number, slotData: SwitchSlot, selectedItems: string[],
//   handleCheckboxGroupChange: (checkedValues: string[], moduleGroup: string) => void
// ) => {
//   const { $t } = getIntl()
//   const checkboxClassName = type === 'untagged_module' ? 'lightblue' : 'purple'
//   return module && <Col>
//     <Row gutter={20}>
//       <Col>
//         <div>
//           <Typography.Text style={{ fontWeight: 'bold' }}>
//             {$t({ defaultMessage: 'Module {slotIndex}' }, { slotIndex })}
//           </Typography.Text>
//         </div>
//         <Typography.Paragraph>
//           {$t({ defaultMessage: '{module}' },
//             { module: slotData?.slotPortInfo?.split('X').join(' X ') })}
//         </Typography.Paragraph>
//         <UI.Module>
//           <Checkbox.Group
//             key={`checkboxGroup_module${index+1}_${slotIndex}`}
//             className={checkboxClassName}
//             onChange={(checkedValues) =>
//               handleCheckboxGroupChange(checkedValues as string[], `${index+1}/${slotIndex}`)}
//             value={selectedItems}
//             options={module.map((timeslot, i) => ({
//               label: <Tooltip
//                 title={getTooltip(timeslot.value)}
//               >
//                 <div
//                   id={`${type}${index+1}_${slotIndex}_${i+1}`}
//                   data-value={timeslot.value}
//                   data-testid={`${type}${index+1}_${slotIndex}_${i+1}`}
//                   data-disabled={getDisabledPorts(timeslot.value)}
//                   style={{ width: '20px', height: '20px' }}
//                 ></div>
//                 <p>{getPortLabel(i+1, slotIndex)}</p>
//               </Tooltip>,
//               value: timeslot.value,
//               disabled: getDisabledPorts(timeslot.value)
//             }))}
//           />
//         </UI.Module>
//       </Col>
//     </Row>
//   </Col>
// }