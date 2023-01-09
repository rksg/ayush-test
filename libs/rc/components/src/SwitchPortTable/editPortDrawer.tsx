import { useEffect, useState } from 'react'

import { Checkbox, Divider, Form, Input, Select, Space, Switch } from 'antd'
import { DefaultOptionType }                                     from 'antd/lib/select'
import _                                                         from 'lodash'
import { defineMessage }                                         from 'react-intl'

import {
  Button,
  cssStr,
  Drawer,
  showActionModal,
  Subtitle,
  Tooltip,
  Loader
} from '@acx-ui/components'
import {
  switchApi,
  useGetAclUnionQuery,
  useGetDefaultVlanQuery,
  useLazyGetPortSettingQuery,
  useLazyGetPortsSettingQuery,
  useLazyGetSwitchVlanQuery,
  useLazyGetSwitchVlansQuery,
  useLazyGetSwitchesVlanQuery,
  useLazyGetSwitchConfigurationProfileByVenueQuery,
  useLazyGetSwitchRoutedListQuery,
  useLazyGetTaggedVlansByVenueQuery,
  useLazyGetUntaggedVlansByVenueQuery,
  useLazyGetVlansByVenueQuery,
  useLazyGetVenueRoutedListQuery,
  useSwitchDetailHeaderQuery,
  useSavePortsSettingMutation
} from '@acx-ui/rc/services'
import {
  getPortSpeedOptions,
  LldpQosModel,
  poeBudgetRegExp,
  PORT_SPEED,
  SwitchPortViewModel,
  SwitchAclUnion,
  SwitchDefaultVlan,
  SwitchVlans,
  SwitchVlanUnion,
  PortSetting,
  PortsSetting,
  Vlan
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { store }     from '@acx-ui/store'
import { getIntl }   from '@acx-ui/utils'

import { EditLldpModal }   from './editLldpModal'
import { LldpQOSTable }    from './lldpQOSTable'
import { SelectVlanModal } from './selectVlanModal'
import * as UI             from './styledComponents'

// enum CurrentAclEdition {
//   INGRESS = 'INGRESS',
//   EGRESS = 'EGRESS'
// }

const poeClassOptions = [
  { label: defineMessage({ defaultMessage: 'Negotiate' }), value: 'UNSET' },
  { label: defineMessage({ defaultMessage: '0 (802.3af 15.4 W)' }), value: 'ZERO' },
  { label: defineMessage({ defaultMessage: '1 (802.3af 4.0 W)' }), value: 'ONE' },
  { label: defineMessage({ defaultMessage: '2 (802.3af 7.0 W)' }), value: 'TWO' },
  { label: defineMessage({ defaultMessage: '3 (802.3af 15.4 W)' }), value: 'THREE' },
  { label: defineMessage({ defaultMessage: '4 (802.3af 30 W)' }), value: 'FOUR' }
]

const poePriorityOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
]

const allMultipleEditableFields = [
  'dhcpSnoopingTrust', 'egressAcl', 'ingressAcl', 'ipsg', 'lldpEnable',
  'name', 'poeClass', 'poeEnable', 'poePriority', 'portEnable', 'portSpeed',
  'rstpAdminEdgePort', 'stpBpduGuard', 'stpRootGuard', 'taggedVlans', 'voiceVlan',
  'lldpQos', 'tags', 'untaggedVlan', 'poeBudget', 'portProtected'
]

// TODO: move
/* eslint-disable max-len */
export const EditPortMessages = {
  UNSELECT_VLANS: defineMessage({
    defaultMessage: 'The port must be a member of at least one VLAN'
  }),
  ADD_VLAN_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s venue to add/edit VLANs'
  }),
  ADD_ACL_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s venue to add/edit ACL'
  }),
  ADD_LLDP_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s venue to add/edit LLDP QoS'
  }),
  VOICE_VLAN_DISABLE: defineMessage({
    defaultMessage: 'No profile VLAN or VLAN option'
  }),
  USE_VENUE_SETTINGS_DISABLE: defineMessage({
    defaultMessage: 'Venue settings default VLAN ID is the same as one of switch VLANs'
  }),
  POE_CAPABILITY_DISABLE: defineMessage({
    defaultMessage: 'Can not configure PoE configurations(PoE Enable, PoE Class, and PoE Priority) since this port doesn\'t have PoE capability.'
  }),
  TAGGED_VLAN_TOOLTIP: defineMessage({
    defaultMessage: 'Cannot set tagged VLANs when IPSG is activated on the port'
  })
  // IPSG_WITH_NOT_PURE_UNTAGGED_VLAN: defineMessage({
  //   defaultMessage: 'You can\'t assign IPSG on the port when it has untagged VLAN which relative to a VE'
  // }),
  // IPSG_WITH_TAGGED_VLANS: defineMessage({
  //   defaultMessage: 'You can\'t assign IPSG on the port when it has tagged VLANs'
  // }),
  // IPSG_WITH_MULTI_TAGGED_VLANS: defineMessage({
  //   defaultMessage: 'You can\'t assign IPSG on the port when one or more selected ports have tagged VLANs'
  // })
}

export const MultipleEditPortMessages = {
  UNSELECT_VLANS: defineMessage({
    defaultMessage: 'Each port must be a member of at least one VLAN'
  }),
  POE_CAPABILITY_DISABLE: defineMessage({
    defaultMessage: 'Can not configure PoE configurations(PoE Enable, PoE Class, and PoE Priority) since one or more ports don\'t have PoE capability.'
  })
}
/* eslint-enable */

