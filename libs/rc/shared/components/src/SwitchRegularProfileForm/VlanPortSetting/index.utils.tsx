import _                 from 'lodash'
import { defineMessage } from 'react-intl'

import {
  SwitchModelSlot,
  SwitchModel,
  SwitchVlans,
  SwitchSlot2
} from '@acx-ui/rc/utils'

export interface Slot {
  slotNumber: number
  enable: boolean
  option: string
}

export interface PortSetting {
  id?: string
  port: string
  untaggedVlan: string[]
  taggedVlans: string[]
}

export interface ModuleGroupByModel {
  id: string
  familymodel: string
  groupbyModules: ModulePorts[]
}

export interface ModulePorts {
  key: string
  familymodel: string
  slots: Slot[]
  isDefaultModule: boolean,
  module?: string
  port?: string
  ports: PortSetting[]
}

export interface VlanPortMap {
  model: string
  slots: Slot[]
  taggedPorts: string
  untaggedPorts: string
}

export interface VlanMap {
  [vlan: string]: VlanPortMap
}

export interface PortsModalSetting {
  enableSlot2?: boolean
  enableSlot3?: boolean
  enableSlot4?: boolean
  family: string
  model: string
  selectedOptionOfSlot2?: string
  selectedOptionOfSlot3?: string
  portSettings: PortSetting[]
  slots: SwitchSlot2[]
}

export interface PortsType {
  label: string,
  value: string
}

/* eslint-disable max-len */
export const VlanPortMessages = {
  CANNOT_BE_SAME_AS_TAGGED: defineMessage({
    defaultMessage: 'Cannot be same as Tagged VLAN'
  }),
  CANNOT_BE_SAME_AS_UNTAGGED: defineMessage({
    defaultMessage: 'Cannot be same as Untagged VLAN'
  }),
  PORT_HAS_BEEN_CONFIGURED_UNTAGGED: defineMessage({
    defaultMessage: 'The selected port(s) is already assigned with a different untagged VLAN. This can happen due to the same switch model selected previously with a different set of modules.'
  }),
  VLAN_HAS_BEEN_CONFIGURED_IN_MODEL: defineMessage({
    defaultMessage: 'This VLAN is already assigned to the selected port. This can happen due to the same switch model selected previously with a different set of modules.'
  }),
  CANNOT_BE_EDITED: defineMessage({
    defaultMessage: 'Editing is only possible if it\'s the same module within the same series.'
  }),
  NO_TAGGED_OR_UNTAGGED_VLAN: defineMessage({
    defaultMessage: 'Please ensure that at least one Tagged or Untagged VLAN is configured.'
  }),
  DELETE_MODULE_WHEM_APPLY_ONBOARD_ENABLED: defineMessage({
    defaultMessage: 'Any VLANs defined on ports of these modules\' will get removed. Are you sure you want to continue?'
  }),
  NO_AVAILABLE_VLANS: defineMessage({
    defaultMessage: 'There are no VLANs available to configure the ports.'
  })
}
/* eslint-enable */

export const checkIfModuleFixed = (family: string, model: string): {
  moduleSelectionEnable?: boolean,
  module2SelectionEnable?: boolean,
  enableSlot2?: boolean,
  enableSlot3?: boolean
} => {
  if (!family) return {}
  if (family === 'ICX7550') {
    return {
      moduleSelectionEnable: true,
      module2SelectionEnable: false,
      enableSlot2: true
    }
  }

  if (family === 'ICX8200') {
    return {
      moduleSelectionEnable: false,
      module2SelectionEnable: false,
      enableSlot2: true
    }
  }

  if (family === 'ICX8100') {
    return {
      moduleSelectionEnable: false,
      module2SelectionEnable: false,
      enableSlot2: true
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
        }

      case 'C08P':
      case 'C08PT':
      case '48ZP':
      case '48FS':
      case '48F':
        return {
          moduleSelectionEnable: false,
          enableSlot2: true
        }

      default:
        return {
          moduleSelectionEnable: true
        }
    }
  }
  return {}
}

