import { useEffect, useRef, useState } from 'react'

import { Checkbox, Divider, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { DefaultOptionType }                                                  from 'antd/lib/select'
import _                                                                      from 'lodash'

import {
  Alert,
  Button,
  Drawer,
  showActionModal,
  Subtitle,
  Tooltip,
  Loader,
  Table,
  TableProps
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
  useCyclePoeMutation,
  useLazyPortProfileOptionsForMultiSwitchesQuery,
  useGetSwitchStickyMacAclsQuery,
  useGetSwitchMacAclsQuery,
  useGetLayer2AclsQuery
} from '@acx-ui/rc/services'
import {
  EditPortMessages,
  FlexAuthMessages,
  FlexAuthVlanLabel,
  FlexibleAuthentication,
  LldpQosModel,
  MultipleEditPortMessages,
  poeBudgetRegExp,
  PORT_SPEED,
  SwitchRow,
  SwitchPortViewModel,
  SwitchVlanUnion,
  SWITCH_DEFAULT_VLAN_NAME,
  ProfileTypeEnum,
  PortSettingModel,
  isFirmwareVersionAbove10010f,
  isVerGEVer,
  validateVlanExcludingReserved,
  Vlan,
  VlanModalType,
  isFirmwareVersionAbove10020b,
  PortProfilesBySwitchId,
  SwitchUrlsInfo,
  isFirmwareVersionAbove10010gOr10020b,
  isFirmwareVersionAbove10010gCd1Or10020bCd1,
  useTableQuery,
  SchedulerTypeEnum
} from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'
import { store }                             from '@acx-ui/store'
import { MacACLDrawer, PoeSchedule }         from '@acx-ui/switch/components'
import { SwitchScopes }                      from '@acx-ui/types'
import { hasPermission }                     from '@acx-ui/user'
import { getIntl, getOpsApi, noDataDisplay } from '@acx-ui/utils'

import {
  AuthenticationType,
  authenticationTypeLabel,
  AuthFailAction,
  authFailActionTypeLabel,
  AuthTimeoutAction,
  authTimeoutActionTypeLabel,
  checkVlanDiffFromTargetVlan,
  getAuthFieldDisabled,
  PortControl,
  portControlTypeLabel,
  shouldHideAuthField
} from '../FlexibleAuthentication'
import { handleAuthFieldChange } from '../FlexibleAuthentication'

import { ACLSettingDrawer } from './ACLSettingDrawer'
import { EditLldpModal }    from './editLldpModal'
import {
  AggregatePortSettings,
  aggregatePortSettings,
  checkMultipleVlansDifferences,
  checkGuestVlanConsistency,
  checkVlanDiffFromAuthDefaultVlan,
  checkVlanDiffFromSwitchDefaultVlan,
  checkVlanDiffFromSwitchAuthDefaultVlan,
  handleClickCustomize,
  handlePortVlanChange,
  handleAuthOverrideFieldChange,
  getAppliedProfile,
  getCurrentAuthDefaultVlan,
  getFlexAuthButtonStatus,
  getFlexAuthDefaultValue,
  getFlexAuthEnabled,
  getUnionValuesByKey,
  isOverrideFieldNotChecked,
  isForceControlType,
  renderAuthProfile,
  validateApplyProfile
} from './editPortDrawer.flexAuth.utils'
import {
  checkVlanOptions,
  checkLldpListEqual,
  checkAclIgnore,
  checkPortEditStatus,
  checkVlanIgnore,
  FIELD_LABEL,
  getAclOptions,
  getAllSwitchVlans,
  getDefaultVlanMapping,
  getFormItemLayout,
  getInitPortVlans,
  getMultipleVlanValue,
  getMultiPoeCapabilityDisabled,
  getOverrideFields,
  getPoeCapabilityDisabled,
  getPoeClass,
  getPortEditStatus,
  getPortSpeed,
  getPortVenueVlans,
  getToggleClassName,
  getVlanOptions,
  handlePortSpeedFor765048F,
  shouldRenderMultipleText,
  sortOptions,
  PortVlan,
  MultipleText,
  updateSwitchVlans,
  getPortProfileOptions,
  ptToPtMacActionMessages,
  getMacAclOptions
} from './editPortDrawer.utils'
import { LldpQOSTable }    from './lldpQOSTable'
import { SelectVlanModal } from './selectVlanModal'
import * as UI             from './styledComponents'

const poePriorityOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
]

