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
  // Tabs,
  // Table,
  // TableProps,
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
  poeBudgetRegExp,
  PORT_SPEED,
  SwitchPortViewModel,
  SwitchAclUnion,
  SwitchVlans,
  SwitchVlanUnion,
  PortSetting,
  PortsSetting
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { store }     from '@acx-ui/store'
import { getIntl }   from '@acx-ui/utils'


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
  }),
  IPSG_WITH_NOT_PURE_UNTAGGED_VLAN: defineMessage({
    defaultMessage: 'You can\'t assign IPSG on the port when it has untagged VLAN which relative to a VE'
  }),
  IPSG_WITH_TAGGED_VLANS: defineMessage({
    defaultMessage: 'You can\'t assign IPSG on the port when it has tagged VLANs'
  }),
  IPSG_WITH_MULTI_TAGGED_VLANS: defineMessage({
    defaultMessage: 'You can\'t assign IPSG on the port when one or more selected ports have tagged VLANs'
  })
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
  selectedPorts
  // this.switchId = this.isVenueLevel ? this.portStatus[0].switchSerial : this.params.switchId;
  // this.switchModel = this.params.switchModel;
  // this.selectPorts = this.params.selectPorts;
}: {
  visible: boolean,
  setDrawerVisible: (visible: boolean) => void,
  isCloudPort: boolean,
  isMultipleEdit: boolean,
  isVenueLevel: boolean,
  selectedPorts: SwitchPortViewModel[]
}) {
  const { $t } = getIntl()
  const [form] = Form.useForm()
  const { useWatch } = Form
  const [
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
  ] = [
    useWatch('portEnableCheckbox', form),
    useWatch('poeEnableCheckbox', form),
    useWatch('poeEnable', form),
    useWatch('poeClassCheckbox', form),
    useWatch('poeClass', form),
    useWatch('poePriorityCheckbox', form),
    useWatch('poeBudgetCheckbox', form),
    useWatch('poeBudget', form),
    useWatch('portVlansCheckbox', form),
    useWatch('untaggedVlan', form),
    useWatch('taggedVlans', form),
    useWatch('voiceVlanCheckbox', form),
    useWatch('voiceVlan', form),
    useWatch('portProtectedCheckbox', form),
    useWatch('lldpEnableCheckbox', form),
    useWatch('portSpeedCheckbox', form),
    useWatch('rstpAdminEdgePortCheckbox', form),
    useWatch('stpBpduGuardCheckbox', form),
    useWatch('stpRootGuardCheckbox', form),
    useWatch('dhcpSnoopingTrustCheckbox', form),
    useWatch('ipsgCheckbox', form),
    useWatch('ipsg', form),
    useWatch('lldpQosCheckbox', form),
    useWatch('ingressAclCheckbox', form),
    useWatch('egressAclCheckbox', form),
    useWatch('tagsCheckbox', form)
  ]

  const { tenantId, switchId, serialNumber } = useParams()
  const [loading, setLoading] = useState<boolean>(true)

  const switches: string[] = _.uniq(selectedPorts.map(p => p.switchMac))
  const disablePortSpeed = selectedPorts
    .filter(p => p.switchModel === 'ICX7650-48F')
    .map(p => Number(p?.portIdentifier?.split('/')?.pop()) < 25)?.length > 0

  const [vlansOptions, setVlansOptions] = useState([] as DefaultOptionType[])
  const [portSpeedOptions, setPortSpeedOptions] = useState([] as string[])
  const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
  const [vlanUsedByVe, setVlanUsedByVe] = useState('')

  const [editPortData, setEditPortData] = useState(null as unknown as PortSetting)
  const [ignoreFields, setIgnoreFields] = useState([] as string[])
  const [disablePoeCapability, setDisablePoeCapability] = useState(false)

  const [lldpQosList, setLldpQosList] = useState([] as any)
  const [isPoeEnable, setIsPoeEnable] = useState(false)
  const [revertStatus, setRevertStatus] = useState(false)
  const [portEditStatus, setPortEditStatus] = useState('')
  const [hasSwitchProfile, setHasSwitchProfile] = useState(false)
  const [profileDefaultVlan, setProfileDefaultVlan] = useState(null as unknown as Number)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [disabledUseVenueSetting, setDisabledUseVenueSetting] = useState(false)
  const [defaultVlan, setDefaultVlan] = useState('')
  const [switchVlans, setSwitchVlans] = useState({} as SwitchVlanUnion)

  const [venueVlans, setVenueVlans] = useState([] as SwitchVlans[])
  const [venueTaggedVlans, setVenueTaggedVlans] = useState([] as string[])
  const [venueUntaggedVlan, setVenueUntaggedVlan] = useState(null as unknown as string)

  // remove var
  // const [disableText, setDisableText] = useState('' as unknown as string)
  // const [isDirtyUntaggedVlan, setIsDirtyUntaggedVlan] = useState(true) ///?
  // const [blockTaggedVlanConfig, setBlockTaggedVlanConfig] = useState(false) // X
  const [selectModalvisible, setSelectModalvisible] = useState(false)
  const [hasMultipleValue, setHasMultipleValue] = useState([] as string[])

  const [disableSaveButton, setDisableSaveButton] = useState(false) //this.vlanInvaliad || !this.poeBudgetValid;

  const [withNotPureUntaggedVlan, setWithNotPureUntaggedVlan] = useState(false)
  const [withoutTaggedVlan, setWithoutTaggedVlan] = useState(false)

  const [isDefaultUntaggedVlan, setIsDefaultUntaggedVlan] = useState(false)
  const [portsProfileVlans, setPortsProfileVlans] = useState({
    tagged: [],
    untagged: []
  })
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

  const { data: switchDetail } = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })
  const { data: aclUnion } = useGetAclUnionQuery({ params: { tenantId, serialNumber } })
  const { data: switchesDefaultVlan, isLoading: isSwitchesDefaultVlanLoading } = useGetDefaultVlanQuery({
    params: { tenantId },
    payload: switches
  })

  // console.log('switchDetail: ', switchDetail)
  // console.log('switchesDefaultVlan: ', switchesDefaultVlan)
  // console.log('selectedPorts: ', vlanUsedByVe, selectedPorts, poeClass)
  // console.log('taggedVlans: ', taggedVlans, ' untaggedVlans:', untaggedVlan)
  console.log('*** selectedPorts: ', selectedPorts)
  console.log('hasMultipleValue: ', hasMultipleValue)
  // console.log('veRoutedData: ', veRoutedData)

  const getVlans = async () => {
    if (switches.length > 1) {/////
      return await getSwitchesVlan({
        params: { tenantId, serialNumber },
        payload: switches
      }, true).unwrap()
    } else {
      return await getSwitchVlan({
        params: { tenantId, serialNumber }
      }, true).unwrap()
    }
  }

  const getEachSwitchVlans = async () => {
    // const ss = ['58:fb:96:0e:82:8a', 'c0:c5:20:aa:32:79']
    const switchVlans = switches?.map(async (switchId) => {
      const res = await getSwitchVlans({
        params: { tenantId, serialNumber: switchId }
      }, true).unwrap()
      // return {
      //   [switchId]: res
      // }
      return res
    })
    return Promise.all(switchVlans)
  }

  useEffect(() => {
    const setData = async () => {
      const vlans = await getVlans()
      const vlansByVenue = await getVlansByVenue({
        params: { tenantId, venueId: switchDetail?.venueId }
      }, true).unwrap()
      const switchProfile = await getSwitchConfigurationProfileByVenue({
        params: { tenantId, venueId: switchDetail?.venueId }
      }, true).unwrap()

      const veRouteQueryParams = {
        params: { tenantId, switchId, venueId: switchDetail?.venueId },
        payload: {
          fields: ['id', 'portNumber', 'portType'],
          sortField: 'name',
          pageSize: 10000
        }
      }

      const { data: veRoutedData } = isVenueLevel
        ? await getVenueRoutedList(veRouteQueryParams, true).unwrap()
        : await getSwitchRoutedList(veRouteQueryParams, true).unwrap()

      const portSpeed = getPortSpeed(selectedPorts)
      const defaultVlans = _.uniq(Object.values(switchesDefaultVlan ?? {})?.map(v => v?.defaultVlanId.toString()))
      const defaultVlan = defaultVlans?.length > 1 ? '' : defaultVlans?.[0]
      const allSwitchVlans = (await getEachSwitchVlans())?.flat()
      const profileDefaultVlan = switchProfile?.[0]?.vlans?.find((item) => item.vlanName === 'DEFAULT-VLAN')?.vlanId ?? 1
      const disabledUseVenueSetting = allSwitchVlans?.filter((v) =>
        v.vlanName !== 'DEFAULT-VLAN' && v.vlanId === profileDefaultVlan)?.length > 0

      setPortSpeedOptions(portSpeed)
      setVlanUsedByVe(veRoutedData?.portNumber?.split('-')?.[2] || '')
      setDefaultVlan(defaultVlan)
      setSwitchVlans(vlans)
      setVenueVlans(vlansByVenue)
      setVlansOptions(getVlanOptions(vlans, defaultVlan, voiceVlan))
      setHasSwitchProfile(!!switchProfile?.length) // move utils
      setProfileDefaultVlan(profileDefaultVlan)
      setDisabledUseVenueSetting(disabledUseVenueSetting)

      // v.vlanName !== 'DEFAULT-VLAN' && v.vlanId == profileDefaultVlan

      if (isMultipleEdit) {
        const portsSettingPayload = switches.map((s) => ({
          switchId: s,
          ports: selectedPorts
            .filter(p => p.switchSerial === s)
            .map(p => p.portIdentifier)
        }))
        const portsSetting = await getPortsSetting({
          params: { tenantId }, payload: portsSettingPayload
        }, true).unwrap()

        // speed
        // withoutPoePortList
        // disablePoeCapability
        // allMultipleEditableFields
        // LldpEquals

        // const vlansValue = {
        //   tagged: [],
        //   untagged: []
        // }
        const vlansValue = getMultipleVlanValue(selectedPorts, vlansByVenue, portsSetting, defaultVlan)

        const hasMultipleValueFields = allMultipleEditableFields?.filter(field => {
          const isEqualValues = _.uniq(portsSetting?.response?.map(s => s[field as keyof PortSetting]))?.length === 1
          isEqualValues && form.setFieldValue(field, portsSetting?.response?.[0]?.[field as keyof PortSetting])
          return !isEqualValues && field
        })

        form.setFieldValue('taggedVlans', vlansValue.tagged)
        form.setFieldValue('untaggedVlan', vlansValue.untagged || defaultVlan)

        // console.log('vlansValue: ', vlansValue)
        // console.log('portsSetting: ', portsSetting)
        // console.log('switchProfile: ', switchProfile)
        // console.log('allMultipleEditableFields: ', allMultipleEditableFields, hasMultipleValueFields)
        setDisablePoeCapability(portsSetting?.response?.map(s => !s.poeCapability)?.length > 1)
        setHasMultipleValue(hasMultipleValueFields) // hasMultipleValueFields taggedVlan ??

      } else {
        const portSetting = (await getPortSetting({
          params: { tenantId, serialNumber, portIdentifier: selectedPorts?.[0]?.portIdentifier }
        }, true).unwrap())
        const requestPort = `1/${selectedPorts?.[0]?.portIdentifier?.split('/').slice(1, 3).join('/')}` ////
        const taggedVlansByVenue = (await getTaggedVlansByVenue({
          params: {
            tenantId, venueId: switchDetail?.venueId,
            model: selectedPorts?.[0]?.switchModel, port: requestPort
          }
        }, true).unwrap())
        const untaggedVlansByVenue = (await getUntaggedVlansByVenue({
          params: {
            tenantId, venueId: switchDetail?.venueId,
            model: selectedPorts?.[0]?.switchModel, port: requestPort
          }
        }, true).unwrap())

        const lldpQos = JSON.parse(JSON.stringify(portSetting.lldpQos || []))
        setEditPortData(portSetting)
        setIgnoreFields(portSetting?.poeCapability ? [] : ['poeEnable', 'poeClass', 'poePriority'])
        setDisablePoeCapability(!portSetting?.poeCapability)
        // setDisablePoeCapability(portsSetting?.response?.map(s => !s.poeCapability)?.length > 1)
        setLldpQosList(lldpQos)
        setIsPoeEnable(portSetting.poeEnable)
        setRevertStatus(portSetting.revert)
        setPortEditStatus(portSetting.revert ? 'venue' : 'port')
        setUseVenueSettings(portSetting.revert && !(portSetting?.taggedVlans && portSetting.untaggedVlan))
        setVenueTaggedVlans(taggedVlansByVenue)
        setVenueUntaggedVlan(untaggedVlansByVenue)

        form.setFieldsValue({
          ...portSetting,
          poeEnable: portSetting.poeCapability ? portSetting.poeEnable : false,
          poeBudget: portSetting.poeBudget === 0 ? '' : portSetting.poeBudget,
          portSpeed: portSpeed.find(item => item === portSetting.portSpeed)
            ? portSetting.portSpeed : portSpeed?.[0],
          taggedVlans: (portSetting.taggedVlans ?? '').toString(),
          lldpQos: lldpQos
        })

        // console.log('taggedVlansByVenue: ', taggedVlansByVenue)
        // console.log('untaggedVlansByVenue: ', untaggedVlansByVenue)
        // console.log('portSetting: ', portSetting, portSetting.poeCapability, portSetting.poeEnable)
        // console.log('defaultVlan: ', defaultVlan)
        // console.log('UseVenueSettings: ', !portSetting.revert && !!(portSetting?.taggedVlans || portSetting.untaggedVlan))
      }

      setLoading(false)
    }

    switchesDefaultVlan && switchDetail && setData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPorts, switchDetail, switchesDefaultVlan, visible]) // []

  const transformData = (data: PortSetting) => {
    const getInitIgnoreFields = () => {
      const overrideFields = Object.entries(form.getFieldsValue())
        .filter(v => v?.[1] && v?.[0].includes('Checkbox')).map(v => v?.[0].split('Checkbox')?.[0])

      if (overrideFields?.includes('portVlans')) {
        overrideFields.push('taggedVlans', 'untaggedVlan')
      }

      return !isMultipleEdit
        ? []
        : allMultipleEditableFields.filter(f => !overrideFields.includes(f))
    }

    const originalUntaggedVlan = editPortData?.untaggedVlan
    const isDirtyUntaggedVlan = !_.isEqual(originalUntaggedVlan, untaggedVlan.toString)
    const ignoreFields = [
      ...getInitIgnoreFields(),
      isMultipleEdit && !portVlansCheckbox && 'revert',
      !data?.revert && !isMultipleEdit && ((useVenueSettings && !untaggedVlan) || !isDirtyUntaggedVlan) && 'untaggedVlan',
      !data?.revert && !isMultipleEdit && ((useVenueSettings && !taggedVlans) || !isDirtyUntaggedVlan) && 'taggedVlans',
      data?.egressAcl && !aclsOptions.find(item => item.value === data.egressAcl && !item.disabled) && 'egressAcl',
      data?.ingressAcl && !aclsOptions.find(item => item.value === data.ingressAcl && !item.disabled) && 'ingressAcl'
    ]

    ignoreFields
      .filter(field => field)
      .forEach(field => {
        delete data[field as keyof PortSetting]
      })

    return {
      ...data
      //
    }
  }

  const applyForm = async () => {
    // console.log('save', form.getFieldsValue())
    const aclsOptions = getAclOptions(aclUnion) ////
    const revert = useVenueSettings //portEditStatus === 'venue' || revertStatus
    const values = {
      ...form.getFieldsValue(),
      revert: useVenueSettings, //portEditStatus === 'venue' || revertStatus,
      taggedVlans: (revert || !form.getFieldValue('taggedVlans')) ? null : form.getFieldValue('taggedVlans')?.split(','),
      untaggedVlan: revert ? '' : form.getFieldValue('untaggedVlan'),
      voiceVlan: form.getFieldValue('voiceVlan') ?? null /////
    }

    const transformedValues = transformData(values)

    try {
      const payload = switches.map(item => {
        return {
          switchId: item,
          port: {
            ...transformedValues,
            ...(transformedValues?.untaggedVlan === 'Default VLAN (Multiple values)' && { ////
              untaggedVlan: switchesDefaultVlan
                ?.filter(v => v.switchId === item)
                .map(v => v.defaultVlanId)?.[0]
            }),
            ...(transformedValues?.voiceVlan === 'Default VLAN (Multiple values)' && {
              untaggedVlan: switchesDefaultVlan
                ?.filter(v => v.switchId === item)
                .map(v => v.defaultVlanId)?.[0]
            }),
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
    // form.submit()
  }

  const onClose = () => {
    // resetFields
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

  const resetFields = () => {

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
      untaggedVlan: venueUntaggedVlan.toString() || profileDefaultVlan
    })
    // if (untaggedVlan === defaultVlan && !this.taggedVlansByVenue) {
    //   // Venue no setting, revert to default
    //   this.setLabelStatus('default', true);
    // }
  }

  const onValuesChange = async (changedValues: PortSetting) => {
    const setButtonStatus = () => {
      const isPoeBudgetInvalid = form?.getFieldError('poeBudget').length > 0
      const isVlansInvalid = !untaggedVlan && !taggedVlans
      setDisableSaveButton(isPoeBudgetInvalid || isVlansInvalid)
    }
    if (Object.keys(changedValues).includes('poeBudget')) {
      try {
        await form.validateFields(['poeBudget'])
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }

    setWithNotPureUntaggedVlan(
      vlanUsedByVe?.includes(untaggedVlan)
      || vlanUsedByVe?.includes(venueUntaggedVlan)
      || (vlanUsedByVe && useVenueSettings && isDefaultUntaggedVlan && (!isMultipleEdit || portVlansCheckbox)) ///
      || (useVenueSettings && portVlansCheckbox & untaggedVlan && isDefaultUntaggedVlan && !ipsg)
    )

    setButtonStatus()
  }

  const getIPSGTooltip = () => {
    if (withNotPureUntaggedVlan) {
      return $t(EditPortMessages.IPSG_WITH_NOT_PURE_UNTAGGED_VLAN)
    }
    if (withoutTaggedVlan) {
      return $t(EditPortMessages.IPSG_WITH_TAGGED_VLANS)
    }
    if (hasMultipleValue.includes('taggedVlans')) {
      return $t(EditPortMessages.IPSG_WITH_MULTI_TAGGED_VLANS)
    }
    return ''
  }

  console.log('getFieldsValue: ', form.getFieldsValue())

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }}>
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
      isLoading: loading, ///
      isFetching: isPortsSettingUpdating
    }]}>
      <Form
        form={form}
        layout='vertical'
        onValuesChange={onValuesChange}
      >
        <Form.Item
          // noStyle
          name='portIdentifier'
          label={$t({ defaultMessage: 'Selected Port' })}
          valuePropName='checked'
          initialValue={false}
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
          <UI.switchLabel>{$t({ defaultMessage: 'Port Enabled' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            children={
              isMultipleEdit && !portEnableCheckbox && hasMultipleValue.includes('portEnable')
                ? <MultipleText />
                : <Tooltip title={isCloudPort ? $t({ defaultMessage: 'Uplink port cannot be disabled' }) : ''}>
                  <Form.Item
                    name='portEnable'
                    noStyle
                    valuePropName='checked'
                    initialValue={false}
                  >
                    <Switch disabled={isCloudPort || isMultipleEdit && !portEnableCheckbox} />
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
          <UI.switchLabel>{$t({ defaultMessage: 'PoE Enabled' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='poeEnable'
            valuePropName='checked'
            initialValue={true}
            children={<Tooltip title={
              disablePoeCapability
                ? (isMultipleEdit
                  ? $t(MultipleEditPortMessages.POE_CAPABILITY_DISABLE)
                  : $t(EditPortMessages.POE_CAPABILITY_DISABLE)
                )
                : ''
            }>{
                isMultipleEdit && !poeEnableCheckbox && hasMultipleValue.includes('poeEnable')
                  ? <MultipleText />
                  : <Switch disabled={(isMultipleEdit && !poeEnableCheckbox) || disablePoeCapability} />
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
                disabled={(isMultipleEdit && !poeClassCheckbox)
                  || disablePoeCapability
                  || !poeEnable
                  || !form?.getFieldError('poeBudget')
                  //// poeBudget not invalid && has value
                }
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
                  disabled={(isMultipleEdit && !poePriorityCheckbox) || disablePoeCapability || !poeEnable}
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
                  placeholder={$t({ defaultMessage: 'Enter value between 1000 to 30000 mWatts' })}
                  disabled={(isMultipleEdit && !poeBudgetCheckbox)
                    || disablePoeCapability
                    || !poeEnable
                    || (poeClass !== 'ZERO' && poeClass !== 'UNSET')}
                />}
          />
          {((isMultipleEdit && poeBudgetCheckbox) || !isMultipleEdit)
            && <Space style={{ display: 'flex', fontSize: '12px', margin: '12px 0 0 10px' }}>
              {$t({ defaultMessage: 'mWatts' })}</Space>
          }
        </UI.FormItemLayout>

        <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-20') }} />

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item ////
            noStyle
            label={false}
            name='portVlansCheckbox'
            valuePropName='checked'
            initialValue={false}
            // style={{ alignItems: 'baseline' }}
            children={<Checkbox />}
          />}
          <div>
            <Space style={{
              width: '200%', display: 'flex', justifyContent: 'space-between',
              marginBottom: isMultipleEdit ? '24px' : '18px'
            }}>
              <Subtitle level={3} style={{ margin: 0 }}>
                {$t({ defaultMessage: 'Port VLANs' })}
              </Subtitle>
              {(!isMultipleEdit || portVlansCheckbox) &&
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
                    <Tooltip ////
                      title={disabledUseVenueSetting ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLE) : ''}
                    >
                      <Button type='link'
                        key='use-venue-settings'
                        size='small'
                        disabled={disabledUseVenueSetting || switchDetail?.vlanCustomize}
                        onClick={onApplyVenueSettings}
                      >
                        {$t({ defaultMessage: 'Use Venue settings' })}
                      </Button>
                    </Tooltip>
                  }
                </Space>
              }
            </Space>
            <Form.Item
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              // initialValue={false}
              name='untaggedVlan'
              children={isMultipleEdit && !portVlansCheckbox && hasMultipleValue.includes('untaggedVlan')
                ? <MultipleText />
                : <Space style={{ fontSize: '16px', margin: 0 }}>{untaggedVlan
                  ? $t({ defaultMessage: 'VLAN-ID: {vlan}' }, { vlan: untaggedVlan })
                  : '--'
                }</Space>}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Tagged VLAN' })}
              name='taggedVlans'
              children={isMultipleEdit && !portVlansCheckbox && hasMultipleValue.includes('taggedVlans')
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
              : <Tooltip
                title={vlansOptions?.length <= 1
                  ? $t(EditPortMessages.VOICE_VLAN_DISABLE) : ''}
              >
                <Form.Item
                  name='voiceVlan'
                  initialValue={0} //''
                >
                  <Select
                    options={getVlanOptions(switchVlans, defaultVlan, voiceVlan)}
                    disabled={(isMultipleEdit && !voiceVlanCheckbox) || vlansOptions?.length <= 1}
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
          <UI.switchLabel>{$t({ defaultMessage: 'Protected Port' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='portProtected'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit && !portProtectedCheckbox && hasMultipleValue.includes('portProtected')
              ? <MultipleText />
              : <Switch disabled={isMultipleEdit && !portProtectedCheckbox} />}
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
          <UI.switchLabel>{$t({ defaultMessage: 'LLDP Enabled' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='lldpEnable'
            valuePropName='checked'
            initialValue={true}
            children={isMultipleEdit && !lldpEnableCheckbox && hasMultipleValue.includes('lldpEnable')
              ? <MultipleText />
              : <Switch disabled={isMultipleEdit && !lldpEnableCheckbox} />}
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
                disabled={(isMultipleEdit && !portSpeedCheckbox) || disablePortSpeed}
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
          <UI.switchLabel>{$t({ defaultMessage: 'RSTP Admin Edge Port' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='rstpAdminEdgePort'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit && !rstpAdminEdgePortCheckbox && hasMultipleValue.includes('rstpAdminEdgePort')
              ? <MultipleText />
              : <Switch disabled={isMultipleEdit && !rstpAdminEdgePortCheckbox} />}
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
          <UI.switchLabel>{$t({ defaultMessage: 'STP BPDU Guard' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='stpBpduGuard'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit && !stpBpduGuardCheckbox && hasMultipleValue.includes('stpBpduGuard')
              ? <MultipleText />
              : <Switch disabled={isMultipleEdit && !stpBpduGuardCheckbox} />}
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
          <UI.switchLabel>{$t({ defaultMessage: 'STP Root Guard' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='stpRootGuard'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit && !stpRootGuardCheckbox && hasMultipleValue.includes('stpRootGuard')
              ? <MultipleText />
              : <Switch disabled={isMultipleEdit && !stpRootGuardCheckbox} />}
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
          <UI.switchLabel>{$t({ defaultMessage: 'DHCP Snooping Trust' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='dhcpSnoopingTrust'
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={isMultipleEdit && !dhcpSnoopingTrustCheckbox} />}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item /// blockAclAndIpsgConfig || hasMultipleValue.taggedVlans
            noStyle
            label={false}
            name='ipsgCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.switchLabel>{$t({ defaultMessage: 'IPSG' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='ipsg'
            valuePropName='checked'
            initialValue={false}
            children={isMultipleEdit && !ipsgCheckbox && hasMultipleValue.includes('ipsg')
              ? <MultipleText />
              : <Tooltip title={getIPSGTooltip()}>
                <Switch disabled={isMultipleEdit && !ipsgCheckbox}
                  onClick={(checked) => {
                    checked && form.setFieldValue('ingressAcl', '')
                  }}
                />
              </Tooltip>}
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='lldpQosCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <UI.switchLabel>{$t({ defaultMessage: 'LLDP QoS' })}</UI.switchLabel>
          <Form.Item
            noStyle
            label={false}
            name='lldpQos'
            initialValue={false}
            children={isMultipleEdit && !lldpQosCheckbox && hasMultipleValue.includes('lldpQos')
              ? <MultipleText />
              : <Button type='link'
                key='create-lldp'
                size='small'
                disabled={isMultipleEdit && !lldpQosCheckbox}
                onClick={() => { }}
              >
                {$t({ defaultMessage: 'Create' })}
              </Button>
            } //// lldp-qos-grid
          />
        </UI.FormItemLayout>

        <UI.FormItemLayout>
          {isMultipleEdit && <Form.Item
            noStyle
            label={false}
            name='ingressAclCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />}
          <Form.Item
            name='ingressAcl'
            label={$t({ defaultMessage: 'Ingress ACL' })}
            initialValue=''
            children={isMultipleEdit && !ingressAclCheckbox && hasMultipleValue.includes('ingressAcl')
              ? <MultipleText />
              : <Select
                options={getAclOptions(aclUnion)}
                disabled={(isMultipleEdit && !ingressAclCheckbox) || ipsg}
              />}
          />
          {((isMultipleEdit && ingressAclCheckbox) || !isMultipleEdit) &&
            <Tooltip title={!hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''}>
              <Space style={{ marginLeft: '8px' }}>
                <Button type='link'
                  key='add-ingress-acl'
                  size='small'
                  disabled={(isMultipleEdit && !ingressAclCheckbox) || !hasSwitchProfile || ipsg}
                  onClick={() => {
                  }}
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
                options={getAclOptions(aclUnion)}
                disabled={isMultipleEdit && !egressAclCheckbox}
              />}
          />
          {((isMultipleEdit && egressAclCheckbox) || !isMultipleEdit) &&
            <Tooltip title={!hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''}>
              <Space style={{ marginLeft: '8px' }}>
                <Button type='link'
                  key='add-egress-acl'
                  size='small'
                  disabled={(isMultipleEdit && !egressAclCheckbox) || !hasSwitchProfile}
                  // style={{ marginLeft: '10px', marginBottom: isMultipleEdit ? '-12px' : '0' }}
                  onClick={() => { }}
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
              : <Input disabled={isMultipleEdit && !tagsCheckbox} />}
          />
        </UI.FormItemLayout>

      </Form>
      {selectModalvisible && <SelectVlanModal
        form={form}
        selectModalvisible={selectModalvisible}
        setSelectModalvisible={setSelectModalvisible}
        setUseVenueSettings={setUseVenueSettings}
        defaultVlan={defaultVlan}
        switchVlans={///////////
          // ...switchVlans?.profileVlan,
          (switchVlans?.switchVlan
            ?? []).concat(switchVlans?.profileVlan ?? [])}
        venueVlans={venueVlans}
        vlanUsedByVe={vlanUsedByVe}
        taggedVlans={taggedVlans}
        untaggedVlan={untaggedVlan}
        vlanDisabledTooltip={$t(EditPortMessages.ADD_VLAN_DISABLE)}
      />}
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

function getAclOptions (acl?: SwitchAclUnion) {
  const { $t } = getIntl()
  const acls = [
    ...(acl?.profileAcl ?? []),
    ...(acl?.switchAcl ?? [])
  ]
  const options = acls?.map((acl: string) => ({
    label: acl, value: acl, disabled: false
  }))

  return [
    { label: $t({ defaultMessage: 'None' }), value: '', disabled: false },
    ...sortOptions(options)
  ] as DefaultOptionType[]
}

function getVlanOptions (vlans: SwitchVlanUnion, defaultVlan: string, extra?: number) {
  const { $t } = getIntl()
  const options = vlans?.switchVlan?.map((v) => ({
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
  const isVoiceVlanExist = !!options.filter((item: DefaultOptionType) => item.value === extra).length
  const extraVlanOption = extra && (extra !== Number(defaultVlan)) && !isVoiceVlanExist
    ? [{ value: extra, label: `VLAN-${extra}`, disabled: true }] : []

  return [
    { label: $t({ defaultMessage: 'Select VLAN...' }), value: 0 },
    defaultOption,
    ...sortOptions(options),
    ...extraVlanOption
  ]
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
  vlans: SwitchVlans[],
  portsSetting: PortsSetting,
  defaultVlan: string) {
  const ports = selectedPorts?.map((p) => p.portIdentifier) //this.port.split(',');
  const result = {
    tagged: new Array(ports.length).fill(undefined),
    untagged: new Array(ports.length).fill(undefined),
    voice: []
  }

  const portsProfileVlans = {
    tagged: new Array(ports.length).fill(undefined),
    untagged: new Array(ports.length).fill(undefined)
  }

  // Check Vlan
  vlans.forEach((item: any) => {
    if (item.switchFamilyModels) {
      selectedPorts.forEach((p: any, index: number) => {
        const requestPort = '1' + p.portIdentifier.slice(1) //
        const model = item.switchFamilyModels.find((i: any) => i.model === p.switchModel)
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
    }
  })
  // Check port
  portsSetting.response.forEach((item: any) => {
    selectedPorts.forEach((p: any, index: number) => {
      if (item.port === p.portIdentifier && item.switchSerialNumber === p.switchSerial) {
        if (isPortOverride(item)) {
          result.tagged[index] = item.taggedVlans
          result.untagged[index] = item.untaggedVlan
        } else {
          // default
          if (!result.tagged[index]) {
            result.tagged[index] = ''
          }
          if (!result.untagged[index]) {
            // result.untagged[index] = this.defaultVlanMap[item.switchSerialNumber];
          }
        }
      }
    })
  })

  portsSetting.response.forEach((item: any, index: number) => {
    // this.initPortVlans.push({
    //   initUntag: result.untagged[index],
    //   initTag: result.tagged[index] || [],
    //   initVoice: item.voiceVlan,
    //   isDefaultVlan: item.voiceVlan == this.defaultVlanMap[item.switchSerialNumber]
    // })
    // result.voice.push(item.voiceVlan); ///
  })

  const untagEqual = _.uniq(result.untagged)?.length <= 1 //this.allEqual(result.untagged);
  const tagEqual = _.uniq(result.tagged)?.length <= 1 // this.allEqualString(result.tagged);
  const voiceVlanEqual = _.uniq(result.voice)?.length <= 1 //this.allEqual(result.voice);
  // multiple select status is always 'port' (Edit | Use Venue Settings)
  // TODO:
  // this.portEditStatus = 'port';

  // this.hasMultipleValue.taggedVlans = !tagEqual;
  // this.hasMultipleValue.untaggedVlan = !untagEqual;
  // const defaultVlan = Object.keys(this.defaultVlanMap).length > 1 ? 'Default VLAN (Multiple values)' : this.defaultVlan;
  return {
    tagged: tagEqual ? result.tagged[0] : null,
    untagged: untagEqual ? result.untagged[0] : (defaultVlan ?? 'Default VLAN (Multiple values)'),
    voice: voiceVlanEqual ? result.voice[0] : ''
  }
}

// initPortVlans
// checkPortsVlan
// setLabelStatus
// openLldpQosDialog
// changeLldpQos
function setLabelStatus () {

}

function checkPortsVlan () {

}