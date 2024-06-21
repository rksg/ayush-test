import {
  StackMember,
  SwitchSlot2 as SwitchSlot
} from '@acx-ui/rc/utils'

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

export const getUnitTitle = (module: PortsType[][], stackMembers?: StackMember[]) => {
  const unit = getUnit(module)
  const member = stackMembers?.filter(member => member.unitId === unit)?.[0]
  return member ? `${unit} - ${member?.model}` : ''
}

export const getModule = (module: PortsType[][], slot: string) => {
  const unit = getUnit(module)
  const index = module.findIndex(subArray =>
    subArray.some(item => item.value === `${unit}/${slot}/1`)
  )

  return module[index]
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