export const allMultipleEditableFields = [
  'dhcpSnoopingTrust', 'egressAcl', 'ingressAcl', 'ipsg', 'lldpEnable',
  'name', 'poeClass', 'poeEnable', 'poePriority', 'portEnable', 'portSpeed',
  'rstpAdminEdgePort', 'stpBpduGuard', 'stpRootGuard', 'taggedVlans', 'voiceVlan',
  'lldpQos', 'tags', 'untaggedVlan', 'poeBudget', 'portProtected',
  'flexibleAuthenticationEnabled', 'authenticationCustomize', 'authenticationProfileId',
  'authDefaultVlan', 'guestVlan', 'authenticationType', 'changeAuthOrder', 'dot1xPortControl',
  'restrictedVlan', 'criticalVlan', 'authFailAction', 'authTimeoutAction', 'switchPortProfileId',
  'adminPtToPt', 'portSecurity', 'portSecurityMaxEntries', 'switchMacAcl'
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
  switchList,
  authProfiles = [],
  onBackClick
}: {
  visible: boolean,
  setDrawerVisible: (visible: boolean) => void,
  isCloudPort: boolean,
  isMultipleEdit: boolean,
  isVenueLevel: boolean,
  selectedPorts: SwitchPortViewModel[],
  switchList?: SwitchRow[],
  authProfiles?: FlexibleAuthentication[]
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
    ipsgCheckbox,
    ipsg,
    lldpQosCheckbox,
    ingressAclCheckbox,
    egressAclCheckbox,
    switchMacAclCheckbox,
    profileName,
    // Flex auth
    authenticationProfileId,
    authenticationProfileIdCheckbox,
    authenticationCustomize,
    flexibleAuthenticationEnabled,
    flexibleAuthenticationEnabledCheckbox,
    authenticationType,
    dot1xPortControl,
    dot1xPortControlCheckbox,
    authDefaultVlan,
    authDefaultVlanCheckbox,
    authFailAction,
    authFailActionCheckbox,
    restrictedVlanCheckbox,
    authTimeoutAction,
    authTimeoutActionCheckbox,
    criticalVlanCheckbox,
    portSecurity,
    poeScheduler
  } = (useWatch([], form) ?? {})

  const { tenantId, venueId, serialNumber } = useParams()
  const [ loading, setLoading ] = useState<boolean>(true)
  const cyclePoeFFEnabled = useIsSplitOn(Features.SWITCH_CYCLE_POE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)
  const isSwitch785048CPortSpeedEnabled =
    useIsSplitOn(Features.SWITCH_ICX7850_48C_SUPPORT_PORT_SPEED_TOGGLE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const isSwitchRstpPtToPtMacEnabled = useIsSplitOn(Features.SWITCH_RSTP_PT_TO_PT_MAC_TOGGLE)
  const isSwitchErrorRecoveryEnabled = useIsSplitOn(Features.SWITCH_ERROR_DISABLE_RECOVERY_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)
  const isSwitchTimeBasedPoeEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_TIME_BASED_POE_TOGGLE)

  const hasCreatePermission = hasPermission({
    scopes: [SwitchScopes.CREATE],
    rbacOpsIds: [getOpsApi(SwitchUrlsInfo.addAcl), getOpsApi(SwitchUrlsInfo.addSwitchMacAcl)]
  })

  const switches: string[] = _.uniq(selectedPorts.map(p => p.switchMac))
  const selectedSwitchList = switchList?.filter(s => switches.includes(s.id))
  const switchFirmwares = selectedSwitchList?.map(s => s.firmware).filter(Boolean) as string[]
  const isFirmwareAbove10010f = !!selectedSwitchList?.length
    && selectedSwitchList?.every(s => isFirmwareVersionAbove10010f(s.firmware))
  const isFirmwareAbove10020b = !!selectedSwitchList?.length
    && selectedSwitchList?.every(s => isFirmwareVersionAbove10020b(s.firmware))
  const isFirmwareAbove10010gOr10020b = !!selectedSwitchList?.length
    && selectedSwitchList?.every(s => isFirmwareVersionAbove10010gOr10020b(s.firmware))
  const isFirmwareAbove10010gCd1Or10020bCd1 = !!selectedSwitchList?.length
    && selectedSwitchList?.every(s => isFirmwareVersionAbove10010gCd1Or10020bCd1(s.firmware))
  const isAnyFirmwareAbove10020b = !!selectedSwitchList?.length
    && selectedSwitchList?.some(s => isFirmwareVersionAbove10020b(s.firmware))
  const isAnyFirmwareAbove10010f = !!selectedSwitchList?.length
    && selectedSwitchList?.some(s => isFirmwareVersionAbove10010f(s.firmware))
  const isAnyFirmwareAbove10010gCd1Or10020bCd1 = !!selectedSwitchList?.length
      && selectedSwitchList?.some(s => isFirmwareVersionAbove10010gCd1Or10020bCd1(s.firmware))

  const switchId = switches?.[0]
  const disablePortSpeed = handlePortSpeedFor765048F(selectedPorts)
  const hasBreakoutPort = selectedPorts.filter(p => p.portIdentifier.includes(':')).length > 0

  const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
  const [macAclsOptions, setMacAclsOptions] = useState([] as DefaultOptionType[])
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

  //Flex auth
  const [aggregatePortsData, setAggregatePortsData] = useState({} as AggregatePortSettings)
  const [isAppliedAuthProfile, setIsAppliedAuthProfile] = useState(false)

  const [venueVlans, setVenueVlans] = useState([] as Vlan[])
  const [venueTaggedVlans, setVenueTaggedVlans] = useState('' as string)
  const [venueUntaggedVlan, setVenueUntaggedVlan] = useState('' as string)
  const [venueVoiceVlan, setVenueVoiceVlan] = useState('' as string)
  const [isVoiceVlanInvalid, setIsVoiceVlanInvalid ] = useState(false)

  const [selectModalvisible, setSelectModalvisible] = useState(false)
  const [lldpModalvisible, setLldpModalvisible] = useState(false)
  const [drawerAclVisible, setDrawerAclVisible] = useState(false)
  const [drawerMACAclVisible, setDrawerMACAclVisible] = useState(false)
  const [cyclePoeEnable, setCyclePoeEnable] = useState(false)
  const [showErrorRecoveryTooltip, setShowErrorRecoveryTooltip] = useState(false)
  const [drawerPoeSchedule, setDrawerPoeSchedule] = useState(false)
  const portProfileOptions = useRef([] as DefaultOptionType[])

  const [getPortSetting] = useLazyGetPortSettingQuery()
  const [getPortsSetting] = useLazyGetPortsSettingQuery()
  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()
  const [getSwitchesVlan] = useLazyGetSwitchesVlanQuery()
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const [getSwitchConfigurationProfileByVenue] = useLazyGetSwitchConfigurationProfileByVenueQuery()
  const [getSwitchRoutedList] = useLazyGetSwitchRoutedListQuery()
  const [getVenueRoutedList] = useLazyGetVenueRoutedListQuery()
  const [getAclUnion] = useLazyGetAclUnionQuery()
  const [getPortProfileOptionsForSwitches] =
  useLazyPortProfileOptionsForMultiSwitchesQuery()
  const [savePortsSetting, { isLoading: isPortsSettingUpdating }] = useSavePortsSettingMutation()
  const [cyclePoe, { isLoading: isCyclePoeUpdating }] = useCyclePoeMutation()

  const commonRequiredProps = {
    isMultipleEdit, isCloudPort, hasMultipleValue, isFirmwareAbove10010f,
    form, aggregateData: aggregatePortsData, portVlansCheckbox, ipsgCheckbox, portSecurity
  }
  const authFormWatchValues = [
    authenticationType, dot1xPortControl, authDefaultVlan,
    authFailAction, authTimeoutAction
  ]

  const { data: switchDetail, isLoading: isSwitchDetailLoading }
    = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  const { data: switchData, isLoading: isSwitchDataLoading }
    = useGetSwitchQuery({
      params: { tenantId, switchId, venueId: switchDetail?.venueId },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !switchDetail?.venueId
    })

  // eslint-disable-next-line max-len
  const { data: switchesDefaultVlan, isLoading: isDefaultVlanLoading } = useGetDefaultVlanQuery({
    params: { tenantId, venueId: switchDetail?.venueId },
    payload: switches,
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !switchDetail?.venueId
  })

  const { data: macAclList } = useGetSwitchMacAclsQuery({
    params: { tenantId, switchId, venueId: switchDetail?.venueId },
    payload: { sortField: 'name', pageSize: 10000 },
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !isSwitchMacAclEnabled || !isFirmwareAbove10010gCd1Or10020bCd1 || !switchDetail?.venueId
  })

  const { data: macAclGlobalList } = useGetLayer2AclsQuery({
    params: { tenantId, switchId, venueId: switchDetail?.venueId },
    payload: { sortField: 'name', pageSize: 10000 },
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !isSwitchMacAclEnabled || !isFirmwareAbove10010gCd1Or10020bCd1 || !switchDetail?.venueId
  })

  const stickyMacAclsColumns: TableProps<{ macAddress: string }>['columns'] = [
    {
      key: 'macAddress',
      title: $t({ defaultMessage: 'Sticky MAC Allow List (Learned MAC Address)' }),
      dataIndex: 'macAddress'
    }
  ]

  const stickyMacAclsQuery = useTableQuery({
    useQuery: useGetSwitchStickyMacAclsQuery,
    defaultPayload: {
      portId: `${selectedPorts?.[0].switchSerial}/${selectedPorts?.[0].portIdentifier}`,
      fields: ['id']
    },
    enableRbac: isSwitchRbacEnabled,
    apiParams: { switchId, venueId: (switchDetail?.venueId || '') as string },
    sorter: { sortField: 'id', sortOrder: 'ASC' },
    option: { skip: !isSwitchMacAclEnabled || !portSecurity || !switchDetail?.venueId }
  })

  const switchDefaultVlanIds
    = switchesDefaultVlan?.map(v => v.defaultVlanId).toString()

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

  const getPortProfileSelectList = async (selectedSwitchList: SwitchRow[]) => {
    const portProfilePayload = selectedSwitchList?.map(item => item.id)
    const portProfileList = await getPortProfileOptionsForSwitches({
      params: { tenantId, venueId: switchDetail?.venueId },
      payload: portProfilePayload,
      enableRbac: isSwitchRbacEnabled
    }, true).unwrap()

    const groupedOptions = portProfileList?.reduce((acc, option) => {
      option?.availablePortProfiles?.forEach((item) => {
        if (!acc[item.portProfileName]) {
          acc[item.portProfileName] = []
        }
        acc[item.portProfileName].push({ switchId: option.switchId, ...item })
      })
      return acc
    }, {} as Record<string, PortProfilesBySwitchId[]>)

    return getPortProfileOptions(groupedOptions)
  }

  const getGroupPortProfileByName = (
    portsSetting: PortSettingModel[], portProfileOptions: DefaultOptionType[]) => {
    return portsSetting?.reduce((acc: { [key: string]: string[] }, item) => {
      if (item.switchPortProfileId !== undefined) {
        const portProfileName = portProfileOptions?.find(
          pitem => pitem.value?.toString().includes(item.switchPortProfileId ?? '')
        )?.label?.toString() || 'unknown'

        if (!acc[portProfileName]) {
          acc[portProfileName] = []
        }
        acc[portProfileName].push(item.id)
      } else {
        if (!acc['unknown']) {
          acc['unknown'] = []
        }
        acc['unknown'].push(item.id)
      }

      return acc
    }, {})
  }

  useEffect(() => {
    const setData = async () => {
      const aclUnion = await getAclUnion({
        params: { tenantId, switchId, venueId: switchDetail?.venueId },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()

      if(isSwitchPortProfileEnabled && isAnyFirmwareAbove10020b) {
        portProfileOptions.current = await getPortProfileSelectList(selectedSwitchList)
      }

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
      setMacAclsOptions(getMacAclOptions(macAclList?.data, macAclGlobalList?.data))
      setPoeClassOptions(getPoeClass(selectedPorts))
      setVlansOptions(getVlanOptions(switchVlans as SwitchVlanUnion, defaultVlan, voiceVlan))

      setHasSwitchProfile(!!switchProfile?.length)
      setSwitchConfigurationProfileId(switchProfile?.[0]?.id)
      setCliApplied(isCliApplied)
      setDisabledUseVenueSetting(await getUseVenueSettingDisabled(profileDefaultVlan))
      setShowErrorRecoveryTooltip(isSwitchErrorRecoveryEnabled &&
        ((selectedSwitchList && selectedSwitchList.length > 1) ||
        isFirmwareAbove10010gOr10020b))

      isMultipleEdit
        ? await getMultiplePortsValue(vlansByVenue, defaultVlan)
        : await getSinglePortValue(portSpeed, defaultVlan, vlansByVenue)

      setLoading(false)
    }

    const isDataReady = !isSwitchDetailLoading && !isSwitchDataLoading && !isDefaultVlanLoading
      && switchDetail?.venueId && (switches?.length === switchesDefaultVlan?.length)

    if (isDataReady) {
      resetFields()
      setData()
    } else if (selectedPorts) {
      setLoading(true)
      resetFields()
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps, max-len
  }, [selectedPorts, isSwitchDetailLoading, isSwitchDataLoading, isDefaultVlanLoading, switchDefaultVlanIds, visible, macAclList, macAclGlobalList])

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
    const portSetting = isSwitchRbacEnabled
      ? (portSettingArray as unknown as PortSettingModel[])?.[0]
      : portSettingArray

    const { tagged, untagged, voice } = getPortVenueVlans(vlansByVenue, selectedPorts?.[0])
    const aggregatedData = portSetting
      ? aggregatePortSettings([portSetting], switchesDefaultVlan)
      : {}

    setVenueTaggedVlans(tagged)
    setVenueUntaggedVlan(untagged)
    setVenueVoiceVlan(voice)

    setEditPortData(portSetting)
    setDisablePoeCapability(getPoeCapabilityDisabled([portSetting]))
    setDisableCyclePoeCapability(getPoeCapabilityDisabled([portSetting]))
    setUseVenueSettings(portSetting?.revert)
    setLldpQosList(portSetting?.lldpQos || [])
    setCyclePoeEnable(portSetting.poeEnable)
    setAggregatePortsData(aggregatedData as AggregatePortSettings)
    setIsAppliedAuthProfile(!!portSetting.authenticationProfileId)

    setInitPortVlans(getInitPortVlans( [portSetting], defaultVlan ))
    setPortEditStatus(
      checkPortEditStatus(form, portSetting, portSetting?.revert, tagged, untagged, voice)
    )

    form.setFieldsValue({
      ...portSetting,
      name: portSetting.name ?? '',
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
      ...(isSwitchFlexAuthEnabled ? getFlexAuthDefaultValue(portSetting) : {}),
      // eslint-disable-next-line max-len
      ...(isSwitchPortProfileEnabled ? { switchPortProfileId: portProfileOptions.current.find(item => item.value?.toString().includes(portSetting?.switchPortProfileId ?? ''))?.value }: '')
    })
    checkIsVoiceVlanInvalid(true, portSetting?.revert)
  }

  const getMultiplePortsValue = async (vlansByVenue: Vlan[], defaultVlan: string) => {
    const multiPortsSetting = await getMultiplePortsSetting()
    const portsSetting = (isSwitchRbacEnabled
      ? multiPortsSetting : multiPortsSetting?.response) as PortSettingModel[]

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

    const groupedByPortProfileName = isSwitchPortProfileEnabled ? getGroupPortProfileByName(
      portsSetting, portProfileOptions.current) : {}
    const differentPortProfileName = Object.keys(groupedByPortProfileName)?.length > 1 ||
      groupedByPortProfileName['unknown']?.length > 1

    const hasMultipleValue = _.uniq([
      // eslint-disable-next-line max-len
      ...(_.without(hasMultipleValueFields, isSwitchPortProfileEnabled && !differentPortProfileName ? 'switchPortProfileId' : '')),
      ...((!vlansValue.isTagEqual && ['taggedVlans']) || []),
      ...((!vlansValue.isUntagEqual && ['untaggedVlan']) || []),
      ...((!vlansValue.isVoiceVlanEqual && ['voiceVlan']) || [])
    ])
    const aggregatedData = portsSetting
      ? aggregatePortSettings(portsSetting, switchesDefaultVlan, hasMultipleValue)
      : {}

    setDisablePoeCapability(poeCapabilityDisabled)
    setDisableCyclePoeCapability(cyclePoeMultiPortsDisabled)
    setCyclePoeEnable(portsSetting?.filter(s => s?.poeEnable)?.length > 0)
    setAggregatePortsData(aggregatedData as AggregatePortSettings)

    setHasMultipleValue(hasMultipleValue)
    setInitPortVlans(vlansValue?.initPortVlans)
    setPortsProfileVlans(vlansValue?.portsProfileVlans as unknown as ProfileVlans)
    setDisableSaveButton(true)
    setLldpQosList(portSetting?.lldpQos ?? [])
    setPortEditStatus('')
    setIsAppliedAuthProfile(!hasMultipleValueFields?.includes('authenticationProfileId'))

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
      // eslint-disable-next-line max-len
      ...(isSwitchFlexAuthEnabled ? getFlexAuthDefaultValue(portSetting, hasMultipleValueFields) : {}),
      // eslint-disable-next-line max-len
      ...(isSwitchPortProfileEnabled && !differentPortProfileName ? { switchPortProfileId: portProfileOptions.current.find(p => p.value?.toString().includes(portsSetting[0]?.switchPortProfileId ?? '')) } : '')
    })
  }

  const getFieldTooltip = (field: string) => {
    const flexAuthEnabled = getFlexAuthEnabled(aggregatePortsData, isMultipleEdit,
      flexibleAuthenticationEnabled, flexibleAuthenticationEnabledCheckbox)
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
        return flexAuthEnabled
          ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLED_WHEN_FLEX_AUTH_ENABLED)
          : (disabledUseVenueSetting ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLE) : '')
      case 'ingressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'egressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'portSpeed': return hasBreakoutPort ? $t(EditPortMessages.PORT_SPEED_TOOLTIP) : ''
      case 'ipsg':
        return flexAuthEnabled
          ? $t(EditPortMessages.CANNOT_ENABLE_IPSG_WHEN_FLEX_AUTH_ENABLED) : ''
      case 'flexibleAuthenticationEnabled':
        const disableKey = getFlexAuthButtonStatus(commonRequiredProps)
        return disableKey ? $t(EditPortMessages[disableKey as keyof typeof EditPortMessages]) : ''
      case 'switchPortProfileId':
        if(isAnyFirmwareAbove10020b && getFieldDisabled('switchPortProfileId')) {
          if(isCloudPort) {
            return $t(EditPortMessages.CLOUD_PORT_CANNOT_ENABLE_SWITCH_PORT_PROFILE)
          } else {
            return isFirmwareAbove10020b ? '' : $t(EditPortMessages.SWITCH_PORT_PROFILE_NOT_ENABLED)
          }
        }
        return ''
      case 'portSecurity':
        return flexAuthEnabled
          ? $t(EditPortMessages.CANNOT_ENABLE_PORT_MAC_SECURITY_WHEN_FLEX_AUTH_ENABLED) : ''
      case 'switchMacAcl':
        return flexAuthEnabled
          ? $t(EditPortMessages.CANNOT_ENABLE_SWITCH_MAC_ACL_WHEN_FLEX_AUTH_ENABLED) : ''
      default: return ''
    }
  }

  const getFieldDisabled = (field: string) => {
    const authfieldValues = [
      authenticationType, dot1xPortControl, authDefaultVlan,
      authFailAction, authTimeoutAction
    ]
    const checkboxEnabled = form?.getFieldValue(`${field}Checkbox`)
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
        return getFlexAuthEnabled(aggregatePortsData, isMultipleEdit,
          flexibleAuthenticationEnabled, flexibleAuthenticationEnabledCheckbox)
        || disabledUseVenueSetting || switchData?.vlanCustomize
      case 'portSpeed':
        return (isMultipleEdit && !portSpeedCheckbox) || disablePortSpeed || hasBreakoutPort
      case 'ingressAcl': return (isMultipleEdit && !ingressAclCheckbox) || ipsg
      case 'cyclePoe': return disableCyclePoeCapability || !cyclePoeEnable
      case 'ipsg':
        return (isMultipleEdit && !checkboxEnabled)
        || getFlexAuthEnabled(aggregatePortsData, isMultipleEdit,
          flexibleAuthenticationEnabled, flexibleAuthenticationEnabledCheckbox)
      // Flex auth
      case 'flexibleAuthenticationEnabled':
        return (isMultipleEdit && !checkboxEnabled) || portSecurity
          || !!getFlexAuthButtonStatus(commonRequiredProps)
      case 'authenticationProfileId':
        return isMultipleEdit && !(checkboxEnabled && flexibleAuthenticationEnabledCheckbox)
      case 'renderAuthProfile':
        return !(isAppliedAuthProfile && authenticationProfileId &&
          (!isMultipleEdit || authenticationProfileIdCheckbox))
      case 'authenticationCustomize':
        return isMultipleEdit
          && !(flexibleAuthenticationEnabledCheckbox && flexibleAuthenticationEnabled)
      case 'authDefaultVlan':
        const switchAuthVlans
          = getUnionValuesByKey('switchLevelAuthDefaultVlan', aggregatePortsData)
        const isForceType
          = dot1xPortControl !== PortControl.AUTO && dot1xPortControl !== PortControl.NONE
        return (isMultipleEdit && !checkboxEnabled)
          || (isForceType && !!switchAuthVlans.length)
      case 'changeAuthOrder':
      case 'dot1xPortControl':
      case 'authFailAction':
      case 'restrictedVlan':
      case 'authTimeoutAction':
      case 'criticalVlan':
        return (isMultipleEdit && !checkboxEnabled)
          || getAuthFieldDisabled(field, authfieldValues)
      case 'switchPortProfileId':
        return (isMultipleEdit && !checkboxEnabled) || isCloudPort
      case 'portSecurity':
        return (isMultipleEdit && !checkboxEnabled) ||
        getFlexAuthEnabled(aggregatePortsData, isMultipleEdit,
          flexibleAuthenticationEnabled, flexibleAuthenticationEnabledCheckbox)
      case 'switchMacAcl':
        return (isMultipleEdit && !checkboxEnabled) ||
            getFlexAuthEnabled(aggregatePortsData, isMultipleEdit,
              flexibleAuthenticationEnabled, flexibleAuthenticationEnabledCheckbox)
      default:
        return isMultipleEdit && !checkboxEnabled
    }
  }

  const getOverrideDisabled = (field: string) => {
    const authfieldValues = [
      authenticationType, dot1xPortControl, authDefaultVlan,
      authFailAction, authTimeoutAction
    ]
    const isNotOverrideAuthEnabled
      // eslint-disable-next-line max-len
      = !form.getFieldValue('flexibleAuthenticationEnabledCheckbox') || !flexibleAuthenticationEnabledCheckbox

    switch (field) {
      case 'poeEnable': return disablePoeCapability
      case 'poeClass':
      case 'poePriority':
      case 'poeBudget':
        return disablePoeCapability || !poeEnable
      case 'voiceVlan': return vlansOptions?.length === 1
      case 'portSpeed': return !portSpeedOptions.length || disablePortSpeed || hasBreakoutPort
      case 'ipsg':
        return !isNotOverrideAuthEnabled && flexibleAuthenticationEnabled
      case 'flexibleAuthenticationEnabled':
        return !!getFlexAuthButtonStatus(commonRequiredProps)
      case 'authenticationProfileId':
      case 'authenticationType':
      case 'guestVlan':
        return isNotOverrideAuthEnabled
          || !(flexibleAuthenticationEnabledCheckbox && flexibleAuthenticationEnabled)
      case 'restrictedVlan':
        return isNotOverrideAuthEnabled
          || getAuthFieldDisabled(field, authfieldValues)
          || (hasMultipleValue?.includes('authFailAction') && authFailActionCheckbox)
      case 'criticalVlan':
        return isNotOverrideAuthEnabled
          || getAuthFieldDisabled(field, authfieldValues)
          || (hasMultipleValue?.includes('authTimeoutAction') && authTimeoutActionCheckbox)
      case 'authDefaultVlan':
        const unionPortControl = getUnionValuesByKey('dot1xPortControl', aggregatePortsData)
        const isAnyForceControl = isForceControlType(unionPortControl)
        return isNotOverrideAuthEnabled
          || getAuthFieldDisabled(field, authfieldValues)
          || (!dot1xPortControlCheckbox
            && hasMultipleValue.includes('dot1xPortControl') && isAnyForceControl
          )
      case 'changeAuthOrder':
      case 'dot1xPortControl':
      case 'authFailAction':
      case 'authTimeoutAction':
        return isNotOverrideAuthEnabled
          || getAuthFieldDisabled(field, authfieldValues)
      case 'switchPortProfileId':
        return !isFirmwareAbove10020b || isCloudPort
      case 'adminPtToPt':
        return !isFirmwareAbove10020b
      case 'portSecurity':
        return !isFirmwareAbove10010gCd1Or10020bCd1
      case 'switchMacAcl':
        return !isFirmwareAbove10010gCd1Or10020bCd1 || isCloudPort
      default: return false
    }
  }

  const getFieldTemplate = (props: {
    content: React.ReactNode,
    field: string,
    extraLabel?: boolean,
    tooltip?: React.ReactNode
  }) => {
    const { content, field, extraLabel, tooltip } = props
    const shouldControlHiddenFields = [
      'changeAuthOrder', 'restrictedVlan', 'criticalVlan'
    ]
    return <UI.FormItem
      hidden={shouldControlHiddenFields.includes(field)
        ? shouldHideAuthField(field, authFormWatchValues, isMultipleEdit) : false
      }
    >
      {isMultipleEdit && <Form.Item
        noStyle
        label={false}
        name={`${field}Checkbox`}
        valuePropName='checked'
        initialValue={false}
        children={<Checkbox
          data-testid={`${field}-override-checkbox`}
          disabled={getOverrideDisabled(field)}
        />}
      />}
      { extraLabel && <UI.ExtraLabel>{ $t(FIELD_LABEL[field]) }
        <UI.FieldTemplateTooltip>{tooltip}</UI.FieldTemplateTooltip></UI.ExtraLabel> }
      { content }
    </UI.FormItem>
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
      if (isSwitchFlexAuthEnabled) {
        if (overrideFields?.includes('flexibleAuthenticationEnabled')) {
          overrideFields.push('authenticationCustomize')
        }
        if (overrideFields?.includes('authenticationProfileId')) {
          const profile = getAppliedProfile(authProfiles, data.authenticationProfileId as string)
          const profileFields = Object.keys(profile ?? {})
          overrideFields.push(...profileFields)
        }
      }
      return isMultipleEdit
        ? allMultipleEditableFields.filter(f => !overrideFields.includes(f))
        : []
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
    const appliedAuthProfileData = isSwitchFlexAuthEnabled && authenticationProfileId
      ? getAppliedProfile(authProfiles, authenticationProfileId) : {}

    const values = {
      ...form.getFieldsValue(),
      ...appliedAuthProfileData,
      revert: useVenueSettings && !flexibleAuthenticationEnabled,
      ...(lldpQosList && { lldpQos: // remove fake lldp id
            lldpQosList?.map(lldp => ( lldp.id.includes('lldp') ? _.omit(lldp, ['id']) : lldp ))
      }),
      taggedVlans: useVenueSettings ? null :
        (form.getFieldValue('taggedVlans') ?
          form.getFieldValue('taggedVlans').split(',') : []),
      untaggedVlan: useVenueSettings ? '' : form.getFieldValue('untaggedVlan'),
      voiceVlan: useVenueSettings ? null : Number(form.getFieldValue('voiceVlan'))
    }

    const { transformedValues, ignoreFields } = transformData(values)
    const { untaggedVlan, voiceVlan } = transformedValues
    const defaultVlanMap = aggregatePortsData.defaultVlan as Record<string, number>

    try {
      const payload = switches.map((item) => {
        const ports = selectedPorts
          .filter(p => p.switchSerial === item)
          .map(p => p.portIdentifier)

        let switchPortProfileId = null
        if (isSwitchPortProfileEnabled){
          const portProfileValue = form.getFieldValue('switchPortProfileId')
          if (typeof portProfileValue === 'string' && portProfileValue !== '') {
            const selectedPortProfiles = JSON.parse(portProfileValue)
            switchPortProfileId = selectedPortProfiles.find(
              (p: { switchId: string }) => p.switchId === item)?.portProfileId
          }
        }

        return isSwitchRbacEnabled ? {
          ...transformedValues,
          switchId: item,
          port: ports?.[0],
          ports: ports,
          ...getDefaultVlanMapping('untaggedVlan', item, defaultVlanMap, untaggedVlan),
          ...getDefaultVlanMapping('voiceVlan', item, defaultVlanMap, voiceVlan),
          ...(isSwitchPortProfileEnabled && { switchPortProfileId }),
          ignoreFields: ignoreFields.toString()
        } : {
          switchId: item,
          port: {
            ...transformedValues,
            ...getDefaultVlanMapping('untaggedVlan', item, defaultVlanMap, untaggedVlan),
            ...getDefaultVlanMapping('voiceVlan', item, defaultVlanMap, voiceVlan),
            ignoreFields: ignoreFields.toString(),
            port: ports?.[0],
            ports: ports,
            ...(isSwitchPortProfileEnabled && { switchPortProfileId })
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
    setLoading(true)
    setLldpQosList([])
    setAggregatePortsData({} as AggregatePortSettings)
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
      const isOverridePortVlans
        = !!(changedField === 'portVlansCheckbox' ? changedValue : portVlansCheckbox)
      const isVlansInvalid
      = (!isMultipleEdit || isOverridePortVlans) && (!untaggedVlan && !taggedVlans)
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
      const handleVlanFields = ['untaggedVlan', 'taggedVlans', 'voiceVlan']
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
      } else if (changedField === 'ipsgCheckbox') {
        const ipsgValues = getUnionValuesByKey('ipsg', aggregatePortsData)
        const ipsgEnabled = ipsgValues?.length === 1 && ipsgValues[0]
        if (!changedValue && (hasMultipleValue.includes('ipsg') || ipsgEnabled)) {
          const resetFieldValues = {
            ...form.getFieldsValue(),
            flexibleAuthenticationEnabled: false,
            flexibleAuthenticationEnabledCheckbox: false,
            ...( ipsgEnabled ? { ipsg: true } : {})
          }
          form.setFieldsValue(resetFieldValues)
        }
      } else if (handleVlanFields.includes(changedField)) {
        const revert = changedValues?.revert ?? useVenueSettings
        const status = checkPortEditStatus(
          form, form.getFieldsValue(), revert,
          venueTaggedVlans, venueUntaggedVlan, venueVoiceVlan, changedValues?.status
        )
        setPortEditStatus(status)

        if (!revert) {
          updateVlanOptions()
          setHasMultipleValue(hasMultipleValue.filter(v =>
            (v !== 'taggedVlans' && v !== 'untaggedVlan' && v !== 'voiceVlan'))
          )
        }
        if (changedField === 'untaggedVlan') {
          const isFlexAuthButtonDisabled = !!getFlexAuthButtonStatus({
            ...commonRequiredProps,
            hasMultipleValue: hasMultipleValue.filter(v =>
              (v !== 'taggedVlans' && v !== 'untaggedVlan' && v !== 'voiceVlan'))
          })
          handlePortVlanChange({ isFlexAuthButtonDisabled, form })
        }
      } else if (isMultipleEdit) {
        const handleOverrideFields = [
          'flexibleAuthenticationEnabledCheckbox',
          'authenticationTypeCheckbox', 'dot1xPortControlCheckbox',
          'authFailActionCheckbox', 'authTimeoutActionCheckbox']

        if (changedField === 'portVlansCheckbox') {
          const isFlexAuthButtonDisabled = !!getFlexAuthButtonStatus({
            ...commonRequiredProps,
            portVlansCheckbox: changedValue as boolean
          })
          handlePortVlanChange({ isFlexAuthButtonDisabled, form })

        } else if (handleOverrideFields.includes(changedField)) {
          handleAuthOverrideFieldChange({
            ...commonRequiredProps,
            changedField, isOverridden: !!changedValue, selectedPorts
          })
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
    taggedVlansField?.split(',').indexOf(String(voiceVlanField)) === -1
    if (applyVenueSetting && voiceVlanField && !taggedVlansField) {
      isInvalid = false
    }
    setIsVoiceVlanInvalid(isInvalid)
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

  const handleApplyCloudPort = () => {
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'Modify Uplink Port?' }),
      content: $t(EditPortMessages.MODIFYING_UPLINK_PORT),
      okText: $t({ defaultMessage: 'Apply Changes' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: applyForm
    })
  }

  const handleApply = async () => {
    const shouldAlertAaa = aggregatePortsData?.shouldAlertAaaAndRadiusNotApply
    const flexAuthEnabled = form.getFieldValue('flexibleAuthenticationEnabled')
    form.validateFields().then(() => {
      if (isSwitchFlexAuthEnabled && shouldAlertAaa && flexAuthEnabled) {
        showActionModal({
          type: 'confirm',
          width: 450,
          title: $t({ defaultMessage: 'Modify Port?' }),
          content: $t(EditPortMessages.NEED_CONFIGURE_AAA_RADIUS_SETTINGS),
          okText: $t({ defaultMessage: 'Apply Changes' }),
          cancelText: $t({ defaultMessage: 'Cancel' }),
          onOk: applyForm
        })
        return
      }
      applyForm()
    }).catch((err) => {
      console.log(err) // eslint-disable-line no-console
    })
  }

  const onPortSecurityChange = (value: boolean) => {
    if(value && !hasMultipleValue.includes('portSecurityMaxEntries')) {
      form.setFieldValue('portSecurityMaxEntriesCheckbox', true)
    }
  }

  const onPortSecurityMaxEntriesChange = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    const value = Number(event.target.value)
    if (value && editPortData?.portSecurityMaxEntries &&
      value < editPortData.portSecurityMaxEntries) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Delete Sticky MAC Allow List?' }),
        content: $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'This value is lower than the previously set limit. The existing list of MACs will be deleted and re-learnt if you proceed. Are you sure you want to delete?'
        }),
        okText: $t({ defaultMessage: 'Delete' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onCancel: () => {
          form.setFieldsValue({ portSecurityMaxEntries: editPortData?.portSecurityMaxEntries })
        }
      })
    }
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
        onClick={isCloudPort ? handleApplyCloudPort : handleApply}>
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
        { // eslint-disable-next-line max-len
          isSwitchFlexAuthEnabled && (isFirmwareAbove10010f || (isAnyFirmwareAbove10010f && isMultipleEdit)) && <>
            { getFieldTemplate({
              field: 'flexibleAuthenticationEnabled',
              extraLabel: true,
              content: <Form.Item
                noStyle
                label={false}
                children={shouldRenderMultipleText({
                  field: 'flexibleAuthenticationEnabled', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Tooltip title={getFieldTooltip('flexibleAuthenticationEnabled')}>
                    <Space style={{
                      display: 'flex', flex: 'auto', justifyContent: 'space-between'
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
                      { flexibleAuthenticationEnabled && <>
                        <Form.Item
                          name='authenticationCustomize'
                          hidden
                          initialValue={false}
                          valuePropName='checked'
                          children={<Switch />}
                        />
                        <Button
                          type='link'
                          size='small'
                          disabled={getFieldDisabled('authenticationCustomize')}
                          onClick={() => handleClickCustomize({
                            ...commonRequiredProps,
                            selectedPorts,
                            authenticationCustomize,
                            authenticationProfileId,
                            authProfiles,
                            isProfileValid: !getFieldDisabled('renderAuthProfile')
                          })}
                        >{
                            authenticationCustomize
                              ? $t({ defaultMessage: 'Use Profile Settings' })
                              : $t({ defaultMessage: 'Customize' })
                          }</Button>
                      </>}
                    </Space>
                  </Tooltip>
                }
              />
            })}

            { flexibleAuthenticationEnabled && !authenticationCustomize &&
          <Space style={{ display: 'block', marginLeft: isMultipleEdit ? '24px' : '0' }}>
            { getFieldTemplate({
              field: 'authenticationProfileId',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authenticationProfileId'
                label={<>
                  {$t({ defaultMessage: 'Profile' })}
                  <Tooltip.Question
                    title={$t(EditPortMessages.GUIDE_TO_AUTHENTICATION)}
                  />
                </>}
                validateFirst
                // eslint-disable-next-line max-len
                rules={(!isMultipleEdit || (flexibleAuthenticationEnabledCheckbox && flexibleAuthenticationEnabled))
                  ? [
                    ...(isMultipleEdit
                    && hasMultipleValue.includes('authenticationProfileId')
                    && !authenticationProfileIdCheckbox ? [{
                        validator: () => {
                          return Promise.reject($t(FlexAuthMessages.CANNOT_APPLIED_DIFF_PROFILES))
                        }
                      }] : []),
                    { required: true, message: $t({ defaultMessage: 'Please select Profile' }) },
                    { validator: (_, value) => {
                      return validateApplyProfile(
                        value, authProfiles, selectedPorts, aggregatePortsData
                      ).then(() => {
                        setIsAppliedAuthProfile(true)
                        return Promise.resolve()
                      })
                        .catch(error => {
                          setIsAppliedAuthProfile(false)
                          return Promise.reject(error)
                        })
                    } }
                  ] : []}
                children={shouldRenderMultipleText({
                  field: 'authenticationProfileId', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Select
                    data-testid='auth-profile-select'
                    placeholder={$t({ defaultMessage: 'Select Profile...' })}
                    options={authProfiles.map(p => ({
                      label: p.profileName,
                      value: p.id
                    }))}
                    disabled={getFieldDisabled('authenticationProfileId')}
                  />}
              />
            })}
            { !getFieldDisabled('renderAuthProfile')
              && renderAuthProfile(getAppliedProfile(authProfiles, authenticationProfileId))
            }
          </Space>}

            { authenticationCustomize &&
          <Space style={{ display: 'block', marginLeft: isMultipleEdit ? '24px' : '0' }}>
            { getFieldTemplate({
              field: 'authenticationType',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authenticationType'
                label={$t(FIELD_LABEL.authenticationType)}
                initialValue={AuthenticationType._802_1X}
                children={shouldRenderMultipleText({
                  field: 'authenticationType', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Select
                    options={Object.values(AuthenticationType).map(authType => ({
                      label: $t(authenticationTypeLabel[authType]),
                      value: authType
                    }))}
                    disabled={getFieldDisabled('authenticationType')}
                    onChange={(value) => handleAuthFieldChange({
                      field: 'authenticationType', value, form, isMultipleEdit, hasMultipleValue
                    })}
                  />}
              />
            })}
            { getFieldTemplate({
              field: 'changeAuthOrder',
              extraLabel: true,
              content: <Form.Item
                noStyle
                label={false}
                children={
                  shouldRenderMultipleText({
                    field: 'changeAuthOrder', ...commonRequiredProps
                  }) ? <MultipleText />
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
              />
            })}
            { getFieldTemplate({
              field: 'dot1xPortControl',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='dot1xPortControl'
                label={$t(FIELD_LABEL.dot1xPortControl)}
                initialValue={PortControl.AUTO}
                children={shouldRenderMultipleText({
                  field: 'dot1xPortControl', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Select
                    options={Object.values(PortControl).map(controlType => ({
                      label: $t(portControlTypeLabel[controlType]),
                      value: controlType,
                      disabled: controlType !== PortControl.AUTO
                    }))}
                    disabled={getFieldDisabled('dot1xPortControl')}
                    onChange={(value) => handleAuthFieldChange({
                      ...commonRequiredProps, field: 'dot1xPortControl', value
                    })}
                  />}
              />
            })}
            { getFieldTemplate({
              field: 'authDefaultVlan',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authDefaultVlan'
                label={$t(FIELD_LABEL.authDefaultVlan)}
                initialValue=''
                validateFirst
                // eslint-disable-next-line max-len
                rules={(!isMultipleEdit || (flexibleAuthenticationEnabledCheckbox && flexibleAuthenticationEnabled))
                  ? [
                    ...(isMultipleEdit
                      && hasMultipleValue.includes('authDefaultVlan')
                      && !authDefaultVlanCheckbox ? [{
                        validator: () => {
                          // eslint-disable-next-line max-len
                          return Promise.reject($t(FlexAuthMessages.CANNOT_APPLIED_DIFF_AUTH_DEFAULT_VLAN))
                        }
                      }] : []),
                    { validator: () => {
                      const isDisabled = getFieldDisabled('authDefaultVlan')
                      const switchAuthDefaultVlans
                          = getUnionValuesByKey('switchLevelAuthDefaultVlan', aggregatePortsData)
                      const isAnyForceControl = isForceControlType([dot1xPortControl])
                      if (isDisabled && isAnyForceControl && switchAuthDefaultVlans?.length > 1) {
                        return Promise.reject($t(FlexAuthMessages.CANNOT_SET_FORCE_CONTROL_TYPE))
                      }
                      return Promise.resolve()
                    }
                    },
                    { required: true },
                    { validator: (_:unknown, value: string) =>
                      validateVlanExcludingReserved(value)
                    },
                    { validator: (_:unknown, value: string) =>
                      checkVlanDiffFromSwitchDefaultVlan(value, aggregatePortsData)
                    }] : []
                }
                children={shouldRenderMultipleText({
                  field: 'authDefaultVlan', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Input disabled={getFieldDisabled('authDefaultVlan')} maxLength={255} />
                }
              />
            })}
            { getFieldTemplate({
              field: 'authFailAction',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authFailAction'
                label={$t(FIELD_LABEL.authFailAction)}
                initialValue={AuthFailAction.BLOCK}
                children={shouldRenderMultipleText({
                  field: 'authFailAction', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Select
                    options={Object.values(AuthFailAction).map(failType => ({
                      label: $t(authFailActionTypeLabel[failType]),
                      value: failType
                    }))}
                    disabled={getFieldDisabled('authFailAction')}
                    onChange={(value) => handleAuthFieldChange({
                      ...commonRequiredProps, field: 'authFailAction', value
                    })}
                  />}
              />
            })}
            { getFieldTemplate({
              field: 'restrictedVlan',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='restrictedVlan'
                label={$t(FIELD_LABEL.restrictedVlan)}
                initialValue=''
                validateFirst
                rules={[
                  // eslint-disable-next-line max-len
                  ...(isOverrideFieldNotChecked({ field: 'restrictedVlan', ...commonRequiredProps }) ? [{
                    validator: async () => checkMultipleVlansDifferences({
                      ...commonRequiredProps,
                      field: 'restrictedVlan',
                      vlanType: $t({ defaultMessage: 'Restricted VLAN' }),
                      selectedPorts
                    })
                  }] : [
                    ...((isMultipleEdit
                      // eslint-disable-next-line max-len
                      ? (restrictedVlanCheckbox && (authFailAction === AuthFailAction.RESTRICTED_VLAN))
                      : authFailAction === AuthFailAction.RESTRICTED_VLAN)
                      ? [{
                        validator: (_:unknown, value: string) =>
                          validateVlanExcludingReserved(value)
                      },
                      { validator: (_:unknown, value: string) =>
                        checkVlanDiffFromSwitchDefaultVlan(value, aggregatePortsData)
                      },
                      { validator: (_:unknown, value: string) =>
                        checkVlanDiffFromSwitchAuthDefaultVlan(value, aggregatePortsData)
                      },
                      { validator: (_:unknown, value: string) =>
                        // eslint-disable-next-line max-len
                        (!authDefaultVlanCheckbox || isOverrideFieldNotChecked({ field: 'authDefaultVlan', ...commonRequiredProps }))
                          ? checkVlanDiffFromAuthDefaultVlan(value, aggregatePortsData)
                          : checkVlanDiffFromTargetVlan(
                            value, authDefaultVlan,
                            $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                              sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                              targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                            })
                          )
                      }] : []
                    )])
                ]}
                children={shouldRenderMultipleText({
                  field: 'restrictedVlan', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Input disabled={getFieldDisabled('restrictedVlan')} maxLength={255} />
                }
              />
            })}
            { getFieldTemplate({
              field: 'authTimeoutAction',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='authTimeoutAction'
                label={$t(FIELD_LABEL.authTimeoutAction)}
                initialValue={AuthTimeoutAction.NONE}
                children={shouldRenderMultipleText({
                  field: 'authTimeoutAction', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Select
                    options={Object.values(AuthTimeoutAction).map(timeoutType => ({
                      label: $t(authTimeoutActionTypeLabel[timeoutType]),
                      value: timeoutType
                    }))}
                    disabled={getFieldDisabled('authTimeoutAction')}
                    onChange={(value) => handleAuthFieldChange({
                      ...commonRequiredProps, field: 'authTimeoutAction', value
                    })}
                  />}
              />
            })}
            { getFieldTemplate({
              field: 'criticalVlan',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='criticalVlan'
                label={$t(FIELD_LABEL.criticalVlan)}
                initialValue=''
                validateFirst
                rules={[
                  // eslint-disable-next-line max-len
                  ...(isOverrideFieldNotChecked({ field: 'criticalVlan', ...commonRequiredProps }) ? [{
                    validator: async () => checkMultipleVlansDifferences({
                      ...commonRequiredProps,
                      field: 'criticalVlan',
                      vlanType: $t({ defaultMessage: 'Critical VLAN' }),
                      selectedPorts
                    })
                  }] : [
                    ...((isMultipleEdit
                      // eslint-disable-next-line max-len
                      ? (criticalVlanCheckbox && (authTimeoutAction === AuthTimeoutAction.CRITICAL_VLAN))
                      : authTimeoutAction === AuthTimeoutAction.CRITICAL_VLAN)
                      ? [{
                        validator: (_:unknown, value: string) =>
                          validateVlanExcludingReserved(value)
                      },
                      { validator: (_:unknown, value: string) =>
                        checkVlanDiffFromSwitchDefaultVlan(value, aggregatePortsData)
                      },
                      { validator: (_:unknown, value: string) =>
                        checkVlanDiffFromSwitchAuthDefaultVlan(value, aggregatePortsData)
                      },
                      { validator: (_:unknown, value: string) =>
                        // eslint-disable-next-line max-len
                        (!authDefaultVlanCheckbox || isOverrideFieldNotChecked({ field: 'authDefaultVlan', ...commonRequiredProps }))
                          ? checkVlanDiffFromAuthDefaultVlan(value, aggregatePortsData)
                          : checkVlanDiffFromTargetVlan(
                            value, authDefaultVlan,
                            $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                              sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                              targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                            })
                          )
                      }] : []
                    )])
                ]}
                children={shouldRenderMultipleText({
                  field: 'criticalVlan', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Input disabled={getFieldDisabled('criticalVlan')} maxLength={255} />
                }
              />
            })}
            { getFieldTemplate({
              field: 'guestVlan',
              content: <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='guestVlan'
                label={$t(FIELD_LABEL.guestVlan)}
                initialValue=''
                validateFirst
                rules={[
                  ...(isOverrideFieldNotChecked({ field: 'guestVlan', ...commonRequiredProps }) ? [{
                    validator: async () => checkMultipleVlansDifferences({
                      ...commonRequiredProps,
                      field: 'guestVlan',
                      vlanType: $t({ defaultMessage: 'Guest VLAN' }),
                      selectedPorts
                    })
                  }] : [{
                    validator: (_:unknown, value: string) => {
                      if (value) {
                        return validateVlanExcludingReserved(value)
                      }
                      return Promise.resolve()
                    }
                  }, {
                    validator: (_:unknown, value: string) =>
                      checkGuestVlanConsistency(value, selectedPorts, aggregatePortsData)
                  }, {
                    validator: (_:unknown, value: string) =>
                      checkVlanDiffFromSwitchDefaultVlan(value, aggregatePortsData)
                  }, {
                    validator: (_:unknown, value: string) =>
                      checkVlanDiffFromSwitchAuthDefaultVlan(value, aggregatePortsData)
                  }, {
                    validator: (_:unknown, value: string) =>
                    // eslint-disable-next-line max-len
                      (!authDefaultVlanCheckbox || isOverrideFieldNotChecked({ field: 'authDefaultVlan', ...commonRequiredProps }))
                        ? checkVlanDiffFromAuthDefaultVlan(value, aggregatePortsData)
                        : checkVlanDiffFromTargetVlan(
                          value, authDefaultVlan,
                          $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                            sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                            targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                          })
                        )
                  }])
                ]}
                children={shouldRenderMultipleText({
                  field: 'guestVlan', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Input disabled={getFieldDisabled('guestVlan')} maxLength={255} />
                }
              />
            })}
          </Space>}
            <UI.ContentDivider />
          </>
        }

        {/* Port Profile */}
        {isSwitchPortProfileEnabled && isAnyFirmwareAbove10020b &&
        <><div
          style={{ marginBottom: isMultipleEdit ? '0' : '30px' }}
          data-testid='portProfileContainer'>
          <Space style={{
            width: '510px', display: 'flex', justifyContent: 'space-between',
            marginBottom: isMultipleEdit ? '16px' : '4px'
          }}>
            <Subtitle level={3} style={{ margin: 0 }}>
              {$t({ defaultMessage: 'Port Profile' })}
            </Subtitle>
          </Space>
          {getFieldTemplate({
            field: 'switchPortProfileId',
            content: <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              label={$t(FIELD_LABEL.portProfile)}
              initialValue={''}
              children={shouldRenderMultipleText({
                field: 'switchPortProfileId', ...commonRequiredProps
              }) ? <MultipleText />
                : <Tooltip title={getFieldTooltip('switchPortProfileId')}>
                  <Form.Item
                    name='switchPortProfileId'
                    initialValue=''><Select
                      data-testid='portProfileSelectList'
                      options={portProfileOptions.current}
                      disabled={getFieldDisabled('switchPortProfileId')} /></Form.Item>
                </Tooltip>}
            />
          })
          }</div><UI.ContentDivider /></>
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
              label={$t(FIELD_LABEL.untaggedVlan)}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              style={{ width: '95%' }}
              name='untaggedVlan'
              children={shouldRenderMultipleText({
                field: 'untaggedVlan', ignoreCheckbox: true, ...commonRequiredProps
              }) ? <MultipleText data-testid='untagged-multi-text' />
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
                {$t(FIELD_LABEL.taggedVlans)}
                <Tooltip.Question
                  title={$t(EditPortMessages.TAGGED_VLAN_VOICE_TOOLTIP)}
                />
              </>}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              style={{ width: '95%', marginBottom: '0' }}
              name='taggedVlans'
              children={shouldRenderMultipleText({
                field: 'taggedVlans', ignoreCheckbox: true, ...commonRequiredProps
              }) ? <MultipleText data-testid='tagged-multi-text' />
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

        { getFieldTemplate({
          field: 'portEnable',
          extraLabel: true,
          content: <Form.Item
            noStyle
            label={false}
            children={
              shouldRenderMultipleText({
                field: 'portEnable', ...commonRequiredProps
              }) ? <MultipleText />
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
          />
        })}

        { getFieldTemplate({
          field: 'poeEnable',
          extraLabel: true,
          content: <Form.Item
            noStyle
            children={shouldRenderMultipleText({
              field: 'poeEnable', ...commonRequiredProps
            }) ? <MultipleText />
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
          />
        })}

        {isSwitchTimeBasedPoeEnabled &&
          <>
            <Form.Item
              label={$t({ defaultMessage: 'PoE Schedule' })}
              labelCol={{ span: 24 }}
              children={<Space style={{ fontSize: '12px' }}>
                <span>{poeScheduler?.type === SchedulerTypeEnum.NO_SCHEDULE ?
                  noDataDisplay : $t({ defaultMessage: 'Custom Schedule' })}</span>
                <Button
                  type='link'
                  data-testid='edit-poe-schedule'
                  onClick={() => { setDrawerPoeSchedule(true) }}  // eslint-disable-line
                >
                  {$t({ defaultMessage: 'Edit' })}
                </Button>
              </Space>
              }
            />
            <Form.Item name='poeScheduler' hidden/>
          </>
        }

        { getFieldTemplate({
          field: 'poeClass',
          content: <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='poeClass'
            label={$t(FIELD_LABEL.poeClass)}
            initialValue='UNSET'
            children={shouldRenderMultipleText({
              field: 'poeClass', ...commonRequiredProps
            }) ? <MultipleText />
              : <Select
                options={poeClassOptions.map(
                  p => ({ label: $t(p.label), value: p.value }))}
                disabled={getFieldDisabled('poeClass')}
              />}
          />
        })}

        { getFieldTemplate({
          field: 'poePriority',
          content: <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='poePriority'
            label={$t(FIELD_LABEL.poePriority)}
            initialValue={1}
            children={
              shouldRenderMultipleText({
                field: 'poePriority', ...commonRequiredProps
              }) ? <MultipleText />
                : <Select
                  options={poePriorityOptions}
                  disabled={getFieldDisabled('poePriority')}
                />}
          />
        })}

        { getFieldTemplate({
          field: 'poeBudget',
          content: <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='poeBudget'
              label={$t(FIELD_LABEL.poeBudget)}
              rules={[
                { validator: (_, value) => poeBudgetRegExp(value) }
              ]}
              initialValue=''
              children={
                shouldRenderMultipleText({
                  field: 'poeBudget', ...commonRequiredProps
                }) ? <MultipleText />
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
          </>
        })}

        <UI.ContentDivider />

        { getFieldTemplate({
          field: 'portProtected',
          extraLabel: true,
          content: <Form.Item
            noStyle
            label={false}
            name='portProtected'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText({
              field: 'portProtected', ...commonRequiredProps
            }) ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('portProtected')}
                className={getToggleClassName('portProtected', isMultipleEdit, hasMultipleValue)}
              />}
          />
        })}

        { getFieldTemplate({
          field: 'lldpEnable',
          extraLabel: true,
          content: <Form.Item
            noStyle
            label={false}
            name='lldpEnable'
            valuePropName='checked'
            initialValue={true}
            children={shouldRenderMultipleText({
              field: 'lldpEnable', ...commonRequiredProps
            }) ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('lldpEnable')}
                className={getToggleClassName('lldpEnable', isMultipleEdit, hasMultipleValue)}
              />}
          />
        })}

        { getFieldTemplate({
          field: 'portSpeed',
          content: <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            label={$t(FIELD_LABEL.portSpeed)}
            children={shouldRenderMultipleText({
              field: 'portSpeed', ...commonRequiredProps
            }) ? <MultipleText />
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
          />
        })}

        { getFieldTemplate({
          field: 'rstpAdminEdgePort',
          extraLabel: true,
          content: <Form.Item
            noStyle
            name='rstpAdminEdgePort'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText({
              field: 'rstpAdminEdgePort', ...commonRequiredProps
            }) ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('rstpAdminEdgePort')}
                className={
                  getToggleClassName('rstpAdminEdgePort', isMultipleEdit, hasMultipleValue)
                }/>}
          />
        })}

        {isSwitchRstpPtToPtMacEnabled && isAnyFirmwareAbove10020b && <>
          { getFieldTemplate({
            field: 'adminPtToPt',
            content: <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              label={$t(FIELD_LABEL.ptToPtMac)}
              children={shouldRenderMultipleText({
                field: 'adminPtToPt', ...commonRequiredProps
              }) ? <MultipleText />
                : <Form.Item
                  name='adminPtToPt'
                  initialValue='AUTO'>
                  <Select
                    options={Object.keys(ptToPtMacActionMessages).map((key) => {
                      // eslint-disable-next-line max-len
                      const label = ptToPtMacActionMessages[key as keyof typeof ptToPtMacActionMessages]
                      return {
                        value: key,
                        label: $t(label)
                      }
                    })}
                    disabled={getFieldDisabled('adminPtToPt')}
                  /></Form.Item>}
            />
          })}</>
        }

        { getFieldTemplate({
          field: 'stpBpduGuard',
          extraLabel: true,
          tooltip: showErrorRecoveryTooltip &&
            <Tooltip.Question title={$t(EditPortMessages.STP_BPDU_GUARD)}/>,
          content: <Form.Item
            noStyle
            label={false}
            name='stpBpduGuard'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText({
              field: 'stpBpduGuard', ...commonRequiredProps
            }) ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('stpBpduGuard')}
                className={getToggleClassName('stpBpduGuard', isMultipleEdit, hasMultipleValue)}
              />}
          />
        })}

        { getFieldTemplate({
          field: 'stpRootGuard',
          extraLabel: true,
          content: <Form.Item
            noStyle
            label={false}
            name='stpRootGuard'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText({
              field: 'stpRootGuard', ...commonRequiredProps
            }) ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('stpRootGuard')}
                className={getToggleClassName('stpRootGuard', isMultipleEdit, hasMultipleValue)}
              />
            }
          />
        })}

        <UI.ContentDivider />

        { getFieldTemplate({
          field: 'dhcpSnoopingTrust',
          extraLabel: true,
          content: <Form.Item
            noStyle
            label={false}
            name='dhcpSnoopingTrust'
            valuePropName='checked'
            initialValue={false}
            children={shouldRenderMultipleText({
              field: 'dhcpSnoopingTrust', ...commonRequiredProps
            }) ? <MultipleText />
              : <Switch
                disabled={getFieldDisabled('dhcpSnoopingTrust')}
                className={
                  getToggleClassName('dhcpSnoopingTrust', isMultipleEdit, hasMultipleValue)
                }
              />
            }
          />
        })}

        { getFieldTemplate({
          field: 'ipsg',
          extraLabel: true,
          content: <Form.Item
            noStyle
            children={shouldRenderMultipleText({
              field: 'ipsg', ...commonRequiredProps
            }) ? <MultipleText />
              : <Tooltip title={getFieldTooltip('ipsg')}>
                <Space>
                  <Form.Item
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
                  </Form.Item>
                </Space>
              </Tooltip>
            }
          />
        })}

        { getFieldTemplate({
          field: 'lldpQos',
          extraLabel: true,
          content: <Form.Item
            noStyle
            name='lldpQos'
            initialValue={false}
            children={shouldRenderMultipleText({
              field: 'lldpQos', ...commonRequiredProps
            }) ? <MultipleText />
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
        })}

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

        { isSwitchMacAclEnabled && isAnyFirmwareAbove10010gCd1Or10020bCd1 && getFieldTemplate({
          field: 'portSecurity',
          extraLabel: true,
          content: <Form.Item
            noStyle
            children={<Tooltip title={getFieldTooltip('portSecurity')}>
              <Space>
                <Form.Item
                  noStyle
                  name='portSecurity'
                  valuePropName='checked'
                  initialValue={false}
                  validateFirst
                >
                  <Switch
                    data-testid='port-security-checkbox'
                    disabled={getFieldDisabled('portSecurity')}
                    className={getToggleClassName('portSecurity',
                      isMultipleEdit, hasMultipleValue)}
                    onChange={onPortSecurityChange}
                  />
                </Form.Item>
              </Space>
            </Tooltip>
            }
          />
        })}

        { isSwitchMacAclEnabled && isAnyFirmwareAbove10010gCd1Or10020bCd1 &&
          portSecurity && <div style={isMultipleEdit ? { marginLeft: '25px' } : {}}>
          {getFieldTemplate({
            field: 'portSecurityMaxEntries',
            content: <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='portSecurityMaxEntries'
              label={$t(FIELD_LABEL.portSecurityMaxEntries)}
              initialValue={1}
              rules={[
                {
                  type: 'number',
                  min: 1,
                  max: 8256
                }
              ]}
              validateFirst
              children={
                shouldRenderMultipleText({
                  field: 'portSecurityMaxEntries', ...commonRequiredProps
                }) ? <MultipleText />
                  : <InputNumber
                    min={1}
                    max={8256}
                    data-testid='port-security-max-entries-input'
                    style={{ width: '100%' }}
                    onBlur={onPortSecurityMaxEntriesChange}
                  />}
            />
          })}</div>
        }

        { isSwitchMacAclEnabled && isAnyFirmwareAbove10010gCd1Or10020bCd1 &&
          portSecurity && !isMultipleEdit && <Table
          rowKey='id'
          sortDirections={['ascend', 'descend', 'ascend']}
          columns={stickyMacAclsColumns}
          onChange={(pagination, filters, sorter, extra) => {
            if (extra.action === 'paginate') {
              const currentSorter = {
                ...Array.isArray(sorter) ? sorter[0] : sorter,
                field: stickyMacAclsQuery.sorter.sortField || 'id'
              }
              stickyMacAclsQuery.handleTableChange?.(pagination, filters, currentSorter, extra)
            } else {
              stickyMacAclsQuery.handleTableChange?.(pagination, filters, sorter, extra)
            }
          }}
          pagination={stickyMacAclsQuery.pagination}
          dataSource={stickyMacAclsQuery.data?.data}
          style={{ marginBottom: '30px' }}
        />
        }

        <ACLSettingDrawer
          visible={drawerAclVisible}
          setVisible={setDrawerAclVisible}
          aclsOptions={aclsOptions}
          setAclsOptions={setAclsOptions}
          profileId={switchConfigurationProfileId}
        />
        { getFieldTemplate({
          field: 'ingressAcl',
          content: <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='ingressAcl'
              label={$t(FIELD_LABEL.ingressAcl)}
              initialValue=''
              children={shouldRenderMultipleText({
                field: 'ingressAcl', ...commonRequiredProps
              }) ? <MultipleText />
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
          </>
        })}

        { getFieldTemplate({
          field: 'egressAcl',
          content: <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='egressAcl'
              label={$t(FIELD_LABEL.egressAcl)}
              initialValue=''
              children={shouldRenderMultipleText({
                field: 'egressAcl', ...commonRequiredProps
              }) ? <MultipleText />
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
          </>
        })}

        { isSwitchMacAclEnabled && isAnyFirmwareAbove10010gCd1Or10020bCd1 &&
        <MacACLDrawer
          visible={drawerMACAclVisible}
          setVisible={setDrawerMACAclVisible}
          editMode={false}
          venueId={switchDetail?.venueId || ''}
          switchIds={selectedSwitchList?.map(p => p.id)}
        />
        }
        { isSwitchMacAclEnabled && isAnyFirmwareAbove10010gCd1Or10020bCd1 && getFieldTemplate({
          field: 'switchMacAcl',
          content: <Form.Item
            noStyle
            children={<><Tooltip title={getFieldTooltip('switchMacAcl')}>
              <Form.Item
                {...getFormItemLayout(isMultipleEdit)}
                name='switchMacAcl'
                label={$t(FIELD_LABEL.switchMacAcl)}
                initialValue=''
                children={shouldRenderMultipleText({
                  field: 'switchMacAcl', ...commonRequiredProps
                }) ? <MultipleText />
                  : <Select
                    data-testid='switchMacAclSelectList'
                    options={macAclsOptions}
                    disabled={getFieldDisabled('switchMacAcl')}
                  />
                }
              />
            </Tooltip>
            {((isMultipleEdit && switchMacAclCheckbox) || !isMultipleEdit) && hasCreatePermission &&
              <Space style={{ marginLeft: '8px' }}>
                <Button type='link'
                  key='add-mac-acl'
                  size='small'
                  disabled={(isMultipleEdit && !switchMacAclCheckbox) ||
                    getFieldDisabled('switchMacAcl')}
                  onClick={() => { setDrawerMACAclVisible(true) }}
                >{$t({ defaultMessage: 'Add MAC ACL' })}
                </Button>
              </Space>}</>
            }
          />
        })}

        {getFieldTemplate({
          field: 'tags',
          content: <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='tags'
            label={$t(FIELD_LABEL.tags)}
            initialValue=''
            children={shouldRenderMultipleText({
              field: 'tags', ...commonRequiredProps
            }) ? <MultipleText />
              : <Input disabled={getFieldDisabled('tags')} maxLength={255} />
            }
          />
        })}

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
        authDefaultVlan={getCurrentAuthDefaultVlan({
          flexibleAuthenticationEnabled, flexibleAuthenticationEnabledCheckbox,
          isAppliedAuthProfile, authenticationProfileId, authProfiles,
          aggregatePortsData, authDefaultVlan, isMultipleEdit
        })}
        flexAuthEnabled={getFlexAuthEnabled(
          aggregatePortsData, isMultipleEdit,
          flexibleAuthenticationEnabled,
          flexibleAuthenticationEnabledCheckbox
        )}
        defaultTabKey={getFlexAuthEnabled(
          aggregatePortsData, isMultipleEdit,
          flexibleAuthenticationEnabled,
          flexibleAuthenticationEnabledCheckbox
        ) ? VlanModalType.TAGGED : undefined}
        updateSwitchVlans={async (values: Vlan) =>
          updateSwitchVlans(
            values,
            switchVlans,
            setSwitchVlans,
            venueVlans,
            setVenueVlans,
            isSwitchLevelVlanEnabled
          )
        }
        switchFirmwares={switchFirmwares}
      />}

      {lldpModalvisible && <EditLldpModal
        isEditMode={false}
        setLldpModalvisible={setLldpModalvisible}
        lldpModalvisible={lldpModalvisible}
        lldpQosList={lldpQosList}
        setLldpQosList={setLldpQosList}
        vlansOptions={vlansOptions}
      />}

      { drawerPoeSchedule &&
        <PoeSchedule
          form={form}
          visible={drawerPoeSchedule}
          setVisible={setDrawerPoeSchedule}
          venueId={switchDetail?.venueId}
        />
      }
      {/* { // TODO: enhance ^_^?
        addProfileDrawerVisible && <Drawer
        title={$t({ defaultMessage: 'Add Profile' })}
        visible={addDrawerVisible}
        onClose={() => setAddProfileDrawerVisible(false)}
        width={580}
        children={<>
        </>
        }
      />
      } */}

    </Loader>}
    width={'590px'}
  />
}
