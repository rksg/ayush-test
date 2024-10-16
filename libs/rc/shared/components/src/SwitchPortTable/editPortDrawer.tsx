import { useEffect, useState } from 'react'

import { Checkbox, Divider, Form, Input, Select, Space, Switch } from 'antd'
import { DefaultOptionType }                                     from 'antd/lib/select'
import _                                                         from 'lodash'

import {
  Alert,
  Button,
  Drawer,
  showActionModal,
  Subtitle,
  Tooltip,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { PoeUsage }               from '@acx-ui/icons'
import {
  switchApi,
  useLazyGetAclUnionQuery,
  useGetDefaultVlanQuery,
  useLazyGetPortSettingQuery,
  useLazyGetPortsSettingQuery,
  useLazyGetSwitchVlanQuery,
  useLazyGetSwitchesVlanQuery,
  useLazyGetSwitchConfigurationProfileByVenueQuery,
  useLazyGetSwitchRoutedListQuery,
  useLazyGetVlansByVenueQuery,
  useLazyGetVenueRoutedListQuery,
  useGetSwitchQuery,
  useSwitchDetailHeaderQuery,
  useSavePortsSettingMutation,
  useCyclePoeMutation
} from '@acx-ui/rc/services'
import {
  EditPortMessages,
  FlexAuthMessages,
  LldpQosModel,
  MultipleEditPortMessages,
  poeBudgetRegExp,
  PORT_SPEED,
  SwitchDefaultVlan,
  SwitchPortViewModel,
  SwitchVlanUnion,
  SWITCH_DEFAULT_VLAN_NAME,
  ProfileTypeEnum,
  PortSettingModel,
  isFirmwareVersionAbove10010f,
  isVerGEVer,
  validateVlanExceptReservedVlanId,
  Vlan,
  VlanModalType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { store }                                 from '@acx-ui/store'
import { SwitchScopes }                          from '@acx-ui/types'
import { hasPermission }                         from '@acx-ui/user'
import { getIntl }                               from '@acx-ui/utils'

import {
  AuthenticationType,
  authenticationTypeLabel,
  AuthFailAction,
  authFailActionTypeLabel,
  AuthTimeoutAction,
  authTimeoutActionTypeLabel,
  getAuthfieldDisabled,
  PortControl,
  portControlTypeLabel
} from '../FlexibleAuthentication'
import { handleAuthFieldChange } from '../FlexibleAuthentication'

import { ACLSettingDrawer }       from './ACLSettingDrawer'
import { EditLldpModal }          from './editLldpModal'
import {
  checkVlanOptions,
  checkLldpListEqual,
  checkAclIgnore,
  checkPortEditStatus,
  checkVlanIgnore,
  handlePortSpeedFor765048F,
  getAclOptions,
  getAllSwitchVlans,
  getFormItemLayout,
  getInitPortVlans,
  getMultipleVlanValue,
  getOverrideFields,
  getPoeCapabilityDisabled,
  getPortEditStatus,
  getPortSpeed,
  getToggleClassName,
  getVlanOptions,
  sortOptions,
  PortVlan,
  MultipleText,
  getPoeClass,
  updateSwitchVlans,
  getPortVenueVlans,
  getMultiPoeCapabilityDisabled
} from './editPortDrawer.utils'
import { LldpQOSTable }    from './lldpQOSTable'
import { SelectVlanModal } from './selectVlanModal'
import * as UI             from './styledComponents'

const poePriorityOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
]

const allMultipleEditableFields = [
  'dhcpSnoopingTrust', 'egressAcl', 'ingressAcl', 'ipsg', 'lldpEnable',
  'name', 'poeClass', 'poeEnable', 'poePriority', 'portEnable', 'portSpeed',
  'rstpAdminEdgePort', 'stpBpduGuard', 'stpRootGuard', 'taggedVlans', 'voiceVlan',
  'lldpQos', 'tags', 'untaggedVlan', 'poeBudget', 'portProtected',
  // Flex auth
  'flexibleAuthenticationEnabled', 'authenticationType', 'changeAuthOrder', 'dot1xPortControl',
  'authDefaultVlan', 'restrictedVlan', 'criticalVlan', 'authFailAction', 'authTimeoutAction'
]

interface ProfileVlans {
  tagged: string[],
  untagged: string,
  voice: string
}

export function EditPortDrawer ({
  visible,
  setDrawerVisible,
  isCloudPort,
  isMultipleEdit,
  isVenueLevel,
  selectedPorts,
  onBackClick
}: {
  visible: boolean,
  setDrawerVisible: (visible: boolean) => void,
  isCloudPort: boolean,
  isMultipleEdit: boolean,
  isVenueLevel: boolean,
  selectedPorts: SwitchPortViewModel[],
  onBackClick?: () => void
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
    voiceVlan,
    portSpeedCheckbox,
    ipsg,
    lldpQosCheckbox,
    ingressAclCheckbox,
    egressAclCheckbox,
    profileName,
    // Flex auth
    switchLevelAuthDefaultVlanObj,
    untaggedVlansObj,
    flexibleAuthenticationEnabled,
    flexibleAuthenticationEnabledCheckbox,
    authenticationType,
    dot1xPortControl,
    authDefaultVlan,
    authFailAction,
    authTimeoutAction
  } = (useWatch([], form) ?? {})

  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/switch')
  // const linkToMigration = useTenantLink('/devices/switch/c0:c5:20:aa:32:79/FEK3224R0AG/stack/edit')

  const { tenantId, venueId, serialNumber } = useParams()
  const [ loading, setLoading ] = useState<boolean>(true)
  const cyclePoeFFEnabled = useIsSplitOn(Features.SWITCH_CYCLE_POE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)
  const isSwitch785048CPortSpeedEnabled =
    useIsSplitOn(Features.SWITCH_ICX7850_48C_SUPPORT_PORT_SPEED_TOGGLE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)

  const hasCreatePermission = hasPermission({ scopes: [SwitchScopes.CREATE] })

  const defaultVlanText = $t({ defaultMessage: 'Default VLAN (Multiple values)' })
  const switches: string[] = _.uniq(selectedPorts.map(p => p.switchMac))
  const switchId = switches?.[0]
  const disablePortSpeed = handlePortSpeedFor765048F(selectedPorts)
  const hasBreakoutPort = selectedPorts.filter(p => p.portIdentifier.includes(':')).length > 0

  const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
  const [vlansOptions, setVlansOptions] = useState([] as DefaultOptionType[])
  const [portSpeedOptions, setPortSpeedOptions] = useState([] as string[])
  const [poeClassOptions, setPoeClassOptions] = useState([] as {
    label: { defaultMessage: string; }; value: string; }[]
  )
  const [vlanUsedByVe, setVlanUsedByVe] = useState('')
  const [lldpQosList, setLldpQosList] = useState([] as LldpQosModel[])

  const [editPortData, setEditPortData] = useState(null as unknown as PortSettingModel)
  const [defaultVlan, setDefaultVlan] = useState('')
  const [switchVlans, setSwitchVlans] = useState({} as SwitchVlanUnion)

  const [initPortVlans, setInitPortVlans] = useState([] as PortVlan[])
  const [profileDefaultVlan, setProfileDefaultVlan] = useState(null as unknown as Number)
  const [portsProfileVlans, setPortsProfileVlans] = useState({} as ProfileVlans)
  const [switchConfigurationProfileId, setSwitchConfigurationProfileId] = useState('')

  const [portEditStatus, setPortEditStatus] = useState('')
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [hasSwitchProfile, setHasSwitchProfile] = useState(false)
  const [hasMultipleValue, setHasMultipleValue] = useState([] as string[])
  const [disabledUseVenueSetting, setDisabledUseVenueSetting] = useState(false)
  const [disablePoeCapability, setDisablePoeCapability] = useState(false)
  const [disableCyclePoeCapability, setDisableCyclePoeCapability] = useState(false)
  const [disableSaveButton, setDisableSaveButton] = useState(false)
  const [cliApplied, setCliApplied] = useState(false)
  const [isFirmwareAbove10010f, setIsFirmwareAbove10010f] = useState(false)
  const [importDrawerVisible, setImportDrawerVisible] = useState(false)

  const [venueVlans, setVenueVlans] = useState([] as Vlan[])
  const [venueTaggedVlans, setVenueTaggedVlans] = useState('' as string)
  const [venueUntaggedVlan, setVenueUntaggedVlan] = useState('' as string)
  const [venueVoiceVlan, setVenueVoiceVlan] = useState('' as string)
  const [isVoiceVlanInvalid, setIsVoiceVlanInvalid ] = useState(false)

  const [selectModalvisible, setSelectModalvisible] = useState(false)
  const [lldpModalvisible, setLldpModalvisible] = useState(false)
  const [drawerAclVisible, setDrawerAclVisible] = useState(false)
  const [cyclePoeEnable, setCyclePoeEnable] = useState(false)

  const [getPortSetting] = useLazyGetPortSettingQuery()
  const [getPortsSetting] = useLazyGetPortsSettingQuery()
  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()
  const [getSwitchesVlan] = useLazyGetSwitchesVlanQuery()
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const [getSwitchConfigurationProfileByVenue] = useLazyGetSwitchConfigurationProfileByVenueQuery()
  const [getSwitchRoutedList] = useLazyGetSwitchRoutedListQuery()
  const [getVenueRoutedList] = useLazyGetVenueRoutedListQuery()
  const [getAclUnion] = useLazyGetAclUnionQuery()
  const [savePortsSetting, { isLoading: isPortsSettingUpdating }] = useSavePortsSettingMutation()
  const [cyclePoe, { isLoading: isCyclePoeUpdating }] = useCyclePoeMutation()

  const { data: switchDetail, isLoading: isSwitchDetailLoading }
    = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  const { data: switchData, isLoading: isSwitchDataLoading }
    = useGetSwitchQuery({
      params: { tenantId, switchId, venueId: switchDetail?.venueId },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !switchDetail?.venueId
    })

  const { data: switchesDefaultVlan, isLoading: isDefaultVlanLoading } = useGetDefaultVlanQuery({
    params: { tenantId, venueId: switchDetail?.venueId },
    payload: switches,
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !switchDetail?.venueId
  })

  const getVlans = async () => {
    if (isSwitchLevelVlanEnabled) {
      return await getSwitchUnionVlans()
    }

    return switches.length > 1
      // eslint-disable-next-line max-len
      ? await getSwitchesVlan({
        params: { tenantId, serialNumber },
        payload: switches,
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()
      : await getSwitchVlan({
        params: { tenantId, switchId, venueId: switchDetail?.venueId },
        enableRbac: isSwitchRbacEnabled,
        option: { skip: !switchDetail?.venueId }
      }, true).unwrap()
  }

  const getMultiplePortsSetting = async () => {
    const portsSettingPayload = switches.map((switchId) => ({
      switchId: switchId,
      ports: selectedPorts
        .filter(p => p.switchSerial === switchId)
        .map(p => p.portIdentifier)
    }))

    return await getPortsSetting({
      params: { tenantId, venueId: switchDetail?.venueId },
      payload: portsSettingPayload,
      enableRbac: isSwitchRbacEnabled,
      option: { skip: !switchDetail?.venueId }
    }, true).unwrap()
  }

  const getVeRouted = async (isVenueLevel: boolean, venueId?: string) => {
    const veRouteQueryParams = {
      params: { tenantId, switchId, venueId },
      payload: {
        fields: ['id', 'portNumber', 'portType'],
        sortField: 'name',
        pageSize: 10000
      },
      enableRbac: isSwitchRbacEnabled
    }
    const veRouted = isVenueLevel
      ? await getVenueRoutedList(veRouteQueryParams, true).unwrap()
      : await getSwitchRoutedList(veRouteQueryParams, true).unwrap()

    return veRouted?.data
  }

  const getSwitchUnionVlans = async () => {
    // include switch vlan and switch default vlan
    const vlanList = switchesDefaultVlan?.flatMap(
      v => v.vlanList?.filter(v => v.vlanName !== SWITCH_DEFAULT_VLAN_NAME)
    )

    const vlanIds = _.uniq(vlanList?.map(v => v.vlanId))
      ?.sort((a, b) => a - b)

    return {
      switchVlan: vlanIds?.map(v => {
        const nameList = vlanList
          ?.filter(vlan => !!vlan.vlanName && vlan.vlanId === v)
          ?.map(vlan => vlan.vlanName)

        const isAllHaveName = nameList?.length === switches.length
        const isSameName = _.uniq(nameList)?.length === 1
        const vlanName = isAllHaveName && isSameName && nameList?.[0]

        return {
          vlanId: v,
          vlanConfigName: vlanName || ''
        }
      })
    }
  }

  const getUseVenueSettingDisabled = async (profileDefaultVlan: Number) => {
    const switchVlans = switchesDefaultVlan?.map(v => v.vlanList)?.flat() ?? []

    return switchVlans?.filter((v) =>
      v?.vlanName !== SWITCH_DEFAULT_VLAN_NAME && v?.vlanId === Number(profileDefaultVlan)
    )?.length > 0
  }

  useEffect(() => {
    const setData = async () => {
      const aclUnion = await getAclUnion({
        params: { tenantId, switchId, venueId: switchDetail?.venueId },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()
      const vid = isVenueLevel ? venueId : switchDetail?.venueId
      const switchVlans = await getVlans()
      const vlansByVenue = await getVlansByVenue({
        params: { tenantId, venueId: vid },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()

      const switchProfile = await getSwitchConfigurationProfileByVenue({
        params: { tenantId, venueId: vid },
        options: { skip: !vid },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()

      const veRouted = await getVeRouted(isVenueLevel, vid)
      const vlanUsedByVe = veRouted?.filter(v => v?.portNumber)
        ?.[0]?.portNumber?.split('-')?.[2] || ''

      let portSpeed = getPortSpeed(selectedPorts)
      if (isSwitch785048CPortSpeedEnabled) {
        if(selectedPorts.some(port => port.switchModel === 'ICX7850-48C') &&
        switchDetail?.firmware &&
        (!isVerGEVer(switchDetail?.firmware , '10010f', false) ||
        (isVerGEVer(switchDetail?.firmware, '10020', false) &&
        !isVerGEVer(switchDetail?.firmware, '10020b', false)))) {
          portSpeed = portSpeed.filter(item => !item.includes('FIVE_G'))
            .filter(item => !item.includes('TEN_G_FULL_'))
        }
      }else{
        if(selectedPorts.some(port => port.switchModel === 'ICX7850-48C')) {
          portSpeed = portSpeed.filter(item => !item.includes('FIVE_G'))
            .filter(item => !item.includes('TEN_G_FULL_'))
        }
      }

      const defaultVlans = switchesDefaultVlan
        ? _.uniq(Object.values(switchesDefaultVlan)?.map(v => v?.defaultVlanId.toString()))
        : []
      const defaultVlan = defaultVlans?.length > 1 ? '' : defaultVlans?.[0]
      const profileDefaultVlan = switchProfile?.[0]?.vlans
        ?.find((item) => item?.vlanName === SWITCH_DEFAULT_VLAN_NAME)?.vlanId ?? 1
      const isCliApplied = !!switchProfile?.find(p => p.profileType === ProfileTypeEnum.CLI)

      setDefaultVlan(defaultVlan)
      setProfileDefaultVlan(profileDefaultVlan)
      setSwitchVlans(switchVlans as SwitchVlanUnion)
      setVenueVlans(vlansByVenue)
      setVlanUsedByVe(vlanUsedByVe)
      setPortSpeedOptions(portSpeed)
      setAclsOptions(getAclOptions(aclUnion))
      setPoeClassOptions(getPoeClass(selectedPorts))
      setVlansOptions(getVlanOptions(switchVlans as SwitchVlanUnion, defaultVlan, voiceVlan))

      setHasSwitchProfile(!!switchProfile?.length)
      setSwitchConfigurationProfileId(switchProfile?.[0]?.id)
      setCliApplied(isCliApplied)
      setDisabledUseVenueSetting(await getUseVenueSettingDisabled(profileDefaultVlan))
      setIsFirmwareAbove10010f(true || isFirmwareVersionAbove10010f(switchDetail?.firmware)) // TODO

      isMultipleEdit
        ? await getMultiplePortsValue(vlansByVenue, defaultVlan)
        : await getSinglePortValue(portSpeed, defaultVlan, vlansByVenue)

      setLoading(false)
    }

    // eslint-disable-next-line max-len
    if (!isSwitchDetailLoading && !isSwitchDataLoading && !isDefaultVlanLoading && switchDetail?.venueId) {
      resetFields()
      setData()
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps, max-len
  }, [selectedPorts, isSwitchDetailLoading, isSwitchDataLoading, isDefaultVlanLoading, visible])

  const getSinglePortValue = async (
    portSpeed: string[],
    defaultVlan: string,
    vlansByVenue: Vlan[]
  ) => {
    const portSettingArray = await getPortSetting({
      params: {
        tenantId, switchId,
        venueId: switchDetail?.venueId,
        portIdentifier: selectedPorts?.[0]?.portIdentifier
      },
      payload: [selectedPorts?.[0]?.portIdentifier],
      enableRbac: isSwitchRbacEnabled,
      option: { skip: !switchDetail?.venueId }
    }, true).unwrap()
    let portSetting = isSwitchRbacEnabled
      ? (portSettingArray as unknown as PortSettingModel[])?.[0]
      : portSettingArray

    // TODO: wait for API
    portSetting = {
      ...portSetting,
      switchLevelAuthDefaultVlan: 2,
      shouldAlertAaaAndRadiusNotApply: false
    }

    const { tagged, untagged, voice } = getPortVenueVlans(vlansByVenue, selectedPorts?.[0])
    setVenueTaggedVlans(tagged)
    setVenueUntaggedVlan(untagged)
    setVenueVoiceVlan(voice)

    setEditPortData(portSetting)
    setDisablePoeCapability(getPoeCapabilityDisabled([portSetting]))
    setDisableCyclePoeCapability(getPoeCapabilityDisabled([portSetting]))
    setUseVenueSettings(portSetting?.revert)
    setLldpQosList(portSetting?.lldpQos || [])
    setCyclePoeEnable(portSetting.poeEnable)

    setInitPortVlans(getInitPortVlans( [portSetting], defaultVlan ))
    setPortEditStatus(
      checkPortEditStatus(form, portSetting, portSetting?.revert, tagged, untagged, voice)
    )

    form.setFieldsValue({
      ...portSetting,
      poeEnable: portSetting.poeCapability ? portSetting.poeEnable : false,
      poeBudget: portSetting.poeBudget === 0 ? '' : portSetting.poeBudget,
      portSpeed: portSpeed.find(item => item === portSetting.portSpeed)
        ? portSetting.portSpeed : portSpeed?.[0],
      taggedVlans: (portSetting.revert ? tagged : (portSetting.taggedVlans || '')).toString(),
      untaggedVlan: portSetting.revert ? (untagged || defaultVlan) :
        (portSetting.untaggedVlan ? portSetting.untaggedVlan :
          (portSetting?.taggedVlans ? portSetting.untaggedVlan : defaultVlan)),
      voiceVlan: (portSetting.revert ? voice
        : (portSetting?.voiceVlan === 0 ? '' : portSetting?.voiceVlan)),
      switchLevelAuthDefaultVlanObj: portSetting.switchLevelAuthDefaultVlan
        ? { [switchDetail?.switchMac as string]: [Number(portSetting.switchLevelAuthDefaultVlan)] }
        : {},
      untaggedVlansObj: { [switchDetail?.switchMac as string]: [portSetting.untaggedVlan] }
    })
    checkIsVoiceVlanInvalid(true, portSetting?.revert)
  }

  const getMultiplePortsValue = async (vlansByVenue: Vlan[], defaultVlan: string) => {
    const multiPortsSetting = await getMultiplePortsSetting()
    let portsSetting = (isSwitchRbacEnabled
      ? multiPortsSetting : multiPortsSetting?.response) as PortSettingModel[]

    //TODO: wait for API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    portsSetting = portsSetting.map((p, index) => {
      return {
        ...p,
        switchLevelAuthDefaultVlan: (3),
        shouldAlertAaaAndRadiusNotApply: false
      }
    })

    const vlansValue = getMultipleVlanValue(
      selectedPorts, vlansByVenue, portsSetting, defaultVlan, switchesDefaultVlan
    )
    const poeCapabilityDisabled = getPoeCapabilityDisabled(portsSetting)
    const cyclePoeMultiPortsDisabled = getMultiPoeCapabilityDisabled(portsSetting)
    const hasMultipleValueFields = allMultipleEditableFields?.filter(field => {
      const isEqual = field === 'lldpQos'
        ? checkLldpListEqual(portsSetting?.map(s => s[field]))
        : _.uniq(portsSetting?.map(s =>
          s[field as keyof PortSettingModel]?.toString())
        )?.length === 1

      return !isEqual && field
    })

    const hasEqualValueFields = _.xor(allMultipleEditableFields, hasMultipleValueFields)
    const portSetting = _.pick(portsSetting?.[0], [...hasEqualValueFields, 'profileName'])
    const { untaggedVlans, switchLevelAuthDefaultVlan } = portsSetting.reduce(
      (result, { switchMac, untaggedVlan, switchLevelAuthDefaultVlan }) => {
        const index = switchMac as string
        if (!result.untaggedVlans) result.untaggedVlans = {}
        if (!result.untaggedVlans[index]) result.untaggedVlans[index] = [] as string[]
        if (!result.switchLevelAuthDefaultVlan) result.switchLevelAuthDefaultVlan = {}

        const untaggedVlansBySwitch = result.untaggedVlans[index] as string[]
        if (!untaggedVlansBySwitch.includes(untaggedVlan as string)) {
          untaggedVlansBySwitch.push(untaggedVlan as string)
        }

        result.switchLevelAuthDefaultVlan[index] = switchLevelAuthDefaultVlan
        return result
      }, {} as {
        untaggedVlans: Record<string, string[]>
        switchLevelAuthDefaultVlan: Record<string, number | undefined>
      }
    ) // TODO

    setDisablePoeCapability(poeCapabilityDisabled)
    setDisableCyclePoeCapability(cyclePoeMultiPortsDisabled)
    setCyclePoeEnable(portsSetting?.filter(s => s?.poeEnable)?.length > 0)

    setHasMultipleValue(_.uniq([
      ...hasMultipleValueFields,
      ...((!vlansValue.isTagEqual && ['taggedVlans']) || []),
      ...((!vlansValue.isUntagEqual && ['untaggedVlan']) || []),
      ...((!vlansValue.isVoiceVlanEqual && ['voiceVlan']) || [])
    ]))
    setInitPortVlans(vlansValue?.initPortVlans)
    setPortsProfileVlans(vlansValue?.portsProfileVlans as unknown as ProfileVlans)
    setDisableSaveButton(true)
    setLldpQosList(portSetting?.lldpQos ?? [])
    setPortEditStatus('')

    form.setFieldsValue({
      ...portSetting,
      poeEnable: poeCapabilityDisabled ? false : portSetting?.poeEnable,
      voiceVlan: !hasMultipleValueFields?.includes('voiceVlan')
        ? (portSetting?.voiceVlan || vlansValue.voice)?.toString() : '',
      taggedVlans: !hasMultipleValueFields?.includes('taggedVlans')
        ? (portSetting?.taggedVlans || vlansValue.tagged)?.toString() : '',
      untaggedVlan: (!hasMultipleValueFields?.includes('untaggedVlan')
        && vlansValue.untagged) || (portSetting.untaggedVlan ? portSetting.untaggedVlan :
        (portSetting?.taggedVlans ? portSetting.untaggedVlan : defaultVlan)),
      // flex auth
      untaggedVlansObj: untaggedVlans ?? {},
      switchLevelAuthDefaultVlanObj: switchLevelAuthDefaultVlan ?? {}
    })
  }

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
        return flexibleAuthenticationEnabled
          ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLED_WHEN_FLEX_AUTH_ENABLED)
          : (disabledUseVenueSetting ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLE) : '')
      case 'ingressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'egressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'portSpeed': return hasBreakoutPort ? $t(EditPortMessages.PORT_SPEED_TOOLTIP) : ''
      case 'flexibleAuthenticationEnabled':
        const disableKey = getFlexAuthButtonStatus()
        return disableKey ? $t(EditPortMessages[disableKey as keyof typeof EditPortMessages]) : ''
      default: return ''
    }
  }

  const getFieldDisabled = (field: string) => {
    const authfieldValues = [
      authenticationType, dot1xPortControl, authDefaultVlan,
      authFailAction, authTimeoutAction
    ]
    const checkboxEnabled = form.getFieldValue(`${field}Checkbox`)
    switch (field) {
      case 'portEnable': return isCloudPort || (isMultipleEdit && !portEnableCheckbox)
      case 'poeEnable': return (isMultipleEdit && !poeEnableCheckbox) || disablePoeCapability
      case 'poeClass': return (isMultipleEdit && !poeClassCheckbox)
        || poeClassOptions?.length === 1
        || disablePoeCapability
        || !poeEnable
        || (poeBudget && Number(poeBudget) >= 1000 && Number(poeBudget) <= 30000) // workaround for bug
        // || (poeBudget && !!form?.getFieldError('poeBudget').length) // TODO: bug
      case 'poePriority':
        return (isMultipleEdit && !poePriorityCheckbox) || disablePoeCapability || !poeEnable
      case 'poeBudget': return (isMultipleEdit && !poeBudgetCheckbox)
        || disablePoeCapability
        || !poeEnable
        || (poeClass !== 'ZERO' && poeClass !== 'UNSET')
      case 'useVenuesettings':
        return flexibleAuthenticationEnabled || disabledUseVenueSetting || switchData?.vlanCustomize
      case 'portSpeed':
        return (isMultipleEdit && !portSpeedCheckbox) || disablePortSpeed || hasBreakoutPort
      case 'ingressAcl': return (isMultipleEdit && !ingressAclCheckbox) || ipsg
      case 'cyclePoe': return disableCyclePoeCapability || !cyclePoeEnable
      // Flex auth
      case 'flexibleAuthenticationEnabled':
        return (isMultipleEdit && !checkboxEnabled)
          || !!getFlexAuthButtonStatus()
      case 'authDefaultVlan':
      case 'changeAuthOrder':
      case 'dot1xPortControl':
      case 'authFailAction':
      case 'restrictedVlan':
      case 'authTimeoutAction':
      case 'criticalVlan':
        return (isMultipleEdit && !checkboxEnabled)
          || getAuthfieldDisabled(field, authfieldValues)
      default:
        return isMultipleEdit && !checkboxEnabled
    }
  }

  const getOverrideDisabled = (field: string) => {
    switch (field) {
      case 'poeEnable': return disablePoeCapability
      case 'poeClass':
      case 'poePriority':
      case 'poeBudget':
        return disablePoeCapability || !poeEnable
      case 'voiceVlan': return vlansOptions?.length === 1
      case 'portSpeed': return !portSpeedOptions.length || disablePortSpeed || hasBreakoutPort
      case 'flexibleAuthenticationEnabled':
        return !!getFlexAuthButtonStatus()
      default: return false
    }
  }

  const getFieldTemplate = (
    content: React.ReactNode,
    field: string,
    labelName: string,
    extraLabel?: boolean
  ) => {
    return <UI.FormItem>
      {isMultipleEdit && <Form.Item
        noStyle
        label={false}
        name={`${field}Checkbox`}
        valuePropName='checked'
        initialValue={false}
        children={<Checkbox
          data-testid={`${field}-override-checkbox`}
          disabled={getOverrideDisabled(field)} />}
      />}
      { extraLabel && <UI.ExtraLabel>{ labelName }</UI.ExtraLabel> }
      { content }
    </UI.FormItem>
  }

  const shouldRenderMultipleText = (field: string, ignoreCheckbox: boolean = false) => {
    const checkboxEnabled = form.getFieldValue(`${field}Checkbox`)
    return isMultipleEdit
      && (!checkboxEnabled || ignoreCheckbox)
      && hasMultipleValue.includes(field)
  }

  const transformData = (data: PortSettingModel) => {
    const hasBreakoutPortAndVenueSettings = hasBreakoutPort && useVenueSettings
    const vlansHasChanged = form?.isFieldTouched('taggedVlans') ||
      form?.isFieldTouched('untaggedVlan') || form?.isFieldTouched('voiceVlan')
    const getInitIgnoreFields = () => {
      const overrideFields = getOverrideFields(form.getFieldsValue())
      if ((overrideFields?.includes('portVlans') && vlansHasChanged)
        && !(hasBreakoutPortAndVenueSettings)) {
        overrideFields.push('taggedVlans', 'untaggedVlan', 'voiceVlan')
      }
      return !isMultipleEdit
        ? []
        : allMultipleEditableFields.filter(f => !overrideFields.includes(f))
    }

    const originalUntaggedVlan = editPortData?.untaggedVlan
    const originalTaggedVlan = editPortData?.taggedVlans
    const originalVoiceVlan = editPortData?.voiceVlan
    const isDirtyUntaggedVlan = !_.isEqual(originalUntaggedVlan, untaggedVlan?.toString())
    const isDirtyTaggedVlan = !_.isEqual(originalTaggedVlan ?
      originalTaggedVlan : [''], taggedVlans?.split(','))
    const isDirtyVoiceVlan = (!originalVoiceVlan && !voiceVlan)
      ? false : !_.isEqual(originalVoiceVlan, Number(voiceVlan))
    const isDirtyPortVlan = isDirtyUntaggedVlan || isDirtyTaggedVlan || isDirtyVoiceVlan
    const ignoreFields = [
      ...getInitIgnoreFields(),
      isMultipleEdit && (!portVlansCheckbox || !vlansHasChanged
        || hasBreakoutPortAndVenueSettings) && 'revert',
      checkVlanIgnore(
        'untaggedVlan', untaggedVlan, isMultipleEdit, useVenueSettings, isDirtyPortVlan),
      checkVlanIgnore(
        'taggedVlans', taggedVlans, isMultipleEdit, useVenueSettings, isDirtyPortVlan),
      checkVlanIgnore(
        'voiceVlan', voiceVlan, isMultipleEdit, useVenueSettings, isDirtyPortVlan),
      checkAclIgnore('egressAcl', data?.egressAcl, aclsOptions),
      checkAclIgnore('ingressAcl', data?.ingressAcl, aclsOptions)
    ]

    if(!data.voiceVlan) {
      data.voiceVlan = null as unknown as string
    }

    Object.keys(data).forEach(key => {
      if (ignoreFields.includes(key) || key.includes('Checkbox')) {
        delete data[key as keyof PortSettingModel]
      }
    })

    return {
      transformedValues: data,
      ignoreFields: ignoreFields.filter(f => f)
    }
  }

  const applyForm = async () => {
    const values = {
      ...form.getFieldsValue(),
      revert: useVenueSettings,
      ...(lldpQosList && { lldpQos: // remove fake lldp id
        lldpQosList?.map(lldp => ( lldp.id.includes('lldp') ? _.omit(lldp, ['id']) : lldp ))
      }),
      taggedVlans: useVenueSettings ? null :
        (form.getFieldValue('taggedVlans') ?
          form.getFieldValue('taggedVlans').split(',') : []),
      untaggedVlan: useVenueSettings ? '' : form.getFieldValue('untaggedVlan'),
      voiceVlan: useVenueSettings ? null : Number(form.getFieldValue('voiceVlan'))
    }
    const defaultVlanMap = switchesDefaultVlan?.reduce((result, item) => ({
      ...result, [item.switchId]: item.defaultVlanId
    }), {})
    const { transformedValues, ignoreFields } = transformData(values)

    try {
      const payload = switches.map((item) => {
        const ports = selectedPorts
          .filter(p => p.switchSerial === item)
          .map(p => p.portIdentifier)

        return isSwitchRbacEnabled ? {
          ...transformedValues,
          switchId: item,
          port: ports?.[0],
          ports: ports,
          ...(transformedValues?.untaggedVlan === defaultVlanText && {
            untaggedVlan: defaultVlanMap?.[item as keyof typeof defaultVlanMap] ?? ''
          }),
          ...(transformedValues?.voiceVlan === defaultVlanText && {
            voiceVlan: defaultVlanMap?.[item as keyof typeof defaultVlanMap] ?? ''
          }),
          ignoreFields: ignoreFields.toString()
        } : {
          switchId: item,
          port: {
            ...transformedValues,
            ...(transformedValues?.untaggedVlan === defaultVlanText && {
              untaggedVlan: defaultVlanMap?.[item as keyof typeof defaultVlanMap] ?? ''
            }),
            ...(transformedValues?.voiceVlan === defaultVlanText && {
              voiceVlan: defaultVlanMap?.[item as keyof typeof defaultVlanMap] ?? ''
            }),
            ignoreFields: ignoreFields.toString(),
            port: ports?.[0],
            ports: ports
          }
        }
      })

      await savePortsSetting({
        params: { tenantId, venueId: switchDetail?.venueId },
        payload,
        enableRbac: isSwitchRbacEnabled,
        option: { skip: !switchDetail?.venueId }
      }).unwrap()
      store.dispatch(
        switchApi.util.invalidateTags([
          { type: 'SwitchPort', id: 'LIST' },
          { type: 'SwitchPort', id: 'Setting' }
        ])
      )
      onClose()

    } catch (err) {
      console.log(err) // eslint-disable-line no-console
    }
  }

  const onCyclePoe = async () => {
    const venueId = selectedPorts[0].venueId
    const payload = switches.map((switchId) => ({
      switchId: switchId,
      ports: selectedPorts
        .filter(p => p.switchSerial === switchId)
        .map(p => p.portIdentifier)
    }))
    await cyclePoe({
      params: { venueId },
      payload,
      enableRbac: isSwitchRbacEnabled
    }).unwrap()
    onClose()
  }

  const resetFields = async () => {
    const checkboxChecked = Object.entries(form.getFieldsValue())
      .filter(v => v?.[1] && v?.[0].includes('Checkbox')).map(v => v?.[0])
    const resetList = checkboxChecked.reduce((obj, c) => ({ ...obj, [c]: false }), {})
    form.setFieldsValue(resetList)
    form.setFieldsValue(['switchLevelAuthDefaultVlanObj', 'untaggedVlansObj']) //
    setLoading(true)
    setLldpQosList([])
  }

  const onApplyVenueSettings = () => {
    setUseVenueSettings(true)

    let untagged, tagged, status = 'venue', voice
    if (portVlansCheckbox) {
      const tagEqual = _.uniq(
        portsProfileVlans?.tagged?.map(t => (t || '')?.toString()))?.length <= 1
      const untagEqual = _.uniq(portsProfileVlans?.untagged).length === 1
      const voiceEqual = _.uniq(portsProfileVlans?.voice).length === 1
      const equalFields = [
        ...((tagEqual && ['taggedVlans']) || []),
        ...((untagEqual && ['untaggedVlan']) || []),
        ...((voiceEqual && ['voiceVlan']) || [])
      ]
      untagged = profileDefaultVlan
      tagged = ''
      voice = ''
      const tmpMultipleValue = _.uniq(
        [...hasMultipleValue, 'taggedVlans', 'untaggedVlan', 'voiceVlan']
      )
      setHasMultipleValue(_.xor(tmpMultipleValue, equalFields))
      if (tagEqual && untagEqual && !portsProfileVlans.untagged?.[0]
        && !portsProfileVlans.tagged?.[0]) {
        status = 'default'
      }
      if (untagEqual) {
        untagged = portsProfileVlans.untagged?.[0] || profileDefaultVlan
      }
      if (tagEqual) {
        tagged = portsProfileVlans.tagged?.[0]?.toString()
      }
      if (voiceEqual) {
        voice = portsProfileVlans.voice?.[0]
      }
    } else {
      const untaggedVlan = venueUntaggedVlan || profileDefaultVlan
      untagged = untaggedVlan
      tagged = venueTaggedVlans.toString()
      voice = venueVoiceVlan
      if (Number(untaggedVlan) === Number(defaultVlan) && !venueTaggedVlans) {
        status = 'default' // Venue no setting, revert to default
      }
    }

    form.setFieldsValue({
      ...form.getFieldsValue(),
      taggedVlans: tagged,
      untaggedVlan: untagged,
      voiceVlan: voice
    })
    setPortEditStatus(status)
    onValuesChange({ untaggedVlan: untagged, revert: true, status: status })
  }

  const onValuesChange = async (changedValues: Partial<PortSettingModel>) => {
    const changedField = Object.keys(changedValues)?.[0]
    const changedValue = Object.values(changedValues)?.[0]
    const taggedVlans = form?.getFieldValue('taggedVlans')
    const untaggedVlan = form?.getFieldValue('untaggedVlan')

    const setButtonStatus = () => {
      const isPoeBudgetInvalid = form?.getFieldError('poeBudget').length > 0
      const isVlansInvalid
      = (!isMultipleEdit || !!portVlansCheckbox) && (!untaggedVlan && !taggedVlans)
      const isNoOverrideFields = isMultipleEdit && !getOverrideFields(form.getFieldsValue())?.length

      setDisableSaveButton(isPoeBudgetInvalid || isVlansInvalid || isNoOverrideFields)
    }

    const updateVlanOptions = () => {
      const oldOptions = getVlanOptions(switchVlans, defaultVlan, voiceVlan)
      const options = initPortVlans?.map(p =>
        checkVlanOptions(oldOptions, untaggedVlan, taggedVlans, p))
      const newOptions = _.intersection(...options)
      setVlansOptions(newOptions as DefaultOptionType[])
    }

    const updateRelatedField = async () => {
      if (changedField === 'poeClass') {
        const poeBudgetDisabled = changedValue !== 'ZERO' && changedValue !== 'UNSET'
        if (poeBudgetDisabled && (isMultipleEdit || !disablePoeCapability)) {
          form?.resetFields(['poeBudget'])
        }
      } else if (changedField === 'poeBudget') {
        await form.validateFields().catch(error => {
          console.log(error) // eslint-disable-line no-console
        }).finally(() => {
          getFieldDisabled('poeClass')
        })
      } else if (changedField === 'ipsg') {
        changedValue && form.setFieldValue('ingressAcl', '')
      } else if (changedField === 'untaggedVlan' || changedField === 'taggedVlans'
      || changedField === 'voiceVlan') {
        const revert = changedValues?.revert ?? useVenueSettings
        setPortEditStatus(checkPortEditStatus(form, form.getFieldsValue(), revert,
          venueTaggedVlans, venueUntaggedVlan, venueVoiceVlan, changedValues?.status))
        if (!revert) {
          updateVlanOptions()
          setHasMultipleValue(hasMultipleValue.filter(v =>
            (v !== 'taggedVlans' && v !== 'untaggedVlan' && v !== 'voiceVlan'))
          )
        }
      }
    }

    await updateRelatedField()
    setButtonStatus()
    checkIsVoiceVlanInvalid()
  }

  const checkIsVoiceVlanInvalid = (init?:boolean, revert?:boolean) => {
    const applyVenueSetting = init ? revert : useVenueSettings
    const voiceVlanField = form?.getFieldValue('voiceVlan')
    const taggedVlansField = form?.getFieldValue('taggedVlans')
    let isInvalid = voiceVlanField &&
    taggedVlansField.split(',').indexOf(String(voiceVlanField)) === -1
    if (applyVenueSetting && voiceVlanField && !taggedVlansField) {
      isInvalid = false
    }
    setIsVoiceVlanInvalid(isInvalid)
  }

  const getSwitchLevelAuthDefaultVlans = () => {
    return Object.values(switchLevelAuthDefaultVlanObj ?? {})
  }
  // const getUntaggedVlans = () => {
  //   return Object.values(untaggedVlansObj ?? {}).flat() as string[]
  // }

  const getFlexAuthButtonStatus = () => {
    const switchLevelAuthVlans = getSwitchLevelAuthDefaultVlans() ?? []
    const isSwitchLevelAuthNotEnabled = switchLevelAuthVlans.length !== switches?.length
    const switchIds = Object.keys(untaggedVlansObj ?? {})

    const checkUntaggedPortMismatch = (id: string) => { //TODO: check untaggedVlansObj
      // eslint-disable-next-line max-len
      const defaultVlan = switchesDefaultVlan?.find((s: SwitchDefaultVlan) => s.switchId === id)?.defaultVlanId
      // eslint-disable-next-line max-len
      // const isUntaggedNotMatchDefaultVlan = untaggedVlan && (Number(untaggedVlan) !== Number(defaultVlan))
      const isVlanMismatchDefaultVlan = (vlan: string) => Number(vlan) !== Number(defaultVlan)

      if (!hasMultipleValue.includes('untaggedVlan') || !untaggedVlansObj[id]) {
        return untaggedVlan && isVlanMismatchDefaultVlan(untaggedVlan)
      }
      return untaggedVlansObj[id]?.some(isVlanMismatchDefaultVlan)
    }

    const isUntaggedPort = isMultipleEdit
      ? switchIds.some(id => checkUntaggedPortMismatch(id))
      : checkUntaggedPortMismatch('')

    if (isSwitchLevelAuthNotEnabled) {
      return 'SWITCH_LEVEL_AUTH_NOT_ENABLED'
    }
    if (isUntaggedPort) {
      return 'UNTAGGED_PORT_CANNOT_ENABLE_FLEX_AUTH'
    }
    return ''
  }

  const showLinkToSwitchPage = () => {
    const isSwitchLevelAuthEnabled = getFlexAuthButtonStatus() === 'SWITCH_LEVEL_AUTH_NOT_ENABLED'
    return (!isMultipleEdit || switches?.length === 1) && isSwitchLevelAuthEnabled
  }

  const getFlexAuthStatus = () => { //TODO
    const isEnabled
      = flexibleAuthenticationEnabled && (!isMultipleEdit || flexibleAuthenticationEnabledCheckbox)

    return {
      enabled: isEnabled,
      defaultVlan: isEnabled ? undefined : authDefaultVlan
    }
  }

  const onClose = () => {
    resetFields()
    setDrawerVisible(false)
  }

  const backClick = () => {
    onClose()
    if(onBackClick) {
      onBackClick()
    }
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
      {
        cyclePoeFFEnabled && <>
          <Button icon={<PoeUsage />} disabled={getFieldDisabled('cyclePoe')} onClick={onCyclePoe}>
            {$t({ defaultMessage: 'Cycle PoE' })}
          </Button>
          <UI.DrawerFooterDivider>
            <Divider type='vertical' />
          </UI.DrawerFooterDivider>
        </>
      }
      <Button disabled={loading} key='cancel' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button loading={loading}
        key='apply'
        type='primary'
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
    onBackClick={onBackClick && backClick}
    footer={footer}
    children={<Loader states={[{
      isLoading: loading,
      isFetching: isPortsSettingUpdating || isCyclePoeUpdating
    }]}>
      {
        isCloudPort && <Alert
          type='info'
          showIcon
          // eslint-disable-next-line max-len
          message={$t({ defaultMessage: 'Modifying the uplink port may result in the switch losing connectivity' })}
        />
      }
      <UI.Form
        form={form}
        layout={isMultipleEdit ? 'horizontal' : 'vertical'}
        labelAlign='left'
        onValuesChange={onValuesChange}
      >
        <UI.HorizontalFormItemLayout>
          <Form.Item
            label={$t({ defaultMessage: 'Selected Port' })}
            labelCol={{ span: 24 }}
            children={<Space style={{ fontSize: '16px' }}>
              {selectedPorts?.map(p => p.portIdentifier)?.join(', ')}
            </Space>
            }
          />
          { !isMultipleEdit &&
              <Form.Item name='name'
                label={$t({ defaultMessage: 'Port Name' })}
                rules={[
                  { max: 255 }
                ]}
                initialValue=''
                children={<Input />}
              />
          }
        </UI.HorizontalFormItemLayout>

        <UI.ContentDivider />

        {/* Flex Auth */}
        { isSwitchFlexAuthEnabled && isFirmwareAbove10010f && <>
          { getFieldTemplate(
            <Form.Item
              noStyle
              label={false}
              children={
                shouldRenderMultipleText('flexibleAuthenticationEnabled')
                  ? <MultipleText />
                  : <Tooltip title={getFieldTooltip('flexibleAuthenticationEnabled')}>
                    <Space style={{ display: 'flex', flex: '1',
                      justifyContent: !!getFlexAuthButtonStatus() ? '' : 'space-between'
                    }}>
                      <Form.Item
                        name='flexibleAuthenticationEnabled'
                        noStyle
                        valuePropName='checked'
                        initialValue={false}
                      >
                        <Switch
                          data-testid='flex-enable-switch'
                          disabled={getFieldDisabled('flexibleAuthenticationEnabled')}
                          className={
                            // eslint-disable-next-line max-len
                            getToggleClassName('flexibleAuthenticationEnabled', isMultipleEdit, hasMultipleValue)
                          }
                          onChange={async (checked) => {
                            if (checked && useVenueSettings) {
                              onValuesChange({
                                untaggedVlan: defaultVlan,
                                revert: true, status: 'port'
                              })
                            }
                          }}
                        />

                      </Form.Item>
                      { showLinkToSwitchPage() && <Button
                        type='link'
                        size='small'
                        onClick={() => navigate({ //TODO
                          ...basePath,
                          // eslint-disable-next-line max-len
                          pathname: `${basePath.pathname}/${switchDetail?.id}/${switchDetail?.serialNumber}${ switchDetail?.isStack ? '/stack' : 'switch' }/edit`
                        })}
                      >{ $t({ defaultMessage: 'Go to Edit Switch page' })}</Button>
                      }
                      { flexibleAuthenticationEnabled &&
                        <Button
                          type='link'
                          size='small'
                          onClick={() => setImportDrawerVisible(true)}
                        >{
                            $t({ defaultMessage: 'Import Flexible Authentication' })
                          }</Button>
                      }
                    </Space>
                  </Tooltip>
              }
            />,
            'flexibleAuthenticationEnabled', $t({ defaultMessage: 'Flexible Authentication' }), true
          )}
          { <Form.Item name='untaggedVlansObj' hidden initialValue={{}} children={<></>} /> }
          { <Form.Item name='switchLevelAuthDefaultVlanObj'
            hidden
            initialValue={{}}
            children={<></>}
          /> }
          { flexibleAuthenticationEnabled &&
          <Space style={{ display: 'block', marginLeft: isMultipleEdit ? '24px' : '0' }}>
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authenticationType'
                label={$t({ defaultMessage: 'Type' })}
                initialValue={AuthenticationType._802_1X}
                children={shouldRenderMultipleText('authenticationType')
                  ? <MultipleText />
                  : <Select
                    options={Object.values(AuthenticationType).map(authType => ({
                      label: $t(authenticationTypeLabel[authType]),
                      value: authType
                    }))}
                    disabled={getFieldDisabled('authenticationType')}
                    onChange={(value) => handleAuthFieldChange('authenticationType', value, form)}
                  />}
              />,
              'authenticationType', $t({ defaultMessage: 'Type' })
            )}
            { getFieldTemplate(
              <Form.Item
                noStyle
                label={false}
                children={
                  shouldRenderMultipleText('changeAuthOrder')
                    ? <MultipleText />
                    : <Tooltip title={getFieldTooltip('changeAuthOrder')}>
                      <Space>
                        <Form.Item
                          name='changeAuthOrder'
                          noStyle
                          valuePropName='checked'
                          initialValue={false}
                        >
                          <Switch
                            data-testid='flex-auth-order-switch'
                            disabled={getFieldDisabled('changeAuthOrder')}
                            className={getToggleClassName(
                              'changeAuthOrder', isMultipleEdit, hasMultipleValue
                            )}
                          />
                        </Form.Item>
                      </Space>
                    </Tooltip>
                }
              />,
              'changeAuthOrder', $t({ defaultMessage: 'Change Authentication Order' }), true
            )}
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='dot1xPortControl'
                label={$t({ defaultMessage: '802.1x Port Control' })}
                initialValue={PortControl.AUTO}
                children={shouldRenderMultipleText('dot1xPortControl')
                  ? <MultipleText />
                  : <Select
                    options={Object.values(PortControl).map(controlType => ({
                      label: $t(portControlTypeLabel[controlType]),
                      value: controlType
                    }))}
                    disabled={getFieldDisabled('dot1xPortControl')}
                    onChange={(value) => handleAuthFieldChange('dot1xPortControl', value, form)}
                  />}
              />,
              'dot1xPortControl', $t({ defaultMessage: '802.1x Port Control' })
            )}
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authDefaultVlan'
                label={$t({ defaultMessage: 'Auth Default VLAN' })}
                initialValue=''
                validateFirst
                rules={[
                  { required: true },
                  { validator: (_, value) => validateVlanExceptReservedVlanId(value) },
                  { validator: (_, value) => {
                    if (Number(value) === Number(defaultVlan)) {
                      return Promise.reject(
                        $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_DEFAULT_VLAN)
                      )
                    }
                    return Promise.resolve()
                  } },
                  { validator: (_, value) => {
                    const taggedVlanArray = taggedVlans?.split(',')
                    if (taggedVlanArray.includes(value)) {
                      return Promise.reject(
                        $t(FlexAuthMessages.CANNOT_SAME_AS_TAGGED_VLAN)
                      )
                    }
                    return Promise.resolve()
                  } }
                ]}
                children={shouldRenderMultipleText('authDefaultVlan')
                  ? <MultipleText />
                  : <Input disabled={getFieldDisabled('authDefaultVlan')} maxLength={255} />
                }
              />,
              'authDefaultVlan', $t({ defaultMessage: 'Auth Default VLAN' })
            )}
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authFailAction'
                label={$t({ defaultMessage: 'Fail Action' })}
                initialValue={AuthFailAction.BLOCK}
                children={shouldRenderMultipleText('authFailAction')
                  ? <MultipleText />
                  : <Select
                    options={Object.values(AuthFailAction).map(failType => ({
                      label: $t(authFailActionTypeLabel[failType]),
                      value: failType
                    }))}
                    disabled={getFieldDisabled('authFailAction')}
                    onChange={(value) => handleAuthFieldChange('authFailAction', value, form)}
                  />}
              />,
              'authFailAction', $t({ defaultMessage: 'Fail Action' })
            )}
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='restrictedVlan'
                label={$t({ defaultMessage: 'Restricted VLAN' })}
                initialValue=''
                validateFirst
                rules={[
                  ...(authFailAction === AuthFailAction.RESTRICTED_VLAN
                    ? [
                      {
                        validator: (_:unknown, value: string) =>
                          validateVlanExceptReservedVlanId(value)
                      },
                      { validator: (_:unknown, value: string) => {
                        if (Number(value) === Number(defaultVlan)) { //
                          return Promise.reject(
                            $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_DEFAULT_VLAN)
                          )
                        }
                        return Promise.resolve()
                      } },
                      { validator: (_:unknown, value: string) => {
                        if (Number(value) === Number(authDefaultVlan)) {
                          return Promise.reject(
                            $t(FlexAuthMessages.CANNOT_SAME_AS_AUTH_DEFAULT_VLAN)
                          )
                        }
                        return Promise.resolve()
                      } },
                      { validator: (_:unknown, value: string) => {
                        if (getSwitchLevelAuthDefaultVlans().includes(Number(value))) {
                          return Promise.reject(
                            $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_LEVEL_AUTH_DEFAULT_VLAN)
                          )
                        }
                        return Promise.resolve()
                      } }
                    ] : []
                  )
                ]}
                children={shouldRenderMultipleText('restrictedVlan')
                  ? <MultipleText />
                  : <Input disabled={getFieldDisabled('restrictedVlan')} maxLength={255} />
                }
              />,
              'restrictedVlan', $t({ defaultMessage: 'Restricted VLAN' })
            )}
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authTimeoutAction'
                label={$t({ defaultMessage: 'Timeout Action' })}
                initialValue={AuthTimeoutAction.NONE}
                children={shouldRenderMultipleText('authTimeoutAction')
                  ? <MultipleText />
                  : <Select
                    options={Object.values(AuthTimeoutAction).map(timeoutType => ({
                      label: $t(authTimeoutActionTypeLabel[timeoutType]),
                      value: timeoutType
                    }))}
                    disabled={getFieldDisabled('authTimeoutAction')}
                    onChange={(value) => handleAuthFieldChange('authTimeoutAction', value, form)}
                  />}
              />,
              'authTimeoutAction', $t({ defaultMessage: 'Timeout Action' })
            )}
            { getFieldTemplate(
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='criticalVlan'
                label={$t({ defaultMessage: 'Critical VLAN' })}
                initialValue=''
                validateFirst
                rules={[
                  ...(authTimeoutAction === AuthTimeoutAction.CRITICAL_VLAN
                    ? [
                      {
                        validator: (_:unknown, value: string) =>
                          validateVlanExceptReservedVlanId(value)
                      },
                      { validator: (_:unknown, value: string) => {
                        if (Number(value) === Number(defaultVlan)) { //
                          return Promise.reject(
                            $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_DEFAULT_VLAN)
                          )
                        }
                        return Promise.resolve()
                      } },
                      { validator: (_:unknown, value: string) => {
                        if (Number(value) === Number(authDefaultVlan)) {
                          return Promise.reject(
                            $t(FlexAuthMessages.CANNOT_SAME_AS_AUTH_DEFAULT_VLAN)
                          )
                        }
                        return Promise.resolve()
                      } },
                      { validator: (_:unknown, value: string) => {
                        if (getSwitchLevelAuthDefaultVlans().includes(Number(value))) {
                          return Promise.reject(
                            $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_LEVEL_AUTH_DEFAULT_VLAN)
                          )
                        }
                        return Promise.resolve()
                      } }
                    ] : []
                  )
                ]}
                children={shouldRenderMultipleText('criticalVlan')
                  ? <MultipleText />
                  : <Input disabled={getFieldDisabled('criticalVlan')} maxLength={255} />
                }
              />,
              'criticalVlan', $t({ defaultMessage: 'Critical VLAN' })
            )}
          </Space>}
          <UI.ContentDivider />
        </>
        }

        {/* Port VLAN */}
        <UI.FormItem>
          {isMultipleEdit && <Space
            style={{ height: '96px', alignItems: 'baseline', paddingRight: '10px' }}
          >
            <Form.Item
              noStyle
              label={false}
              name='portVlansCheckbox'
              valuePropName='checked'
              initialValue={false}
              children={<Checkbox data-testid='portVlans-override-checkbox' />}
            />
          </Space>}
          <div style={{ marginBottom: isMultipleEdit ? '0' : '30px' }}>
            <Space style={{
              width: '510px', display: 'flex', justifyContent: 'space-between',
              marginBottom: isMultipleEdit ? '16px' : '4px'
            }}>
              { !isMultipleEdit ?<Subtitle level={3} style={{ margin: 0 }}>
                {$t({ defaultMessage: 'Port VLANs' })}
              </Subtitle>
                : <span>{$t({ defaultMessage: 'Port VLANs' })}</span>
              }
              {(!isMultipleEdit || portVlansCheckbox) &&
                <Space size={24}>
                  <Space size={0} split={<UI.Divider />}>
                    <Button type='link'
                      key='edit'
                      size='small'
                      data-testid='edit-vlans'
                      onClick={() => setSelectModalvisible(true)}
                    >{portEditStatus && (portEditStatus !== 'port')
                        ? $t({ defaultMessage: 'Customize' })
                        : $t({ defaultMessage: 'Edit' })
                      }</Button>
                    {((!useVenueSettings || !portEditStatus || portEditStatus === 'port')
                      && !hasBreakoutPort) &&
                      <Tooltip title={getFieldTooltip('useVenuesettings')} >
                        <Space>
                          <Button type='link'
                            key='use-venue-settings'
                            size='small'
                            disabled={getFieldDisabled('useVenuesettings')}
                            onClick={onApplyVenueSettings}
                          >
                            {$t({ defaultMessage: 'Use <VenueSingular></VenueSingular> settings' })}
                          </Button>
                        </Space>
                      </Tooltip>
                    }
                  </Space>
                </Space>
              }
            </Space>
            { portEditStatus &&
              <UI.PortStatus>
                {getPortEditStatus(portEditStatus)}
                {
                  portEditStatus === 'venue' && profileName &&
                  <span className='profile'>({profileName})</span>
                }
                <Form.Item
                  name='profileName'
                  hidden
                  children={<></>}
                />
              </UI.PortStatus>
            }
            <Form.Item
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              style={{ width: '95%' }}
              name='untaggedVlan'
              children={shouldRenderMultipleText('untaggedVlan', true)
                ? <MultipleText data-testid='untagged-multi-text' />
                : <Space style={{ fontSize: isMultipleEdit ? '14px' : '16px', margin: 0 }}>{
                  untaggedVlan
                    ? $t({ defaultMessage: 'VLAN-ID: {vlan} {extra}' }, {
                      vlan: untaggedVlan,
                      extra: !isMultipleEdit && (Number(defaultVlan) === Number(untaggedVlan))
                        ? $t({ defaultMessage: '(Default VLAN)' })
                        : ''
                    })
                    : '--'
                }</Space>
              }
            />
            <Form.Item
              label={<>
                {$t({ defaultMessage: 'Tagged VLAN' })}
                <Tooltip.Question
                  title={$t(EditPortMessages.TAGGED_VLAN_VOICE_TOOLTIP)}
                />
              </>}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              style={{ width: '95%', marginBottom: '0' }}
              name='taggedVlans'
              children={shouldRenderMultipleText('taggedVlans', true)
                ? <MultipleText data-testid='tagged-multi-text' />
                : <Space style={{ fontSize: isMultipleEdit ? '14px' : '16px', margin: 0 }}>{
                  taggedVlans?.length > 0
                    ? $t(
                      { defaultMessage: 'VLAN-ID: {vlan}' },
                      { vlan: sortOptions(taggedVlans?.toString().split(','), 'number').join(', ') }
                    )
                    : '--'
                }</Space>}
            />
            { !isMultipleEdit ?
              <UI.VoiceVlan>
                <Form.Item
                  name='voiceVlan'
                  noStyle
                  children={
                    <Space data-testid='voice-vlan' size={4}>
                      <span> {$t({ defaultMessage: 'Set as Voice VLAN:' })} </span>
                      {
                        voiceVlan
                          ? $t({ defaultMessage: 'Yes (VLAN-ID: {voiceVlan})' }, { voiceVlan })
                          : $t({ defaultMessage: 'No' })
                      }
                    </Space>
                  }
                />
              </UI.VoiceVlan> :
              <UI.VoiceVlan>
                <Form.Item
                  name='voiceVlan'
                  label={<></>}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 24 }}
                  style={{ width: '95%', marginBottom: '0' }}
                  children={
                    <span className='multiple'>
                      <span className='title'>{$t({ defaultMessage: 'Set as Voice VLAN:' })}</span>
                      {
                        isMultipleEdit && hasMultipleValue.includes('voiceVlan')
                          ? <MultipleText />
                          : <>
                            { voiceVlan
                              ? $t({ defaultMessage: 'Yes (VLAN-ID: {voiceVlan})' }, { voiceVlan })
                              : $t({ defaultMessage: 'No' })
                            }
                          </>
                      }
                    </span>
                  }
                />
              </UI.VoiceVlan>
            }
            {
              isVoiceVlanInvalid &&
              <UI.FieldErrorMessage>
                { $t(EditPortMessages.INVALID_VOICE_VLAN) }
              </UI.FieldErrorMessage>
            }
            {!untaggedVlan && !taggedVlans
              // eslint-disable-next-line max-len
              && !(isMultipleEdit && (hasMultipleValue.includes('untaggedVlan') || hasMultipleValue.includes('taggedVlans')))
              && <UI.FieldErrorMessage>{
                isMultipleEdit
                  ? $t(MultipleEditPortMessages.UNSELECT_VLANS)
                  : $t(EditPortMessages.UNSELECT_VLANS)
              } </UI.FieldErrorMessage>}
          </div>
        </UI.FormItem>

        <UI.ContentDivider />

        { getFieldTemplate(
          <Form.Item
            noStyle
            label={false}
            children={
              shouldRenderMultipleText('portEnable')
                ? <MultipleText />
                : <Tooltip title={getFieldTooltip('portEnable')}>
                  <Space>
                    <Form.Item
                      name='portEnable'
                      noStyle
                      valuePropName='checked'
                      initialValue={false}
                    >
                      <Switch
                        data-testid='port-enable-checkbox'
                        disabled={getFieldDisabled('portEnable')}
                        className={
                          getToggleClassName('portEnable', isMultipleEdit, hasMultipleValue)
                        }
                      />
                    </Form.Item>
                  </Space>
                </Tooltip>
            }
          />,
          'portEnable', $t({ defaultMessage: 'Port Enabled' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            children={shouldRenderMultipleText('poeEnable')
              ? <MultipleText />
              : <Tooltip title={getFieldTooltip('poeEnable')}>
                <Space>
                  <Form.Item
                    name='poeEnable'
                    noStyle
                    valuePropName='checked'
                    initialValue={false}
                  >
                    <Switch
                      data-testid='poeEnable'
                      disabled={getFieldDisabled('poeEnable')}
                      className={getToggleClassName('poeEnable', isMultipleEdit, hasMultipleValue)}
                    />
                  </Form.Item>
                </Space>
              </Tooltip>

            }
          />,
          'poeEnable', $t({ defaultMessage: 'PoE Enabled' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='poeClass'
            label={$t({ defaultMessage: 'PoE Class' })}
            initialValue='UNSET'
            children={shouldRenderMultipleText('poeClass')
              ? <MultipleText />
              : <Select
                options={poeClassOptions.map(
                  p => ({ label: $t(p.label), value: p.value }))}
                disabled={getFieldDisabled('poeClass')}
              />}
          />,
          'poeClass', $t({ defaultMessage: 'PoE Class' })
        )}

        { getFieldTemplate(
          <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='poePriority'
            label={$t({ defaultMessage: 'PoE Priority' })}
            initialValue={1}
            children={
              shouldRenderMultipleText('poePriority')
                ? <MultipleText />
                : <Select
                  options={poePriorityOptions}
                  disabled={getFieldDisabled('poePriority')}
                />}
          />,
          'poePriority', $t({ defaultMessage: 'PoE Priority' })
        )}

        { getFieldTemplate(
          <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='poeBudget'
              label={$t({ defaultMessage: 'PoE Budget' })}
              rules={[
                { validator: (_, value) => poeBudgetRegExp(value) }
              ]}
              initialValue=''
              children={
                shouldRenderMultipleText('poeBudget')
                  ? <MultipleText />
                  : <Input
                    data-testid='poe-budget-input'
                    placeholder={$t({ defaultMessage: 'Enter value between 1000 to 30000 mWatts' })}
                    disabled={getFieldDisabled('poeBudget')}
                  />}
            />
            {((isMultipleEdit && poeBudgetCheckbox) || !isMultipleEdit)
            && <Space align='baseline'
              style={{
                display: 'flex', fontSize: '12px',
                margin: isMultipleEdit ? '10px 0px 0px 10px' : '30px 0 0 10px'
              }}>
              {$t({ defaultMessage: 'mWatts' })}</Space>
            }
          </>,
          'poeBudget', $t({ defaultMessage: 'PoE Budget' })
        )}

        <UI.ContentDivider />

        { getFieldTemplate(
          <Form.Item
            noStyle
            label={false}
            name='portProtected'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText('portProtected')
              ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('portProtected')}
                className={getToggleClassName('portProtected', isMultipleEdit, hasMultipleValue)}
              />}
          />,
          'portProtected', $t({ defaultMessage: 'Protected Port' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            label={false}
            name='lldpEnable'
            valuePropName='checked'
            initialValue={true}
            children={shouldRenderMultipleText('lldpEnable')
              ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('lldpEnable')}
                className={getToggleClassName('lldpEnable', isMultipleEdit, hasMultipleValue)}
              />}
          />,
          'lldpEnable', $t({ defaultMessage: 'LLDP Enabled' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            label={$t({ defaultMessage: 'Port Speed' })}
            children={shouldRenderMultipleText('portSpeed')
              ? <MultipleText />
              : <Tooltip title={getFieldTooltip('portSpeed')}>
                <Form.Item
                  name='portSpeed'
                  initialValue='NONE'>
                  <Select
                    options={portSpeedOptions.map((p: string) => ({
                      label: PORT_SPEED[p as keyof typeof PORT_SPEED], value: p
                    }))}
                    disabled={getFieldDisabled('portSpeed')}
                    className={getToggleClassName('portSpeed', isMultipleEdit, hasMultipleValue)}
                  ></Select>
                </Form.Item>
              </Tooltip>
            }
          />,
          'portSpeed', $t({ defaultMessage: 'Port Speed' })
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            name='rstpAdminEdgePort'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText('rstpAdminEdgePort')
              ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('rstpAdminEdgePort')}
                className={
                  getToggleClassName('rstpAdminEdgePort', isMultipleEdit, hasMultipleValue)
                }/>}
          />,
          'rstpAdminEdgePort', $t({ defaultMessage: 'RSTP Admin Edge Port' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            label={false}
            name='stpBpduGuard'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText('stpBpduGuard')
              ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('stpBpduGuard')}
                className={getToggleClassName('stpBpduGuard', isMultipleEdit, hasMultipleValue)}
              />}
          />,
          'stpBpduGuard', $t({ defaultMessage: 'STP BPDU Guard' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            label={false}
            name='stpRootGuard'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText('stpRootGuard')
              ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('stpRootGuard')}
                className={getToggleClassName('stpRootGuard', isMultipleEdit, hasMultipleValue)}
              />
            }
          />,
          'stpRootGuard', $t({ defaultMessage: 'STP Root Guard' }), true
        )}

        <UI.ContentDivider />

        { getFieldTemplate(
          <Form.Item
            noStyle
            label={false}
            name='dhcpSnoopingTrust'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText('dhcpSnoopingTrust')
              ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('dhcpSnoopingTrust')}
                className={
                  getToggleClassName('dhcpSnoopingTrust', isMultipleEdit, hasMultipleValue)
                }
              />
            }
          />,
          'dhcpSnoopingTrust', $t({ defaultMessage: 'DHCP Snooping Trust' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            children={shouldRenderMultipleText('ipsg')
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
                  className={getToggleClassName('ipsg', isMultipleEdit, hasMultipleValue)}
                />
              </Form.Item>}
          />,
          'ipsg', $t({ defaultMessage: 'IPSG' }), true
        )}

        { getFieldTemplate(
          <Form.Item
            noStyle
            name='lldpQos'
            initialValue={false}
            children={shouldRenderMultipleText('lldpQos')
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
          />,
          'lldpQos', $t({ defaultMessage: 'LLDP QoS' }), true
        )}

        <div style={{ marginBottom: '20px' }}>
          <LldpQOSTable
            editable={!isMultipleEdit || lldpQosCheckbox}
            setLldpModalvisible={setLldpModalvisible}
            lldpModalvisible={lldpModalvisible}
            lldpQosList={lldpQosList}
            setLldpQosList={setLldpQosList}
            vlansOptions={vlansOptions}
          />
        </div>

        <ACLSettingDrawer
          visible={drawerAclVisible}
          setVisible={setDrawerAclVisible}
          aclsOptions={aclsOptions}
          setAclsOptions={setAclsOptions}
          profileId={switchConfigurationProfileId}
        />
        { getFieldTemplate(
          <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='ingressAcl'
              label={$t({ defaultMessage: 'Ingress ACL (IPv4)' })}
              initialValue=''
              children={shouldRenderMultipleText('ingressAcl')
                ? <MultipleText />
                : <Select
                  options={aclsOptions}
                  disabled={getFieldDisabled('ingressAcl')}
                />
              }
            />
            {((isMultipleEdit && ingressAclCheckbox) || !isMultipleEdit) && hasCreatePermission &&
            <Tooltip title={getFieldTooltip('ingressAcl')}>
              <Space style={{ marginLeft: '8px', marginBottom: isMultipleEdit ? '10px' : '' }}>
                <Button type='link'
                  key='add-ingress-acl'
                  size='small'
                  disabled={(isMultipleEdit && !ingressAclCheckbox) || !hasSwitchProfile || ipsg}
                  onClick={() => { setDrawerAclVisible(true) }}
                >
                  {$t({ defaultMessage: 'Add ACL' })}
                </Button>
              </Space>
            </Tooltip>}
          </>,
          'ingressAcl', $t({ defaultMessage: 'Ingress ACL (IPv4)' })
        )}

        { getFieldTemplate(
          <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='egressAcl'
              label={$t({ defaultMessage: 'Egress ACL (IPv4)' })}
              initialValue=''
              children={shouldRenderMultipleText('egressAcl')
                ? <MultipleText />
                : <Select
                  options={aclsOptions}
                  disabled={getFieldDisabled('egressAcl')}
                />
              }
            />
            {((isMultipleEdit && egressAclCheckbox) || !isMultipleEdit) && hasCreatePermission &&
            <Tooltip title={getFieldTooltip('egressAcl')}>
              <Space style={{ marginLeft: '8px' }}>
                <Button type='link'
                  key='add-egress-acl'
                  size='small'
                  disabled={(isMultipleEdit && !egressAclCheckbox) || !hasSwitchProfile}
                  onClick={() => { setDrawerAclVisible(true) }}
                >{$t({ defaultMessage: 'Add ACL' })}
                </Button>
              </Space>
            </Tooltip>}
          </>,
          'egressAcl', $t({ defaultMessage: 'Egress ACL (IPv4)' })
        )}

        {getFieldTemplate(
          <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='tags'
            label={$t({ defaultMessage: 'Tags' })}
            initialValue=''
            children={shouldRenderMultipleText('tags')
              ? <MultipleText />
              : <Input disabled={getFieldDisabled('tags')} maxLength={255} />
            }
          />,
          'tags', $t({ defaultMessage: 'Tags' })
        )}

      </UI.Form>

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
        showVoiceVlan={true}
        voiceVlan={voiceVlan}
        isVoiceVlanInvalid={isVoiceVlanInvalid}
        vlanDisabledTooltip={$t(EditPortMessages.ADD_VLAN_DISABLE)}
        hasSwitchProfile={hasSwitchProfile}
        cliApplied={cliApplied}
        profileId={switchConfigurationProfileId}
        switchIds={switches}
        venueId={switchDetail?.venueId}
        authDefaultVlan={getFlexAuthStatus().defaultVlan}
        flexAuthEnabled={getFlexAuthStatus().enabled}
        defaultTabKey={getFlexAuthStatus().enabled ? VlanModalType.TAGGED : undefined}
        updateSwitchVlans={async (values: Vlan) => {
          updateSwitchVlans(
            values,
            switchVlans,
            setSwitchVlans,
            venueVlans,
            setVenueVlans,
            isSwitchLevelVlanEnabled
          )
          // TODO: not working
          form.validateFields(['authDefaultVlan'])
        }}
      />}

      {lldpModalvisible && <EditLldpModal
        isEditMode={false}
        setLldpModalvisible={setLldpModalvisible}
        lldpModalvisible={lldpModalvisible}
        lldpQosList={lldpQosList}
        setLldpQosList={setLldpQosList}
        vlansOptions={vlansOptions}
      />}

      { importDrawerVisible && <Drawer
        title={$t({ defaultMessage: 'Import Flexible Authentication' })}
        visible={importDrawerVisible}
        onClose={() => setImportDrawerVisible(false)}
        width={580}
        children={<>
        </>
        }
      />
      }

    </Loader>}
    width={'590px'}
  />
}