export const formattedSlotConfig = (slots: Slot[]) => { // slots saved format
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

export const getSelectedRows = (
  selectedModuleKeys: string[],
  vlanPortList: ModuleGroupByModel[]
) => {
  return selectedModuleKeys.map(key => {
    const selectedModel = vlanPortList.find(vlanPort => vlanPort.id === key.split('_')[0])
    const selectedRow = selectedModel?.groupbyModules.find(
      module => module.key === key
    )
    return selectedRow ? selectedRow : {}
  }).filter(row => row) as ModulePorts[]
}

const getPortArray = (ports?: string) => {
  return ports ? ports.split(',') : []
}

export const getVlanMap = (ports: PortSetting[], familymodel: string, slots: Slot[]): VlanMap => {
  return ports?.reduce<VlanMap>((result, row) => {
    const vlans = row.taggedVlans.concat(row.untaggedVlan)
    vlans.forEach((vlan: string) => {
      if (!result[vlan]) {
        result[vlan] = {
          model: familymodel as string,
          slots: slots,
          taggedPorts: row.taggedVlans.includes(vlan) ? row.port : '',
          untaggedPorts: row.untaggedVlan.includes(vlan) ? row.port : ''
        }
      } else {
        if (row.taggedVlans.includes(vlan)) {
          result[vlan].taggedPorts = [
            ...new Set([...result[vlan].taggedPorts.split(','), row.port])
          ].filter(port => port).join(',')
        }
        if (row.untaggedVlan.includes(vlan)) {
          result[vlan].untaggedPorts = [
            ...new Set([...result[vlan].untaggedPorts.split(','), row.port])
          ].filter(port => port).join(',')
        }
      }
    })
    return result
  }, {}) ?? {}
}

export const getUpdatedVlans = (
  selectedRows: ModulePorts[],
  vlans: SwitchVlans[],
  updatedValues?: PortsModalSetting
) => {
  return selectedRows.reduce((result, selectedRow) => {
    if (!selectedRow) return vlans

    // remove existing vlans
    const vlanMap = getVlanMap(selectedRow?.ports, selectedRow.familymodel, selectedRow.slots)
    return result.map((vlan: SwitchVlans) => {
      const selectedVlan = vlanMap[vlan.vlanId]
      if (!selectedVlan) return vlan

      const selectedVlanSlots = formattedSlotConfig(selectedVlan?.slots)
      const existingModule = vlan.switchFamilyModels?.find(
        v => _.isEqual(_.sortBy(v.slots, 'slotNumber'), selectedVlanSlots)
      )

      if (!existingModule) return vlan
      const updatedSwitchFamilyModels = vlan.switchFamilyModels
        .map(model => updateSwitchModel(model, selectedVlan, existingModule))
        .filter(model => model !== null) as SwitchModel[]

      return { ...vlan, switchFamilyModels: updatedSwitchFamilyModels }
    })

  }, vlans).map((vlan: SwitchVlans) => {
    if (!updatedValues) return vlan

    // add new vlans
    const familymodel = `${updatedValues.family}-${updatedValues.model}`
    const vlanMap = getVlanMap(updatedValues.portSettings, familymodel, updatedValues.slots)
    const updatedVlan = vlanMap[vlan.vlanId]
    const updatedVlanSlots = formattedSlotConfig(updatedVlan?.slots)
    const existingModule = vlan.switchFamilyModels?.find(
      v => _.isEqual(_.sortBy(v.slots, 'slotNumber'), updatedVlanSlots)
    )

    return {
      ...( updatedVlan ? _.omit(vlan, 'id') : vlan),
      ...( existingModule ? {
        switchFamilyModels: vlan.switchFamilyModels.map(model => {
          if (model.id === existingModule.id) {
            const orinTaggedPorts = getPortArray(model.taggedPorts)
            const orinUntaggedPorts = getPortArray(model.untaggedPorts)
            const updatedTaggedPorts = getPortArray(updatedVlan.taggedPorts)
            const updatedUntaggedPorts = getPortArray(updatedVlan.untaggedPorts)

            const updatedTagged = [...orinTaggedPorts, ...updatedTaggedPorts].toString()
            const updatedUntagged = [...orinUntaggedPorts, ...updatedUntaggedPorts].toString()

            if (!updatedTagged && !updatedUntagged) {
              return null
            }
            return {
              ...model,
              taggedPorts: updatedTagged,
              untaggedPorts: updatedUntagged
            }
          }
          return model
        }).filter(model => model)
      } : ( updatedVlan ? {
        switchFamilyModels: (vlan.switchFamilyModels ?? []).concat({
          id: '',
          model: `${updatedValues.family}-${updatedValues.model}`,
          slots: updatedVlanSlots,
          taggedPorts: updatedVlan?.taggedPorts.toString(),
          untaggedPorts: updatedVlan?.untaggedPorts.toString()
        })
      } : {}))
    }
  })
}

export const updateSwitchModel = (
  model: SwitchModel,
  selectedVlan: VlanPortMap,
  existingModule: SwitchModel
) => {
  if (model.id !== existingModule.id) return model

  const updatedTagged = _.difference(
    model.taggedPorts?.split(','), selectedVlan.taggedPorts?.split(',')).toString()
  const updatedUntagged = _.difference(
    model.untaggedPorts?.split(','), selectedVlan.untaggedPorts?.split(',')).toString()

  return updatedTagged || updatedUntagged
    ? { ...model, taggedPorts: updatedTagged, untaggedPorts: updatedUntagged }
    : null
}

export const getUpdatedVlanPortList = (
  vlanPortList: ModuleGroupByModel[],
  selectedModuleKeys: string[],
  updatedValues?: PortsModalSetting
): ModuleGroupByModel[] => {
  const selectedModelKeys = _.uniq(selectedModuleKeys.map(key => key.split('_')[0]))
  const filteredVlanPortList = vlanPortList.map(vlanPort => {
    // remove selected models
    const isSelectedModel = selectedModelKeys.includes(vlanPort.id)

    if (isSelectedModel) {
      const filteredModules = vlanPort.groupbyModules.filter(
        module => !selectedModuleKeys.includes(module.key)
      )
      return filteredModules.length
        ? { ..._.omit(vlanPort, 'groupbyModules'), groupbyModules: filteredModules }
        : null
    }

    return vlanPort

  }).filter((vlanPort): vlanPort is ModuleGroupByModel => Boolean(vlanPort))

  if (updatedValues) {
    const familymodel = `${updatedValues.family}-${updatedValues.model}`
    let existingModel = filteredVlanPortList.find(item => item.id === familymodel)
    const modulekey = getModuleKey(updatedValues.family, updatedValues.model, updatedValues.slots)
    const moduleFixed = checkIfModuleFixed(updatedValues.family, updatedValues.model)
    const isDefaultModule = moduleFixed?.moduleSelectionEnable === false
    const updatedPortSettings = updatedValues.portSettings.filter(port => {
      return port.taggedVlans.length || port.untaggedVlan.length
    })

    if (existingModel) {
      let existingModule = existingModel.groupbyModules.find(module => module.key === modulekey)

      if (existingModule) {
        existingModule.ports = updatedPortSettings.reduce((result, port) => {
          const existingPort = existingModule?.ports.find(p => p.port === port.port)
          if (existingPort) {
            return [
              ...result.filter(p => p.port !== port.port),
              {
                ...existingPort,
                untaggedVlan: [...new Set([...existingPort.untaggedVlan, ...port.untaggedVlan])],
                taggedVlans: [...new Set([...existingPort.taggedVlans, ...port.taggedVlans])]
              }
            ]
          }
          return [
            ...result,
            {
              id: `${familymodel}-${port.port}`,
              port: port.port,
              untaggedVlan: port.untaggedVlan,
              taggedVlans: port.taggedVlans
            }
          ]
        }, existingModule.ports)
      } else {
        existingModel.groupbyModules.push({
          key: modulekey,
          familymodel,
          isDefaultModule,
          slots: updatedValues.slots,
          ports: updatedPortSettings.map(port => ({
            id: `${familymodel}-${port.port}`,
            port: port.port,
            untaggedVlan: port.untaggedVlan,
            taggedVlans: port.taggedVlans
          }))
        })
      }
    } else {
      filteredVlanPortList.push({
        id: familymodel,
        familymodel,
        groupbyModules: [
          {
            key: modulekey,
            familymodel,
            isDefaultModule,
            slots: updatedValues.slots,
            ports: updatedPortSettings.map(port => ({
              id: `${familymodel}-${port.port}`,
              port: port.port,
              untaggedVlan: port.untaggedVlan,
              taggedVlans: port.taggedVlans
            }))
          }
        ]
      })
    }
  }

  return filteredVlanPortList
}