import { FormInstance, Space } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import _                       from 'lodash'

import {
  cssStr
} from '@acx-ui/components'
import {
  AclUnion,
  getPortSpeedOptions,
  LldpQosModel,
  SwitchPortViewModel,
  SwitchDefaultVlan,
  // SwitchVlans,
  SwitchVlanUnion,
  PortSetting,
  PortsSetting,
  Vlan
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

export interface PortVlan {
  tagged: string[]
  untagged: string
  voice: number | string
  isDefaultVlan: boolean
}

export const MultipleText = () => {
  const { $t } = getIntl()
  return <Space style={{
    fontSize: '12px',
    fontStyle: 'italic',
    color: cssStr('--acx-accents-orange-50')
  }}>
    {$t({ defaultMessage: 'Multiple values' })}
  </Space>
}

export const getFormItemLayout = (isMultipleEdit: boolean) => {
  return isMultipleEdit && {
    labelCol: { span: 10 },
    wrapperCol: { span: 16 },
    style: { width: '75%' }
  }
}

export const getToggleClassName = (
  field: string,
  isMultipleEdit: boolean,
  hasMultipleValue?: string[]
) => {
  return isMultipleEdit && !hasMultipleValue?.includes(field) ? 'switch-checked-fade' : ''
}

export const getPortSpeed = (selectedPorts: SwitchPortViewModel[]) => {
  const portsSpeedOptions = selectedPorts.map((item: SwitchPortViewModel) => {
    return getPortSpeedOptions(item.switchModel, item.portIdentifier)
  })

  return _.intersection(...portsSpeedOptions) as string[]
}

export const getAclOptions = (acls?: AclUnion) => {
  const { $t } = getIntl()
  const options = Object.values(acls ?? {}).flat()?.map((acl: string) => ({
    label: acl, value: acl, disabled: false
  }))

  return [
    { label: $t({ defaultMessage: 'None' }), value: '', disabled: false },
    ...sortOptions(options)
  ] as DefaultOptionType[]
}

export const getVlanOptions = (vlans: SwitchVlanUnion, defaultVlan: string, extra?: number) => {
  const { $t } = getIntl()
  const allVlans = getAllSwitchVlans(vlans)
  const options = allVlans?.map((v) => ({
    value: v.vlanId,
    label: $t({ defaultMessage: 'VLAN-{vlan}' }, { vlan: v.vlanId })
  })) ?? []

  const defaultOption = defaultVlan ? {
    value: defaultVlan,
    label: $t({ defaultMessage: 'VLAN-{vlan}  (Default VLAN)' }, { vlan: defaultVlan })
  } : {
    value: $t({ defaultMessage: 'Default VLAN (Multiple values)' }),
    label: $t({ defaultMessage: 'Default VLAN (Multiple values)' })
  }

  // handle voice VLAN doesn't exist in switch VLANs
  const isVoiceVlanExist = !!(options.filter(item => item.value === extra).length)
  const extraVlanOption = extra && (extra !== Number(defaultVlan)) && !isVoiceVlanExist
    ? [{ value: extra, label: `VLAN-${extra}`, disabled: true }] : []

  return [
    { label: $t({ defaultMessage: 'Select VLAN...' }), value: '' },
    defaultOption,
    ...sortOptions(options),
    ...extraVlanOption
  ]
}

export const getAllSwitchVlans = (vlans: SwitchVlanUnion) => {
  const allVlans = _.pickBy(vlans, (value, key) => key !== 'switchDefaultVlan')
  return Object.values(allVlans).flat()
}

export const checkVlanOptions = (
  vlanOptions:DefaultOptionType[],
  untaggedVlan:string,
  taggedVlans:string,
  init: PortVlan
) => {
  if (init?.voice) {
    const voiceVlan = init?.voice.toString()
    if (init?.untagged === voiceVlan && untaggedVlan !== voiceVlan) {
      vlanOptions = vlanOptions.filter(item => item.value !== Number(init?.voice))
      if (init?.isDefaultVlan) {
        vlanOptions = vlanOptions.filter(item => item.value !== 'Default VLAN (Multiple values)')
      }
    }
    if (init?.tagged.indexOf(voiceVlan) !== -1) {
      const tagArray = taggedVlans?.split(',') ?? []
      if (tagArray.indexOf(voiceVlan) === -1) {
        vlanOptions = vlanOptions.filter(item => item.value !== Number(init?.voice))
        if (init?.isDefaultVlan) {
          vlanOptions = vlanOptions.filter(item => item.value !== 'Default VLAN (Multiple values)')
        }
      }
    }
  }
  return vlanOptions
}

export const checkLldpListEqual = (lldpList: LldpQosModel[][]) => { // TODO
  let isEqual = true
  const sortByFields = ['applicationType', 'qosVlanType', 'vlanId', 'priority', 'dscp']
  const list = lldpList?.map(l =>
    _.sortBy(l?.map(v => _.omit(v, ['id'])), sortByFields)
  )
  // const isArrayEqual = (x:any, y:any) => _(x).xorWith(y, _.isEqual).isEmpty()
  // const aa =  list.map(l => JSON.stringify(l))

  list?.forEach((l, index) => {
    if (index !== (list.length -1) && !_.isEqual(list[index], list[index+1])) {
      isEqual = false
    }
  })

  return isEqual
}

export const checkAclIgnore = (
  field: keyof PortSetting,
  value?: string,
  aclsOptions?: DefaultOptionType[]
) => {
  return value && !aclsOptions?.find(item => item.value === value && !item.disabled) && field
}

export const checkVlanIgnore = (
  field: keyof PortSetting,
  value: string[] | Number,
  isMultipleEdit: boolean,
  useVenueSettings: boolean,
  isDirtyUntaggedVlan: boolean) => {
  return !isMultipleEdit && ((useVenueSettings && !value) || !isDirtyUntaggedVlan) && field
}

export const checkPortEditStatus = (
  form: FormInstance,
  portSetting: PortSetting,
  revert: boolean,
  taggedByVenue: string,
  untaggedByVenue: string
) => {
  const taggedVlans = form?.getFieldValue('taggedVlans') || portSetting?.taggedVlans
  const untaggedVlan = form?.getFieldValue('untaggedVlan') || portSetting?.untaggedVlan

  if (!revert && (taggedVlans || untaggedVlan)) {
    return 'port'
  } else if (taggedByVenue || untaggedByVenue) {
    return 'venue'
  } else {
    return 'default'
  }
}

export const getPortEditStatus = (status: string) => {
  const { $t } = getIntl()
  switch (status) {
    case 'port':
      return $t({ defaultMessage: 'Port level override' })
    case 'venue':
      return $t({ defaultMessage: 'Applied at venue' })
    case 'default':
      return $t({ defaultMessage: 'Default' })
    default:
      return '' //$t({ defaultMessage: 'Default' })
  }
}

export const getPoeCapabilityDisabled = (portSettings: PortSetting[]) => {
  return portSettings?.filter(s => !s.poeCapability)?.length > 1
}

export const getOverrideFields = (fieldsValue: PortSetting) => {
  return Object.entries(fieldsValue)
    .filter(v => v?.[1] && v?.[0].includes('Checkbox'))
    .map(v => v?.[0].split('Checkbox')?.[0])
}

export const sortOptions = (
  dataList: DefaultOptionType[],
  valueType = 'string',
  sortField = 'value'
) => {
  return dataList?.[0]?.[sortField]
    ? _.sortBy(dataList, (obj) =>
      valueType === 'number' ? parseInt(obj[sortField], 10) : obj[sortField]
    )
    : _.sortBy(dataList)
}

export const handlePortSpeedFor765048F = (selectedPorts: SwitchPortViewModel[]) => {
  return selectedPorts
    .filter(p => p.switchModel === 'ICX7650-48F')
    .map(p => Number(p?.portIdentifier?.split('/')?.pop()) < 25)?.length > 0
}

export const isPortOverride = (portSetting: PortSetting) => {
  if (portSetting.revert === false) {
    if (portSetting.hasOwnProperty('taggedVlans') || portSetting.hasOwnProperty('untaggedVlan')) {
      return true
    }
  }
  return false
}

export const getInitPortVlans = (portSetting: PortSetting[], defaultVlan: string) => {
  return portSetting.map(p => ({
    tagged: (p.taggedVlans ?? '').toString().split(','),
    untagged: (p.untaggedVlan ?? '').toString(),
    voice: p?.voiceVlan,
    isDefaultVlan: p?.voiceVlan === defaultVlan
  }))
}

export const getMultipleVlanValue = ( // TODO: rewrite
  selectedPorts: SwitchPortViewModel[],
  vlans: Vlan[],
  portsSetting: PortsSetting,
  defaultVlan: string,
  switchesDefaultVlan?: SwitchDefaultVlan[]
) => {
  const ports = selectedPorts?.map((p) => p.portIdentifier)
  const initPortVlans = [] as PortVlan[]
  const result = {
    tagged: new Array(ports.length).fill(undefined),
    untagged: new Array(ports.length).fill(undefined),
    voice: portsSetting?.response?.map(p => p.voiceVlan)
  }

  const portsProfileVlans = {
    tagged: new Array(ports.length).fill(undefined),
    untagged: new Array(ports.length).fill(undefined)
  }

  // Check Vlan
  vlans?.filter(v => v.switchFamilyModels)
    .forEach((item: Vlan) => {
      selectedPorts.forEach((p, index: number) => {
        const requestPort = '1' + p.portIdentifier.slice(1)
        const model = item?.switchFamilyModels?.find(i => i.model === p.switchModel) ?? false
        if (model) {
          if (model.taggedPorts && model.taggedPorts.split(',').includes(requestPort)) { //check here
            const vlanId = item.vlanId.toString()
            if (!result.tagged[index]) {
              result.tagged[index] = [vlanId]
              portsProfileVlans.tagged[index] = [vlanId]
            } else {
              result.tagged[index].push(vlanId)
              portsProfileVlans.tagged[index].push(vlanId)
            }
          }
          if (model.untaggedPorts && model.untaggedPorts.split(',').includes(requestPort)) {
            result.untagged[index] = item.vlanId
            portsProfileVlans.untagged[index] = item.vlanId
          }
        }
      })
    })
  // Check port
  portsSetting?.response?.forEach((item: PortSetting) => {
    selectedPorts.forEach((p: SwitchPortViewModel, index: number) => {
      if (item.port === p.portIdentifier && item.switchMac === p.switchSerial) {
        if (isPortOverride(item)) {
          result.tagged[index] = item.taggedVlans
          result.untagged[index] = item.untaggedVlan
        } else {
          // default
          if (!result.tagged[index]) {
            result.tagged[index] = ''
          }
          if (!result.untagged[index]) {
            result.untagged[index]
              = switchesDefaultVlan?.filter(s => s.switchId === item.switchMac)?.[0]?.defaultVlanId
          }
        }
      }
    })
  })

  portsSetting?.response?.forEach((item: PortSetting, index: number) => {
    const defaultVlan = switchesDefaultVlan?.filter(
      s => s.switchId === item.switchMac)?.[0]?.defaultVlanId

    initPortVlans.push({ ////
      untagged: result.untagged[index],
      tagged: result.tagged[index] || [],
      voice: item.voiceVlan,
      isDefaultVlan: item.voiceVlan === defaultVlan
    })
  })

  const untagEqual = _.uniq(result.untagged)?.length <= 1
  const tagEqual = _.uniq(result.tagged)?.length <= 1
  const voiceVlanEqual = _.uniq(result.voice)?.length <= 1

  return {
    tagged: tagEqual ? result.tagged?.[0] : null,
    untagged: untagEqual ? result.untagged?.[0] : (defaultVlan ?? 'Default VLAN (Multiple values)'),
    voice: voiceVlanEqual ? result.voice?.[0] : '',
    initPortVlans: initPortVlans,
    portsProfileVlans: portsProfileVlans
  }
}