import { useEffect, useState } from 'react'

import { Checkbox, Col, Form, Input, Row, Select, Space, Switch } from 'antd'
import { DefaultOptionType }                                      from 'antd/lib/select'
import _                                                          from 'lodash'

import {
  Alert,
  Button,
  Drawer,
  showActionModal,
  Subtitle,
  Tooltip,
  Loader
} from '@acx-ui/components'
import {
  switchApi,
  useLazyGetAclUnionQuery,
  useGetDefaultVlanQuery,
  useLazyGetPortSettingQuery,
  useLazyGetPortsSettingQuery,
  useLazyGetSwitchVlanQuery,
  useLazyGetSwitchVlansQuery,
  useLazyGetSwitchesVlanQuery,
  useLazyGetSwitchConfigurationProfileByVenueQuery,
  useLazyGetSwitchRoutedListQuery,
  useLazyGetVlansByVenueQuery,
  useLazyGetVenueRoutedListQuery,
  useSwitchDetailHeaderQuery,
  useSavePortsSettingMutation
} from '@acx-ui/rc/services'
import {
  EditPortMessages,
  LldpQosModel,
  MultipleEditPortMessages,
  poeBudgetRegExp,
  PORT_SPEED,
  SwitchPortViewModel,
  SwitchVlanUnion,
  PortSettingModel,
  Vlan
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { store }     from '@acx-ui/store'
import { getIntl }   from '@acx-ui/utils'

import { ACLSettingDrawer } from './ACLSettingDrawer'
import { EditLldpModal }    from './editLldpModal'
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
  getPortVenueVlans
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
  'lldpQos', 'tags', 'untaggedVlan', 'poeBudget', 'portProtected'
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
    tagsCheckbox,
    profileName
  } = (useWatch([], form) ?? {})

  const { tenantId, venueId, serialNumber } = useParams()
  const [loading, setLoading] = useState<boolean>(true)

  const defaultVlanName = 'DEFAULT-VLAN'
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
  const [disableSaveButton, setDisableSaveButton] = useState(false)

  const [venueVlans, setVenueVlans] = useState([] as Vlan[])
  const [venueTaggedVlans, setVenueTaggedVlans] = useState('' as string)
  const [venueUntaggedVlan, setVenueUntaggedVlan] = useState('' as string)
  const [venueVoiceVlan, setVenueVoiceVlan] = useState('' as string)
  const [isVoiceVlanInvalid, setIsVoiceVlanInvalid ] = useState(false)

  const [selectModalvisible, setSelectModalvisible] = useState(false)
  const [lldpModalvisible, setLldpModalvisible] = useState(false)

  const [ drawerAclVisible, setDrawerAclVisible ] = useState(false)

  const [getPortSetting] = useLazyGetPortSettingQuery()
  const [getPortsSetting] = useLazyGetPortsSettingQuery()
  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()
  const [getSwitchVlans] = useLazyGetSwitchVlansQuery()
  const [getSwitchesVlan] = useLazyGetSwitchesVlanQuery()
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const [getSwitchConfigurationProfileByVenue] = useLazyGetSwitchConfigurationProfileByVenueQuery()
  const [getSwitchRoutedList] = useLazyGetSwitchRoutedListQuery()
  const [getVenueRoutedList] = useLazyGetVenueRoutedListQuery()
  const [getAclUnion] = useLazyGetAclUnionQuery()
  const [savePortsSetting, { isLoading: isPortsSettingUpdating }] = useSavePortsSettingMutation()

  const { data: switchDetail }
    = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  const { data: switchesDefaultVlan }
    = useGetDefaultVlanQuery({ params: { tenantId }, payload: switches })

  const getVlans = async () => {
    return switches.length > 1
      // eslint-disable-next-line max-len
      ? await getSwitchesVlan({ params: { tenantId, serialNumber }, payload: switches }, true).unwrap()
      : await getSwitchVlan({ params: { tenantId, switchId } }, true).unwrap()
  }

  const getMultiplePortsSetting = async () => {
    const portsSettingPayload = switches.map((switchId) => ({
      switchId: switchId,
      ports: selectedPorts
        .filter(p => p.switchSerial === switchId)
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
    const switchVlans = switches?.map(async (switchId) => {
      return await getSwitchVlans({
        params: { tenantId, switchId }
      }, true).unwrap()
    })
    return Promise.all(switchVlans)
  }

  const getUseVenueSettingDisabled = async (profileDefaultVlan: Number) => {
    const switchVlans = (await getEachSwitchVlans())?.flat()

    return switchVlans?.filter((v) =>
      v?.vlanName !== defaultVlanName && v?.vlanId === Number(profileDefaultVlan)
    )?.length > 0
  }

  useEffect(() => {
    const setData = async () => {
      const aclUnion = await getAclUnion({ params: { tenantId, switchId } }, true).unwrap()
      const vid = isVenueLevel ? venueId : switchDetail?.venueId
      const switchVlans = await getVlans()
      const vlansByVenue = await getVlansByVenue({
        params: { tenantId, venueId: vid }
      }, true).unwrap()

      const switchProfile = await getSwitchConfigurationProfileByVenue({
        params: { tenantId, venueId: vid }
      }, true).unwrap()

      const veRouted = await getVeRouted(isVenueLevel, vid)
      const vlanUsedByVe = veRouted?.filter(v => v?.portNumber)
        ?.[0]?.portNumber?.split('-')?.[2] || ''

      const portSpeed = getPortSpeed(selectedPorts)
      const defaultVlans = switchesDefaultVlan
        ? _.uniq(Object.values(switchesDefaultVlan)?.map(v => v?.defaultVlanId.toString()))
        : []
      const defaultVlan = defaultVlans?.length > 1 ? '' : defaultVlans?.[0]
      const profileDefaultVlan = switchProfile?.[0]?.vlans
        ?.find((item) => item?.vlanName === 'DEFAULT-VLAN')?.vlanId ?? 1
      setSwitchConfigurationProfileId(switchProfile?.[0]?.id)

      setDefaultVlan(defaultVlan)
      setProfileDefaultVlan(profileDefaultVlan)
      setSwitchVlans(switchVlans)
      setVenueVlans(vlansByVenue)
      setVlanUsedByVe(vlanUsedByVe)

      setAclsOptions(getAclOptions(aclUnion))
      setPortSpeedOptions(portSpeed)
      setPoeClassOptions(getPoeClass(selectedPorts))
      setVlansOptions(getVlanOptions(switchVlans, defaultVlan, voiceVlan))

      setHasSwitchProfile(!!switchProfile?.length)
      setDisabledUseVenueSetting(await getUseVenueSettingDisabled(profileDefaultVlan))

      isMultipleEdit
        ? await getMultiplePortsValue(vlansByVenue, defaultVlan)
        : await getSinglePortValue(portSpeed, defaultVlan, vlansByVenue)

      setLoading(false)
    }

    if (switchesDefaultVlan && switchDetail) {
      resetFields()
      setData()
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPorts, switchDetail, switchesDefaultVlan, visible])

  const getSinglePortValue = async (portSpeed: string[], defaultVlan: string,
    vlansByVenue: Vlan[]) => {
    const portSetting = await getPortSetting({
      params: { tenantId, switchId, portIdentifier: selectedPorts?.[0]?.portIdentifier },
      payload: [selectedPorts?.[0]?.portIdentifier]
    }, true).unwrap()

    const { tagged, untagged, voice } = getPortVenueVlans(vlansByVenue, selectedPorts?.[0])
    setVenueTaggedVlans(tagged)
    setVenueUntaggedVlan(untagged)
    setVenueVoiceVlan(voice)

    setEditPortData(portSetting)
    setDisablePoeCapability(getPoeCapabilityDisabled([portSetting]))
    setUseVenueSettings(portSetting.revert)
    setLldpQosList(portSetting.lldpQos || [])

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
        : (portSetting?.voiceVlan === 0 ? '' : portSetting?.voiceVlan))
    })
    checkIsVoiceVlanInvalid()
  }

  const getMultiplePortsValue = async (vlansByVenue: Vlan[], defaultVlan: string) => {
    const portsSetting = await getMultiplePortsSetting()
    const vlansValue = getMultipleVlanValue(
      selectedPorts, vlansByVenue, portsSetting, defaultVlan, switchesDefaultVlan
    )
    const poeCapabilityDisabled = getPoeCapabilityDisabled(portsSetting?.response)
    const hasMultipleValueFields = allMultipleEditableFields?.filter(field => {
      const isEqual = field === 'lldpQos'
        ? checkLldpListEqual(portsSetting?.response?.map(s => s[field]))
        : _.uniq(portsSetting?.response?.map(s =>
          s[field as keyof PortSettingModel]?.toString())
        )?.length === 1

      return !isEqual && field
    })

    const hasEqualValueFields = _.xor(allMultipleEditableFields, hasMultipleValueFields)
    const portSetting = _.pick(portsSetting?.response?.[0], [...hasEqualValueFields, 'profileName'])

    setDisablePoeCapability(poeCapabilityDisabled)
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
        (portSetting?.taggedVlans ? portSetting.untaggedVlan : defaultVlan))
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
        return disabledUseVenueSetting ? $t(EditPortMessages.USE_VENUE_SETTINGS_DISABLE) : ''
      case 'ingressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'egressAcl': return !hasSwitchProfile ? $t(EditPortMessages.ADD_ACL_DISABLE) : ''
      case 'portSpeed': return hasBreakoutPort ? $t(EditPortMessages.PORT_SPEED_TOOLTIP) : ''
      default: return ''
    }
  }

  const getFieldDisabled = (field: string) => {
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
      case 'useVenuesettings': return disabledUseVenueSetting || switchDetail?.vlanCustomize
      case 'portSpeed':
        return (isMultipleEdit && !portSpeedCheckbox) || disablePortSpeed || hasBreakoutPort
      case 'ingressAcl': return (isMultipleEdit && !ingressAclCheckbox) || ipsg
      default:
        const checkboxEnabled = form.getFieldValue(`${field}Checkbox`)
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
        children={<Checkbox disabled={getOverrideDisabled(field)} />}
      />}
      { extraLabel && <UI.ExtraLabel>{ labelName }</UI.ExtraLabel> }
      { content }
    </UI.FormItem>
  }

  const transformData = (data: PortSettingModel) => {
    const hasBreakoutPortAndVenueSettings = hasBreakoutPort && useVenueSettings
    const vlansHasChanged = form?.isFieldTouched('taggedVlans') ||
      form?.isFieldTouched('untaggedVlan')
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

    if(data.voiceVlan === '') {
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
      voiceVlan: useVenueSettings ? null : form.getFieldValue('voiceVlan')
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

        return {
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
      await savePortsSetting({ params: { tenantId }, payload }).unwrap()
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

  const resetFields = async () => {
    const checkboxChecked = Object.entries(form.getFieldsValue())
      .filter(v => v?.[1] && v?.[0].includes('Checkbox')).map(v => v?.[0])
    const resetList = checkboxChecked.reduce((obj, c) => ({ ...obj, [c]: false }), {})
    form.setFieldsValue(resetList)

    setLoading(true)
    setLldpQosList([])
  }

  const onApplyVenueSettings = () => {
    setUseVenueSettings(true)

    let untagged, tagged, status = 'venue', voice
    const tagEqual = _.uniq(portsProfileVlans?.tagged).length === 1
    const untagEqual = _.uniq(portsProfileVlans?.untagged).length === 1
    const voiceEqual = _.uniq(portsProfileVlans?.voice).length === 1
    const equalFields = [
      ...((tagEqual && ['taggedVlans']) || []),
      ...((untagEqual && ['untaggedVlan']) || []),
      ...((voiceEqual && ['voiceVlan']) || [])
    ]
    if (portVlansCheckbox) {
      untagged = profileDefaultVlan
      tagged = ''
      voice = ''
      const tmpMultipleValue = _.uniq(
        [...hasMultipleValue, 'taggedVlans', 'untaggedVlan', 'voiceVlan']
      )
      setHasMultipleValue(_.xor(tmpMultipleValue, equalFields))
      if (tagEqual && untagEqual && voiceEqual) {
        if (!portsProfileVlans.untagged?.[0] && !portsProfileVlans.tagged?.[0]) {
          status = 'default'
        }
        untagged = portsProfileVlans.untagged?.[0] || profileDefaultVlan
        tagged = portsProfileVlans.tagged?.[0]?.toString()
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

  const checkIsVoiceVlanInvalid = () => {
    const voiceVlanField = form?.getFieldValue('voiceVlan')
    const taggedVlansField = form?.getFieldValue('taggedVlans')
    const isInvalid = voiceVlanField &&
    taggedVlansField.split(',').indexOf(String(voiceVlanField)) === -1
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
      isFetching: isPortsSettingUpdating
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
        <Row style={{ height: '80px' }}>
          <Col flex='auto'>
            <Form layout='vertical'>
              <Form.Item
                label={$t({ defaultMessage: 'Selected Port' })}
                children={<Space style={{ fontSize: '16px' }}>
                  {selectedPorts?.map(p => p.portIdentifier)?.join(', ')}
                </Space>
                }
              />
            </Form>
          </Col>
          { !isMultipleEdit && <Col flex='250px'>
            <UI.FormItem>
              <Form.Item name='name'
                label={$t({ defaultMessage: 'Port Name' })}
                rules={[
                  { max: 255 }
                ]}
                initialValue=''
                children={<Input />}
              />
            </UI.FormItem>
          </Col>}
        </Row>

        <UI.ContentDivider />

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
              children={<Checkbox />}
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
                            {$t({ defaultMessage: 'Use Venue settings' })}
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
                />
              </UI.PortStatus>
            }
            <Form.Item
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              style={{ width: '95%' }}
              name='untaggedVlan'
              children={isMultipleEdit && hasMultipleValue.includes('untaggedVlan')
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
              children={isMultipleEdit && hasMultipleValue.includes('taggedVlans')
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
                    <>
                      <span> {$t({ defaultMessage: 'Set as Voice VLAN:' })} </span>
                      {
                        voiceVlan
                          ? $t({ defaultMessage: 'Yes (VLAN-ID: {voiceVlan})' }, { voiceVlan })
                          : $t({ defaultMessage: 'No' })
                      }
                    </>
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
              isMultipleEdit && !portEnableCheckbox && hasMultipleValue.includes('portEnable')
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
            children={isMultipleEdit && !poeEnableCheckbox && hasMultipleValue.includes('poeEnable')
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
            children={isMultipleEdit && !poeClassCheckbox && hasMultipleValue.includes('poeClass')
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
              isMultipleEdit && !poePriorityCheckbox && hasMultipleValue.includes('poePriority')
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
                isMultipleEdit && !poeBudgetCheckbox && hasMultipleValue.includes('poeBudget')
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
            children={isMultipleEdit &&
              !portProtectedCheckbox && hasMultipleValue.includes('portProtected')
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
            children={isMultipleEdit &&
              !lldpEnableCheckbox && hasMultipleValue.includes('lldpEnable')
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
            children={isMultipleEdit && !portSpeedCheckbox && hasMultipleValue.includes('portSpeed')
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
            children={isMultipleEdit &&
              !rstpAdminEdgePortCheckbox && hasMultipleValue.includes('rstpAdminEdgePort')
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
            children={
              isMultipleEdit && !stpBpduGuardCheckbox && hasMultipleValue.includes('stpBpduGuard')
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
            children={
              isMultipleEdit && !stpRootGuardCheckbox && hasMultipleValue.includes('stpRootGuard')
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
            children={isMultipleEdit && !dhcpSnoopingTrustCheckbox
              && hasMultipleValue.includes('dhcpSnoopingTrust')
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
          />,
          'lldpQos', $t({ defaultMessage: 'LLDP QoS' }), true
        )}

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
          'ingressAcl', $t({ defaultMessage: 'Ingress ACL' })
        )}

        { getFieldTemplate(
          <>
            <Form.Item
              {...getFormItemLayout(isMultipleEdit)}
              name='egressAcl'
              label={$t({ defaultMessage: 'Egress ACL' })}
              initialValue=''
              children={
                isMultipleEdit && !egressAclCheckbox && hasMultipleValue.includes('egressAcl')
                  ? <MultipleText />
                  : <Select
                    options={aclsOptions}
                    disabled={getFieldDisabled('egressAcl')}
                  />
              }
            />
            {((isMultipleEdit && egressAclCheckbox) || !isMultipleEdit) &&
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
          'egressAcl', $t({ defaultMessage: 'Egress ACL' })
        )}

        {getFieldTemplate(
          <Form.Item
            {...getFormItemLayout(isMultipleEdit)}
            name='tags'
            label={$t({ defaultMessage: 'Tags' })}
            initialValue=''
            children={isMultipleEdit && !tagsCheckbox && hasMultipleValue.includes('tags')
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
        profileId={switchConfigurationProfileId}
        updateSwitchVlans={async (values: Vlan) =>
          updateSwitchVlans(values, switchVlans, setSwitchVlans, venueVlans, setVenueVlans)
        }
      />}

      {lldpModalvisible && <EditLldpModal
        isEditMode={false}
        setLldpModalvisible={setLldpModalvisible}
        lldpModalvisible={lldpModalvisible}
        lldpQosList={lldpQosList}
        setLldpQosList={setLldpQosList}
        vlansOptions={vlansOptions}
      />}

    </Loader>}
    width={'590px'}
  />
}