export function EditPortDrawer ({
  visible,
  setDrawerVisible,
  isCloudPort,
  isMultipleEdit,
  isVenueLevel,
  selectedPorts,
  switchModel = ''
}: {
  visible: boolean,
  setDrawerVisible: (visible: boolean) => void,
  isCloudPort: boolean,
  isMultipleEdit: boolean,
  isVenueLevel: boolean,
  selectedPorts: SwitchPortViewModel[],
  switchModel?: string
}) {
  const { $t } = getIntl()
  const [form] = Form.useForm()
  const { useWatch } = Form
  const {
    portEnableCheckbox,
    poeEnableCheckbox,
    poeEnable,
    poeClassCheckbox,
    poeClass,
    poePriorityCheckbox,
    poeBudgetCheckbox,
    poeBudget,
    portVlansCheckbox,
    untaggedVlan,
    taggedVlans,
    voiceVlanCheckbox,
    voiceVlan,
    portProtectedCheckbox,
    lldpEnableCheckbox,
    portSpeedCheckbox,
    rstpAdminEdgePortCheckbox,
    stpBpduGuardCheckbox,
    stpRootGuardCheckbox,
    dhcpSnoopingTrustCheckbox,
    ipsgCheckbox,
    ipsg,
    lldpQosCheckbox,
    ingressAclCheckbox,
    egressAclCheckbox,
    tagsCheckbox
  } = (useWatch([], form) ?? {})

  const { tenantId, switchId, serialNumber } = useParams()
  const [loading, setLoading] = useState<boolean>(true)

  const defaultVlanName = 'DEFAULT-VLAN'
  const switches: string[] = _.uniq(selectedPorts.map(p => p.switchMac))
  const disablePortSpeed = handlePortSpeedFor765048F(selectedPorts)

  const [vlansOptions, setVlansOptions] = useState([] as DefaultOptionType[])
  const [portSpeedOptions, setPortSpeedOptions] = useState([] as string[])
  const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
  const [vlanUsedByVe, setVlanUsedByVe] = useState('')

  const [editPortData, setEditPortData] = useState(null as unknown as PortSetting)
  const [disablePoeCapability, setDisablePoeCapability] = useState(false)

  const [lldpQosList, setLldpQosList] = useState([] as LldpQosModel[])
  // const [revertStatus, setRevertStatus] = useState(false)
  const [portEditStatus, setPortEditStatus] = useState('')
  const [hasSwitchProfile, setHasSwitchProfile] = useState(false)
  const [profileDefaultVlan, setProfileDefaultVlan] = useState(null as unknown as Number)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [disabledUseVenueSetting, setDisabledUseVenueSetting] = useState(false)
  const [defaultVlan, setDefaultVlan] = useState('')
  const [switchVlans, setSwitchVlans] = useState({} as SwitchVlanUnion)

  const [venueVlans, setVenueVlans] = useState([] as Vlan[])
  const [venueTaggedVlans, setVenueTaggedVlans] = useState([] as string[])
  const [venueUntaggedVlan, setVenueUntaggedVlan] = useState(null as unknown as string)

  // remove var
  // const [disableText, setDisableText] = useState('' as unknown as string)
  // const [isDirtyUntaggedVlan, setIsDirtyUntaggedVlan] = useState(true) ///?
  // const [blockTaggedVlanConfig, setBlockTaggedVlanConfig] = useState(false) // X
  const [selectModalvisible, setSelectModalvisible] = useState(false)
  const [lldpModalvisible, setLldpModalvisible] = useState(false)
  const [hasMultipleValue, setHasMultipleValue] = useState([] as string[])
  const [disableSaveButton, setDisableSaveButton] = useState(false)

  // const [withNotPureUntaggedVlan, setWithNotPureUntaggedVlan] = useState(false)
  // const [withoutTaggedVlan, setWithoutTaggedVlan] = useState(false)

  // const [isDefaultUntaggedVlan, setIsDefaultUntaggedVlan] = useState(false)
  const [initPortVlans, setInitPortVlans] = useState([] as any)
  // const [portsProfileVlans, setPortsProfileVlans] = useState({
  //   tagged: [],
  //   untagged: []
  // })
  // updateAcl updateVlan
  // withNotPureUntaggedVlan = enable untaggedVlan && isDefaultUntaggedVlan && !this.portForm.get('IPSG')
  // withoutTaggedVlan = taggedVlans / taggedVlansByVenue is empty

  const [getPortSetting] = useLazyGetPortSettingQuery()
  const [getPortsSetting] = useLazyGetPortsSettingQuery()
  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()
  const [getSwitchVlans] = useLazyGetSwitchVlansQuery()
  const [getSwitchesVlan] = useLazyGetSwitchesVlanQuery()
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const [getTaggedVlansByVenue] = useLazyGetTaggedVlansByVenueQuery()
  const [getUntaggedVlansByVenue] = useLazyGetUntaggedVlansByVenueQuery()
  const [getSwitchConfigurationProfileByVenue] = useLazyGetSwitchConfigurationProfileByVenueQuery()
  const [getSwitchRoutedList] = useLazyGetSwitchRoutedListQuery()
  const [getVenueRoutedList] = useLazyGetVenueRoutedListQuery()
  const [savePortsSetting, { isLoading: isPortsSettingUpdating }] = useSavePortsSettingMutation()

  const { data: switchDetail }
    = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })
  const { data: aclUnion } = useGetAclUnionQuery({ params: { tenantId, serialNumber } })
  const { data: switchesDefaultVlan }
    = useGetDefaultVlanQuery({ params: { tenantId }, payload: switches }) // ['58:fb:96:0e:82:8a', 'c0:c5:20:aa:32:79']

  // console.log('switchDetail: ', switchDetail)
  // console.log('switchesDefaultVlan: ', switchesDefaultVlan)
  // console.log('selectedPorts: ', vlanUsedByVe, selectedPorts, poeClass)
  // console.log('taggedVlans: ', taggedVlans, ' untaggedVlans:', untaggedVlan)
  // console.log('*** selectedPorts: ', selectedPorts)
  // console.log('hasMultipleValue: ', hasMultipleValue)

  const getVlans = async () => {
    return switches.length > 1
      // eslint-disable-next-line max-len
      ? await getSwitchesVlan({ params: { tenantId, serialNumber }, payload: switches }, true).unwrap()
      : await getSwitchVlan({ params: { tenantId, serialNumber } }, true).unwrap()
  }

  const getMultiplePortsSetting = async () => {
    const portsSettingPayload = switches.map((s) => ({
      switchId: s,
      ports: selectedPorts
        .filter(p => p.switchSerial === s)
        .map(p => p.portIdentifier)
    }))

    return await getPortsSetting({
      params: { tenantId }, payload: portsSettingPayload
    }, true).unwrap()
  }

  const getVeRouted = async (isVenueLevel: boolean, venueId?: string) => {
    const veRouteQueryParams = {
      params: { tenantId, switchId, venueId },
      payload: {
        fields: ['id', 'portNumber', 'portType'],
        sortField: 'name',
        pageSize: 10000
      }
    }
    const veRouted = isVenueLevel
      ? await getVenueRoutedList(veRouteQueryParams, true).unwrap()
      : await getSwitchRoutedList(veRouteQueryParams, true).unwrap()

    return veRouted?.data
  }

  const getEachSwitchVlans = async () => {
    // const ss = ['58:fb:96:0e:82:8a', 'c0:c5:20:aa:32:79']
    const switchVlans = switches?.map(async (switchId) => { //switches
      return await getSwitchVlans({
        params: { tenantId, serialNumber: switchId }
      }, true).unwrap()
    })
    return Promise.all(switchVlans)
  }

  const getUseVenueSettingDisabled = async (profileDefaultVlan: Number) => {
    const switchVlans = (await getEachSwitchVlans())?.flat()

    return switchVlans?.filter((v) =>
      v.vlanName !== defaultVlanName && v.vlanId === profileDefaultVlan
    )?.length > 0
  }

  useEffect(() => {
    const setData = async () => {
      const switchVlans = await getVlans()
      const vlansByVenue = await getVlansByVenue({
        params: { tenantId, venueId: switchDetail?.venueId }
      }, true).unwrap()

      const switchProfile = await getSwitchConfigurationProfileByVenue({
        params: { tenantId, venueId: switchDetail?.venueId }
      }, true).unwrap()

      const veRouted = await getVeRouted(isVenueLevel, switchDetail?.venueId)
      const vlanUsedByVe = veRouted?.filter(v => v?.portNumber)
        ?.[0]?.portNumber?.split('-')?.[2] || '' //

      const portSpeed = getPortSpeed(selectedPorts)
      const defaultVlans = switchesDefaultVlan
        ? _.uniq(Object.values(switchesDefaultVlan)?.map(v => v?.defaultVlanId.toString()))
        : []
      const defaultVlan = defaultVlans?.length > 1 ? '' : defaultVlans?.[0]
      const profileDefaultVlan = switchProfile?.[0]?.vlans
        ?.find((item) => item.vlanName === 'DEFAULT-VLAN')?.vlanId ?? 1

      setPortSpeedOptions(portSpeed)
      setVlanUsedByVe(vlanUsedByVe)
      setDefaultVlan(defaultVlan)
      setSwitchVlans(switchVlans)
      setVenueVlans(vlansByVenue)
      setAclsOptions(getAclOptions(aclUnion))

      setHasSwitchProfile(!!switchProfile?.length) // move utils
      setProfileDefaultVlan(profileDefaultVlan)
      setDisabledUseVenueSetting(await getUseVenueSettingDisabled(profileDefaultVlan))

      if (isMultipleEdit) {
        const portsSetting = await getMultiplePortsSetting()
        const vlansValue = getMultipleVlanValue(
          selectedPorts, vlansByVenue, portsSetting, defaultVlan, switchesDefaultVlan
        )
        const hasMultipleValueFields = allMultipleEditableFields?.filter(field => {
          const isEqualValues = field === 'lldpQos'
            ? checkLldpListEqual(portsSetting?.response?.map(s => s[field]))
            : _.uniq(portsSetting?.response?.map(s => s[field as keyof PortSetting])
            )?.length === 1

          if (isEqualValues) {
            field === 'lldpQos'
              ? setLldpQosList(portsSetting?.response?.[0]?.lldpQos)
              : form.setFieldValue(
                field, portsSetting?.response?.[0]?.[field as keyof PortSetting]
              )
          }
          return !isEqualValues && field
        })

        const poeCapabilityDisabled = getPoeCapabilityDisabled(portsSetting?.response)

        setDisablePoeCapability(poeCapabilityDisabled)
        setHasMultipleValue(hasMultipleValueFields)
        setInitPortVlans(vlansValue?.initPortVlans)
        setDisableSaveButton(true)
        form.setFieldValue('taggedVlans', vlansValue.tagged)
        form.setFieldValue('untaggedVlan', vlansValue.untagged || defaultVlan)
        // form.setFieldValue('poeEnable', poeCapabilityDisabled ? false : )
        // poeCapabilityDisabled ? form.setFieldValue('poeEnable', false) : null ///???

      } else {
        const portSetting = await getPortSetting({
          params: { tenantId, serialNumber, portIdentifier: selectedPorts?.[0]?.portIdentifier }
        }, true).unwrap()
        const requestPort = selectedPorts?.[0]?.portIdentifier?.split('/').slice(1, 3).join('/') ////
        const taggedVlansByVenue = await getTaggedVlansByVenue({
          params: {
            tenantId, venueId: switchDetail?.venueId,
            model: selectedPorts?.[0]?.switchModel, port: `1/${requestPort}`
          }
        }, true).unwrap()
        const untaggedVlansByVenue = await getUntaggedVlansByVenue({
          params: {
            tenantId, venueId: switchDetail?.venueId,
            model: selectedPorts?.[0]?.switchModel, port: `1/${requestPort}`
          }
        }, true).unwrap()

        setEditPortData(portSetting)
        setDisablePoeCapability(getPoeCapabilityDisabled([portSetting]))
        setLldpQosList(portSetting.lldpQos || [])
        // setIsPoeEnable(portSetting.poeEnable)
        // setRevertStatus(portSetting.revert)
        setPortEditStatus(portSetting.revert ? 'venue' : 'port')
        setUseVenueSettings(
          portSetting.revert && !(portSetting?.taggedVlans && portSetting.untaggedVlan)
        )
        setVenueTaggedVlans(taggedVlansByVenue)
        setVenueUntaggedVlan(untaggedVlansByVenue)

        setInitPortVlans([{ //////
          tagged: (portSetting.taggedVlans ?? '').toString(),
          untagged: (portSetting.untaggedVlan ?? '').toString(),
          voice: portSetting?.voiceVlan,
          isDefaultVlan: false ////
        }])

        form.setFieldsValue({
          ...portSetting,
          poeEnable: portSetting.poeCapability ? portSetting.poeEnable : false,
          poeBudget: portSetting.poeBudget === 0 ? '' : portSetting.poeBudget,
          portSpeed: portSpeed.find(item => item === portSetting.portSpeed)
            ? portSetting.portSpeed : portSpeed?.[0],
          taggedVlans: (portSetting.taggedVlans ?? '').toString()
        })
      }

      setVlansOptions(getVlanOptions(switchVlans, defaultVlan, voiceVlan))
      setLoading(false)
    }

    resetFields()
    switchesDefaultVlan && switchDetail && setData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPorts, switchDetail, switchesDefaultVlan, visible]) // []



  const getFieldTooltip = (field: string) => {
    switch (field) {
      case 'portEnable':
        return isCloudPort ? $t({ defaultMessage: 'Uplink port cannot be disabled' }) : ''
      case 'poeEnable':
        return disablePoeCapability
          ? (isMultipleEdit
            ? $t(MultipleEditPortMessages.POE_CAPABILITY_DISABLE)
            : $t(EditPortMessages.POE_CAPABILITY_DISABLE)
          ) : ''
      case 'useVenuesettings':
        return disabledUseVenueSetting ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLE) : ''
      case 'voiceVlan':
        return vlansOptions?.length <= 1 ? $t(EditPortMessages.VOICE_VLAN_DISABLE) : ''
      case 'ingressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'egressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      default: return ''
    }
  }

  const getFieldDisabled = (field: string) => {
    switch (field) {
      case 'portEnable': return isCloudPort || (isMultipleEdit && !portEnableCheckbox)
      case 'poeEnable': return (isMultipleEdit && !poeEnableCheckbox) || disablePoeCapability
      case 'poeClass': return (isMultipleEdit && !poeClassCheckbox)
        || disablePoeCapability
        || !poeEnable
        || !!(!form?.getFieldError('poeBudget').length && poeBudget) //////////
      case 'poePriority':
        return (isMultipleEdit && !poePriorityCheckbox) || disablePoeCapability || !poeEnable
      case 'poeBudget': return (isMultipleEdit && !poeBudgetCheckbox)
        || disablePoeCapability
        || !poeEnable
        || (poeClass !== 'ZERO' && poeClass !== 'UNSET')
      case 'useVenuesettings': return disabledUseVenueSetting || switchDetail?.vlanCustomize
      case 'portProtected': return isMultipleEdit && !portProtectedCheckbox
      case 'lldpEnable': return isMultipleEdit && !lldpEnableCheckbox
      case 'portSpeed': return (isMultipleEdit && !portSpeedCheckbox) || disablePortSpeed
      case 'voiceVlan': return (isMultipleEdit && !voiceVlanCheckbox) || vlansOptions?.length <= 1
      case 'rstpAdminEdgePort': return isMultipleEdit && !rstpAdminEdgePortCheckbox
      case 'stpBpduGuard': return isMultipleEdit && !stpBpduGuardCheckbox
      case 'stpRootGuard': return isMultipleEdit && !stpRootGuardCheckbox
      case 'dhcpSnoopingTrust': return isMultipleEdit && !dhcpSnoopingTrustCheckbox
      case 'ipsg': return isMultipleEdit && !ipsgCheckbox
      case 'ingressAcl': return (isMultipleEdit && !ingressAclCheckbox) || ipsg
      case 'egressAcl': return isMultipleEdit && !egressAclCheckbox
      case 'tags': return isMultipleEdit && !tagsCheckbox
      default: return false
    }
  }

  const transformData = (data: PortSetting) => {
    const getInitIgnoreFields = () => {
      const overrideFields = getOverrideFields(form.getFieldsValue())
      if (overrideFields?.includes('portVlans')) {
        overrideFields.push('taggedVlans', 'untaggedVlan')
      }
      return !isMultipleEdit
        ? []
        : allMultipleEditableFields.filter(f => !overrideFields.includes(f))
    }

    const originalUntaggedVlan = editPortData?.untaggedVlan
    const isDirtyUntaggedVlan = !_.isEqual(originalUntaggedVlan, untaggedVlan?.toString)
    const ignoreFields = [
      ...getInitIgnoreFields(),
      isMultipleEdit && !portVlansCheckbox && 'revert',
      !data?.revert && !isMultipleEdit
      && ((useVenueSettings && !untaggedVlan) || !isDirtyUntaggedVlan) && 'untaggedVlan',
      !data?.revert && !isMultipleEdit
      && ((useVenueSettings && !taggedVlans) || !isDirtyUntaggedVlan) && 'taggedVlans',
      data?.egressAcl &&
      !aclsOptions.find(item => item.value === data.egressAcl && !item.disabled) && 'egressAcl',
      data?.ingressAcl &&
      !aclsOptions.find(item => item.value === data.ingressAcl && !item.disabled) && 'ingressAcl'
    ]

    Object.keys(data).forEach(key => {
      if (ignoreFields.includes(key) || key.includes('Checkbox')) {
        delete data[key as keyof PortSetting]
      }
    })

    return {
      data,
      ignoreFields: ignoreFields.filter(f => f)
    }
  }

  const applyForm = async () => {
    // console.log('save', form.getFieldsValue())
    const revert = useVenueSettings //portEditStatus === 'venue' || revertStatus
    const values = {
      ...form.getFieldsValue(),
      revert: useVenueSettings, //portEditStatus === 'venue' || revertStatus,
      ...(lldpQosList && { lldpQos:
        lldpQosList?.map(lldp => {
          return lldp.id.includes('lldp')
            ? _.omit(lldp, ['id'])
            : lldp
        })
      }),
      taggedVlans: (revert || !form.getFieldValue('taggedVlans'))
        ? null : form.getFieldValue('taggedVlans')?.split(','),
      untaggedVlan: revert ? '' : form.getFieldValue('untaggedVlan'),
      voiceVlan: form.getFieldValue('voiceVlan') ?? null /////
    }

    const { data: transformedValues, ignoreFields } = transformData(values)

    try {
      const payload = switches.map(item => {
        return {
          switchId: item,
          port: {
            ...transformedValues,
            ...(transformedValues?.untaggedVlan === 'Default VLAN (Multiple values)' && { //// multi
              untaggedVlan: switchesDefaultVlan
                ?.filter(v => v.switchId === item)
                .map(v => v.defaultVlanId)?.[0]
            }),
            ...(transformedValues?.voiceVlan === 'Default VLAN (Multiple values)' && {
              untaggedVlan: switchesDefaultVlan
                ?.filter(v => v.switchId === item)
                .map(v => v.defaultVlanId)?.[0]
            }),
            ignoreFields: ignoreFields.toString(),
            port: selectedPorts.map(p => p.portIdentifier)?.[0],
            ports: selectedPorts.map(p => p.portIdentifier)
          }
        }
      })

      await savePortsSetting({ params: { tenantId }, payload }).unwrap()
      store.dispatch(
        switchApi.util.invalidateTags([
          { type: 'SwitchPort', id: 'LIST' },
          { type: 'SwitchPort', id: 'Setting' }
        ])
      )
      setDrawerVisible(false)
      // form.resetFields()
    } catch (err) {
      console.log(err) // eslint-disable-line no-console
      // switchUtilsService.showGeneralError(errors);
    }
  }

  const resetFields = () => {
    setLoading(true)
    setLldpQosList([])
    form.resetFields()
  }

  const onApplyVenueSettings = () => {
    setUseVenueSettings(true)
    setPortEditStatus('venue')

    // if (this.portVlanCheck) {
    //   this.checkPortsVlan();
    // }

    form.setFieldsValue({
      ...form.getFieldsValue(),
      taggedVlans: venueTaggedVlans.toString(),
      untaggedVlan: venueUntaggedVlan?.toString() || profileDefaultVlan
    })
    // if (untaggedVlan === defaultVlan && !this.taggedVlansByVenue) {
    //   // Venue no setting, revert to default
    //   this.setLabelStatus('default', true);
    // }
  }

  const onValuesChange = async (changedValues: PortSetting) => {
    const changedField = Object.keys(changedValues)?.[0]
    const changedValue = Object.values(changedValues)?.[0]

    const setButtonStatus = () => {
      const isPoeBudgetInvalid = form?.getFieldError('poeBudget').length > 0
      const isVlansInvalid = isMultipleEdit
        ? portVlansCheckbox && (!untaggedVlan && !taggedVlans) //// enable & !useVenue?
        : (!untaggedVlan && !taggedVlans)
      const isNoOverrideFields = isMultipleEdit && !getOverrideFields(form.getFieldsValue())?.length
      setDisableSaveButton(isPoeBudgetInvalid || isVlansInvalid || isNoOverrideFields)
    }

    const updateVlanOptions = () => {
      const oldOptions = getVlanOptions(switchVlans, defaultVlan, voiceVlan)
      const options = initPortVlans?.map((p:any) => checkVlanOptions(oldOptions, untaggedVlan, taggedVlans, p))
      const newOptions = _.intersection(...options)
      setVlansOptions(newOptions as DefaultOptionType[])
      if (voiceVlan && (oldOptions.length > newOptions.length)) {
        form.setFieldValue('voiceVlan', '')
      }
    }

    setButtonStatus()

    switch (changedField) {
      case 'poeClass':
        const poeBudgetDisabled = changedValue !== 'ZERO' && changedValue !== 'UNSET'
        if (poeBudgetDisabled && (isMultipleEdit || !disablePoeCapability)) {
          form?.resetFields(['poeBudget'])
        }
        break
      case 'poeBudget':
        try {
          await form.validateFields(['poeBudget'])
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
        break
      case 'ipsg':
        changedValue && form.setFieldValue('ingressAcl', '')
        break
      // case 'portVlansCheckbox':
      case 'untaggedVlan': //
      case 'taggedVlans': //
        updateVlanOptions()
        break
      default:
    } 
  }

  const onClose = () => {
    setDrawerVisible(false)
  }

  const onApply = () => {
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'Modify Uplink Port?' }),
      content: $t({
        defaultMessage: `Modifying the uplink port may result in connectivity issues. 
      Are you sure you want to apply these changes?` }),
      okText: $t({ defaultMessage: 'Apply Changes' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: applyForm
    })
  }

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button disabled={loading} key='cancel' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button loading={loading}
        key='apply'
        type='secondary'
        disabled={disableSaveButton}
        onClick={isCloudPort ? onApply : applyForm}>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  ]

  return <Drawer
    title={$t({ defaultMessage: 'Edit Port' })}
    visible={visible}
    onClose={onClose}
    footer={footer}
    mask={false}
    children={<Loader states={[{
      isLoading: loading,
      isFetching: isPortsSettingUpdating
    }]}>
      <Form
        form={form}
        layout='vertical'
        // layout={isMultipleEdit ? 'horizontal' : 'vertical'}
        // labelAlign='left'
        // labelCol={{ span: 16 }}
        onValuesChange={onValuesChange}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Selected Port' })}
          children={
            <Space>
              {selectedPorts?.map(p => p.portIdentifier)?.join(', ')}
            </Space>
          }
        />

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='portEnableCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'Port Enabled' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            label={false}
            children={
              isMultipleEdit && !portEnableCheckbox && hasMultipleValue.includes('portEnable')
                ? <MultipleText />
                : <Tooltip title={getFieldTooltip('portEnable')}>
                  <Form.Item
                    name='portEnable'
                    noStyle
                    valuePropName='checked'
                    initialValue={false}
                  >
                    <Switch disabled={getFieldDisabled('portEnable')} />
                  </Form.Item>
                </Tooltip>
            }
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='poeEnableCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox disabled={disablePoeCapability} />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'PoE Enabled' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            children={<Tooltip title={getFieldTooltip('poeEnable')}>
              {isMultipleEdit && !poeEnableCheckbox && hasMultipleValue.includes('poeEnable')
                ? <MultipleText />
                : <Form.Item
                  name='poeEnable'
                  noStyle
                  valuePropName='checked'
                  initialValue={false}
                >
                  <Switch disabled={getFieldDisabled('poeEnable')} />
                </Form.Item>
              }</Tooltip>
            }
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='poeClassCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox disabled={disablePoeCapability || !poeEnable} />}
          />}
          <Form.Item
            name='poeClass'
            label={$t({ defaultMessage: 'PoE Class' })}
            initialValue='UNSET'
            children={isMultipleEdit && !poeClassCheckbox && hasMultipleValue.includes('poeClass')
              ? <MultipleText />
              : <Select
                options={poeClassOptions?.map(p => ({ label: $t(p.label), value: p.value }))}
                disabled={getFieldDisabled('poeClass')}
              />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='poePriorityCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox disabled={disablePoeCapability || !poeEnable} />}
          />}
          <Form.Item
            name='poePriority'
            label={$t({ defaultMessage: 'PoE Priority' })}
            initialValue={1}
            children={
              isMultipleEdit && !poePriorityCheckbox && hasMultipleValue.includes('poePriority')
                ? <MultipleText />
                : <Select
                  options={poePriorityOptions}
                  disabled={getFieldDisabled('poePriority')}
                />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='poeBudgetCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox disabled={disablePoeCapability || !poeEnable} />}
          />}
          <Form.Item
            name='poeBudget'
            label={$t({ defaultMessage: 'PoE Budget' })}
            rules={[
              { validator: (_, value) => poeBudgetRegExp(value) }
            ]}
            initialValue=''
            children={
              isMultipleEdit && !poeBudgetCheckbox && hasMultipleValue.includes('poeBudget')
                ? <MultipleText />
                : <Input
                  data-testid='poe-budget-input'
                  placeholder={$t({ defaultMessage: 'Enter value between 1000 to 30000 mWatts' })}
                  disabled={getFieldDisabled('poeBudget')}
                />}
          />
          {((isMultipleEdit && poeBudgetCheckbox) || !isMultipleEdit)
            && <Space style={{ display: 'flex', fontSize: '12px', margin: '12px 0 0 10px' }}>
              {$t({ defaultMessage: 'mWatts' })}</Space>
          }
        </UI.FormItemLayout>

        <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-20') }} />

        <UI.FormItemLayout>
          {isMultipleEdit && <Space
            style={{ height: '185px', alignItems: 'baseline', paddingRight: '10px' }} /// height: '100%'
          >
            <Form.Item
              noStyle
              label={false}
              name='portVlansCheckbox'
              valuePropName='checked'
              initialValue={false}
              children={<Checkbox />}
            />
          </Space>}
          <div>
            <Space style={{
              width: '510px', display: 'flex', justifyContent: 'space-between',
              marginBottom: isMultipleEdit ? '24px' : '18px'
            }}>
              <Subtitle level={3} style={{ margin: 0 }}>
                {$t({ defaultMessage: 'Port VLANs' })}
              </Subtitle>
              {(!isMultipleEdit || portVlansCheckbox) &&
                <Space size={24}>
                  <Space style={{ fontSize: '12px' }}>{
                    // isMultipleEdit
                    //   ? ()
                    //   : !useVenueSettings ?
                    //     ? $t({ defaultMessage: 'Default' })
                    //     : $t({ defaultMessage: 'Port level override' })
                    useVenueSettings ////// $t({ defaultMessage: 'Applied at venue' })
                      ? $t({ defaultMessage: 'Default' })
                      : $t({ defaultMessage: 'Port level override' })
                  }</Space>
                  <Space size={0} split={<UI.Divider />}>
                    <Button type='link'
                      key='edit'
                      size='small'
                      onClick={() => setSelectModalvisible(true)}
                    >{useVenueSettings
                        ? $t({ defaultMessage: 'Customize' })
                        : $t({ defaultMessage: 'Edit' })
                      }</Button>
                    {!useVenueSettings &&
                      <Tooltip title={getFieldTooltip('useVenuesettings')} >
                        <Button type='link'
                          key='use-venue-settings'
                          size='small'
                          disabled={getFieldDisabled('useVenuesettings')}
                          onClick={onApplyVenueSettings}
                        >
                          {$t({ defaultMessage: 'Use Venue settings' })}
                        </Button>
                      </Tooltip>
                    }
                  </Space>
                </Space>
              }
            </Space>
            <Form.Item
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              name='untaggedVlan'
              children={isMultipleEdit &&
                !portVlansCheckbox && hasMultipleValue.includes('untaggedVlan')
                ? <MultipleText />
                : <Space style={{ fontSize: '16px', margin: 0 }}>{untaggedVlan
                  ? $t({ defaultMessage: 'VLAN-ID: {vlan}' }, { vlan: untaggedVlan })
                  : '--'
                }</Space>
              }
            />
            <Form.Item
              label={$t({ defaultMessage: 'Tagged VLAN' })}
              name='taggedVlans'
              children={isMultipleEdit &&
                !portVlansCheckbox && hasMultipleValue.includes('taggedVlans')
                ? <MultipleText />
                : <Space style={{ fontSize: '16px' }}>{taggedVlans?.length
                  ? $t({ defaultMessage: 'VLAN-ID: {vlan}' },
                    { vlan: sortOptions(taggedVlans.split(',')).join(', ') })
                  : '--'
                }</Space>}
            />
            {!untaggedVlan && !taggedVlans &&
              <Space style={{ fontSize: '12px', color: cssStr('--acx-semantics-red-50') }}>{
                isMultipleEdit
                  ? $t(MultipleEditPortMessages.UNSELECT_VLANS)
                  : $t(EditPortMessages.UNSELECT_VLANS)
              }</Space>}
          </div>
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='voiceVlanCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox disabled={vlansOptions?.length === 1} />}
          />}
          <Form.Item
            label={$t({ defaultMessage: 'Voice VLAN' })}
            children={isMultipleEdit && !voiceVlanCheckbox && hasMultipleValue.includes('voiceVlan')
              ? <MultipleText />
              : <Tooltip title={getFieldTooltip('voiceVlan')}>
                <Form.Item
                  name='voiceVlan'
                  initialValue=''
                >
                  <Select
                    options={vlansOptions}
                    disabled={getFieldDisabled('voiceVlan')}
                  />
                </Form.Item>
              </Tooltip>
            }
          />
        </UI.FormItemLayout>

        <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-20') }} />

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='portProtectedCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'Protected Port' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            label={false}
            name='portProtected'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit &&
              !portProtectedCheckbox && hasMultipleValue.includes('portProtected')
              ? <MultipleText />
              : <Switch disabled={getFieldDisabled('portProtected')} />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='lldpEnableCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'LLDP Enabled' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            label={false}
            name='lldpEnable'
            valuePropName='checked'
            initialValue={true}
            children={isMultipleEdit &&
              !lldpEnableCheckbox && hasMultipleValue.includes('lldpEnable')
              ? <MultipleText />
              : <Switch disabled={getFieldDisabled('lldpEnable')} />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='portSpeedCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox disabled={!portSpeedOptions.length || disablePortSpeed} />}
          />}
          <Form.Item
            name='portSpeed'
            label={$t({ defaultMessage: 'Port Speed' })}
            initialValue='NONE'
            children={isMultipleEdit && !portSpeedCheckbox && hasMultipleValue.includes('portSpeed')
              ? <MultipleText />
              : <Select
                options={portSpeedOptions.map((p: string) => ({
                  label: PORT_SPEED[p as keyof typeof PORT_SPEED], value: p
                }))}
                disabled={getFieldDisabled('portSpeed')}
              />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='rstpAdminEdgePortCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'RSTP Admin Edge Port' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            name='rstpAdminEdgePort'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit &&
              !rstpAdminEdgePortCheckbox && hasMultipleValue.includes('rstpAdminEdgePort')
              ? <MultipleText />
              : <Switch disabled={getFieldDisabled('rstpAdminEdgePort')} />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='stpBpduGuardCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'STP BPDU Guard' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            label={false}
            name='stpBpduGuard'
            valuePropName='checked'
            initialValue={false}
            children={
              isMultipleEdit && !stpBpduGuardCheckbox && hasMultipleValue.includes('stpBpduGuard')
                ? <MultipleText />
                : <Switch disabled={getFieldDisabled('stpBpduGuard')} />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='stpRootGuardCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'STP Root Guard' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            label={false}
            name='stpRootGuard'
            valuePropName='checked'
            initialValue={false}
            children={
              isMultipleEdit && !stpRootGuardCheckbox && hasMultipleValue.includes('stpRootGuard')
                ? <MultipleText />
                : <Switch disabled={getFieldDisabled('stpRootGuard')} />
            }
          />
        </UI.FormItemLayout>

        <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-20') }} />

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='dhcpSnoopingTrustCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'DHCP Snooping Trust' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            label={false}
            name='dhcpSnoopingTrust'
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={getFieldDisabled('dhcpSnoopingTrust')} />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='ipsgCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'IPSG' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            children={isMultipleEdit && !ipsgCheckbox && hasMultipleValue.includes('ipsg')
              ? <MultipleText />
              : <Form.Item
                  noStyle
                  name='ipsg'
                  valuePropName='checked'
                  initialValue={false}
                >
                  <Switch
                    data-testid='ipsg-checkbox'
                    disabled={getFieldDisabled('ipsg')}
                  />
                </Form.Item>}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            name='lldpQosCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.SwitchLabel>{$t({ defaultMessage: 'LLDP QoS' })}</UI.SwitchLabel>
          <Form.Item
            noStyle
            name='lldpQos'
            initialValue={false}
            children={isMultipleEdit && !lldpQosCheckbox && hasMultipleValue.includes('lldpQos')
              ? <MultipleText />
              : <Button type='link'
                key='create-lldp'
                size='small'
                disabled={isMultipleEdit && !lldpQosCheckbox}
                onClick={() => {
                  setLldpModalvisible(true)
                }}
              >
                {$t({ defaultMessage: 'Create' })}
              </Button>
            }
          />
        </UI.FormItemLayout>
        <Space style={{ position: 'relative', top: '-20px' }}>
          <LldpQOSTable
            editable={!isMultipleEdit || lldpQosCheckbox}
            setLldpModalvisible={setLldpModalvisible}
            lldpModalvisible={lldpModalvisible}
            lldpQosList={lldpQosList}
            setLldpQosList={setLldpQosList}
            vlansOptions={vlansOptions}
          />
        </Space>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            name='ingressAclCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <Form.Item
            name='ingressAcl'
            label={$t({ defaultMessage: 'Ingress ACL' })}
            initialValue=''
            children={
              isMultipleEdit && !ingressAclCheckbox && hasMultipleValue.includes('ingressAcl')
                ? <MultipleText />
                : <Select
                  options={aclsOptions}
                  disabled={getFieldDisabled('ingressAcl')}
                />
            }
          />
          {((isMultipleEdit && ingressAclCheckbox) || !isMultipleEdit) &&
            <Tooltip title={getFieldTooltip('ingressAcl')}>
              <Space style={{ marginLeft: '8px' }}>
                <Button type='link'
                  key='add-ingress-acl'
                  size='small'
                  disabled={(isMultipleEdit && !ingressAclCheckbox) || !hasSwitchProfile || ipsg}
                  // onClick={() => { }} TODO
                >
                  {$t({ defaultMessage: 'Add ACL' })}
                </Button>
              </Space>
            </Tooltip>}
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='egressAclCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <Form.Item
            name='egressAcl'
            label={$t({ defaultMessage: 'Egress ACL' })}
            initialValue=''
            children={isMultipleEdit && !egressAclCheckbox && hasMultipleValue.includes('egressAcl')
              ? <MultipleText />
              : <Select
                options={aclsOptions}
                disabled={getFieldDisabled('egressAcl')}
              />}
          />
          {((isMultipleEdit && egressAclCheckbox) || !isMultipleEdit) &&
            <Tooltip title={getFieldTooltip('egressAcl')}>
              <Space style={{ marginLeft: '8px' }}>
                <Button type='link'
                  key='add-egress-acl'
                  size='small'
                  disabled={(isMultipleEdit && !egressAclCheckbox) || !hasSwitchProfile}
                  // onClick={() => { }} TODO
                >{$t({ defaultMessage: 'Add ACL' })}
                </Button>
              </Space>
            </Tooltip>}
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='tagsCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <Form.Item
            name='tags'
            label={$t({ defaultMessage: 'Tags' })}
            initialValue=''
            children={isMultipleEdit && !tagsCheckbox && hasMultipleValue.includes('tags')
              ? <MultipleText />
              : <Input disabled={getFieldDisabled('tags')} />
            }
          />
        </UI.FormItemLayout>

      </Form>
      {selectModalvisible && <SelectVlanModal
        form={form}
        selectModalvisible={selectModalvisible}
        setSelectModalvisible={setSelectModalvisible}
        setUseVenueSettings={setUseVenueSettings}
        onValuesChange={onValuesChange}
        defaultVlan={defaultVlan}
        switchVlans={getAllSwitchVlans(switchVlans)}
        venueVlans={venueVlans}
        vlanUsedByVe={vlanUsedByVe}
        taggedVlans={taggedVlans}
        untaggedVlan={untaggedVlan}
        vlanDisabledTooltip={$t(EditPortMessages.ADD_VLAN_DISABLE)}
      />}
      {
        lldpModalvisible && <EditLldpModal
          isEditMode={false}
          setLldpModalvisible={setLldpModalvisible}
          lldpModalvisible={lldpModalvisible}
          lldpQosList={lldpQosList}
          setLldpQosList={setLldpQosList}
          vlansOptions={vlansOptions}
        />
      }
    </Loader>}
    width={'590px'}
  />
}

