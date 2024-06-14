import {
  StackMember,
  SwitchSlot2 as SwitchSlot
} from '@acx-ui/rc/utils'

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

export const getUnitTitle = (index: number, stackMembers?: StackMember[]) => {
  const unit = index + 1
  const member = stackMembers?.filter(member => member.unitId === unit)?.[0]
  return member ? `${unit} - ${member?.model}` : ''
}