function MultipleText () {
  const { $t } = getIntl()
  // TODO: check style
  return <Space style={{ fontSize: '12px', color: cssStr('--acx-accents-orange-50') }}>
    {$t({ defaultMessage: 'Multiple values' })}
  </Space>
}

function getPortSpeed (selectedPorts: SwitchPortViewModel[]) {
  const portsSpeedOptions = selectedPorts.map((item: SwitchPortViewModel) => {
    return getPortSpeedOptions(item.switchModel, item.portIdentifier)
  })

  return _.intersection(...portsSpeedOptions) as string[]
}

function getAclOptions (acls?: SwitchAclUnion) {
  const { $t } = getIntl()
  const options = Object.values(acls ?? {}).flat()?.map((acl: string) => ({
    label: acl, value: acl, disabled: false
  }))

  return [
    { label: $t({ defaultMessage: 'None' }), value: '', disabled: false },
    ...sortOptions(options)
  ] as DefaultOptionType[]
}

function getVlanOptions (vlans: SwitchVlanUnion, defaultVlan: string, extra?: number) {
  const { $t } = getIntl()
  const allVlans = getAllSwitchVlans(vlans)
  console.log(vlans, allVlans)
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

function getAllSwitchVlans (vlans: SwitchVlanUnion) {
  const allVlans = _.pickBy(vlans, (value, key) => key !== 'switchDefaultVlan')
  return Object.values(allVlans).flat()
}

function checkVlanOptions (vlanOptions:DefaultOptionType[], untaggedVlan:string, taggedVlans:string, init:any) {
  if (init?.voice) {
    if (init?.untagged == init?.voice.toString() && untaggedVlan !== init?.voice.toString()) {
      vlanOptions = vlanOptions.filter((item:any) => item.value !== Number(init?.voice))
      if (init?.isDefaultVlan) {
        vlanOptions = vlanOptions.filter((item:any) => item.value !== 'Default VLAN (Multiple values)')
      }
    }
    if (init?.tagged.indexOf(init?.voice) !== -1) {
      const tagArray = taggedVlans?.split(',') ?? []
      if (tagArray.indexOf(init?.voice) === -1) {
        vlanOptions = vlanOptions.filter((item:any) => item.value !== Number(init?.voice))
        if (init?.isDefaultVlan) {
          vlanOptions = vlanOptions.filter((item:any) => item.value !== 'Default VLAN (Multiple values)')
        }
      }
    }
  }
  return vlanOptions
}

function checkLldpListEqual (lldpList: LldpQosModel[][]) { // TODO
  let isEqual = true
  const sortByFields = ['applicationType', 'qosVlanType', 'vlanId', 'priority', 'dscp']
  const list = lldpList.map(l =>
    _.sortBy(l?.map(v => _.omit(v, ['id'])), sortByFields)
  )
  // const isArrayEqual = (x:any, y:any) => _(x).xorWith(y, _.isEqual).isEmpty()
  // const aa =  list.map(l => JSON.stringify(l))

  list.forEach((l, index) => {
    if (index !== (list.length -1) && !_.isEqual(list[index], list[index+1])) {
      isEqual = false
    }
  })

  return isEqual
}

function getPoeCapabilityDisabled (portSettings: PortSetting[]) {
  return portSettings?.filter(s => !s.poeCapability)?.length > 1
}

function getOverrideFields (fieldsValue: PortSetting) {
  return Object.entries(fieldsValue)
    .filter(v => v?.[1] && v?.[0].includes('Checkbox'))
    .map(v => v?.[0].split('Checkbox')?.[0])
}

function sortOptions (dataList: DefaultOptionType[], sortField = 'value') {
  return dataList?.[0]?.[sortField]
    ? _.sortBy(dataList, [sortField])
    : _.sortBy(dataList)
}

function isPortOverride (portSetting: PortSetting) {
  if (portSetting.revert === false) {
    if (portSetting.hasOwnProperty('taggedVlans') || portSetting.hasOwnProperty('untaggedVlan')) {
      return true
    }
  }
  return false
}

function getMultipleVlanValue ( // TODO: rewrite
  selectedPorts: SwitchPortViewModel[],
  vlans: Vlan[],
  portsSetting: PortsSetting,
  defaultVlan: string,
  switchesDefaultVlan?: SwitchDefaultVlan[]
) {
  const ports = selectedPorts?.map((p) => p.portIdentifier)
  const initPortVlans = [] as {
    tagged: string[]
    untagged: string[]
    voice: string | number
    isDefaultVlan: boolean
  }[]
  const result = {
    tagged: new Array(ports.length).fill(undefined),
    untagged: new Array(ports.length).fill(undefined),
    voice: portsSetting?.response.map(p => p.voiceVlan)
  }

  const portsProfileVlans = {
    tagged: new Array(ports.length).fill(undefined),
    untagged: new Array(ports.length).fill(undefined)
  }

  // Check Vlan
  vlans.filter(v => v.switchFamilyModels)
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
    const defaultVlan = switchesDefaultVlan?.filter(s => s.switchId === item.switchMac)?.[0]?.defaultVlanId
    initPortVlans.push({
      untagged: result.untagged[index],
      tagged: result.tagged[index] || [],
      voice: item.voiceVlan,
      isDefaultVlan: item.voiceVlan == defaultVlan
    })
  })

  const untagEqual = _.uniq(result.untagged)?.length <= 1
  const tagEqual = _.uniq(result.tagged)?.length <= 1
  const voiceVlanEqual = _.uniq(result.voice)?.length <= 1

  return {
    tagged: tagEqual ? result.tagged[0] : null,
    untagged: untagEqual ? result.untagged[0] : (defaultVlan ?? 'Default VLAN (Multiple values)'),
    voice: voiceVlanEqual ? result.voice[0] : '',
    initPortVlans: initPortVlans
  }
}

function handlePortSpeedFor765048F (selectedPorts: SwitchPortViewModel[]) {
  return selectedPorts
    .filter(p => p.switchModel === 'ICX7650-48F')
    .map(p => Number(p?.portIdentifier?.split('/')?.pop()) < 25)?.length > 0
}
