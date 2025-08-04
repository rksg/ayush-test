import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Image, Row, Space, Switch, InputNumber } from 'antd'
import { cloneDeep }                                         from 'lodash'
import { FormChangeInfo }                                    from 'rc-field-form/lib/FormContext'
import { FormattedMessage, useIntl }                         from 'react-intl'

import {
  AnchorContext,
  Button,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tabs,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  LanPortPoeSettings,
  LanPortSettings,
  useIpsecProfileLimitedSelection,
  useSoftGreProfileLimitedSelection
} from '@acx-ui/rc/components'
import {
  useDeactivateSoftGreProfileOnAPMutation,
  useDeactivateIpsecOnAPLanPortMutation,
  useGetApLanPortsWithActivatedProfilesQuery,
  useGetDefaultApLanPortsQuery,
  useLazyGetDHCPProfileListViewModelQuery,
  useLazyGetVenueLanPortWithEthernetSettingsQuery,
  useLazyGetVenueLanPortsQuery,
  useUpdateApEthernetPortsMutation,
  useUpdateApLanPortsMutation,
  useDeactivateClientIsolationOnApMutation,
  useLazyGetVenueLanPortSettingsByModelQuery
} from '@acx-ui/rc/services'
import {
  ApLanPortTypeEnum,
  CapabilitiesApModel,
  EditPortMessages,
  LanPort,
  VenueLanPorts,
  WifiApSetting,
  isEqualLanPort,
  mergeLanPortSettings,
  Voter,
  SoftGreDuplicationChangeState,
  SoftGreDuplicationChangeDispatcher,
  IpsecOptionChangeState,
  EthernetPortProfileViewData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'

const useFetchIsVenueDhcpEnabled = () => {

  const [getDhcpList] = useLazyGetDHCPProfileListViewModelQuery()

  return async (venueId: string) => {
    let isDhcpEnabled: boolean = false

    const dhcpList = await getDhcpList({
      payload: {
        fields: ['id', 'venueIds'],
        filters: { venueIds: [venueId] }
      },
      enableRbac: true
    }).unwrap()

    isDhcpEnabled = !!dhcpList?.data[0]

    return isDhcpEnabled
  }
}

export function LanPorts (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props
  const navigate = useNavigate()
  const isEthernetClientIsolationEnabled =
    useIsSplitOn(Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)
  const isApPoeModeEnabled = useIsSplitOn(Features.WIFI_AP_POE_OPERATING_MODE_SETTING_TOGGLE)


  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const {
    apData: apDetails,
    apCapabilities: apCaps,
    venueData } = useContext(ApDataContext)
  const venueId = venueData?.id
  const { setReadyToScroll } = useContext(AnchorContext)

  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isSoftGREOnEthernetEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isGlobalAccessVlanUntaggedIdEnabled =
    useIsSplitOn(Features.ACX_UI_GLOBAL_ACCESS_PORT_VLAN_UNTAGGED_ID_TOGGLE)

  const formRef = useRef<StepsFormLegacyInstance<WifiApSetting>>()
  const { data: apLanPortsData, isLoading: isApLanPortsLoading } =
  useGetApLanPortsWithActivatedProfilesQuery({
    params: { tenantId, serialNumber, venueId },
    enableRbac: true,
    enableEthernetProfile: isEthernetPortProfileEnabled,
    enableSoftGreOnEthernet: isSoftGREOnEthernetEnabled,
    enableIpsecOverNetwork: isIpSecOverNetworkEnabled,
    enableClientIsolationOnEthernet: isEthernetClientIsolationEnabled
  })
  const { data: defaultLanPorts, isLoading: isDefaultPortsLoading } = useGetDefaultApLanPortsQuery({
    params: { venueId, serialNumber }
  })

  const [getVenueLanPortsWithEthernet] = useLazyGetVenueLanPortWithEthernetSettingsQuery()
  const [getVenueLanPorts] = useLazyGetVenueLanPortsQuery()
  const getDhcpEnabled = useFetchIsVenueDhcpEnabled()

  const [getVenueLanPortSettingsByModel] = useLazyGetVenueLanPortSettingsByModelQuery()

  const [updateApCustomization, {
    isLoading: isApLanPortsUpdating }] = useUpdateApLanPortsMutation()
  const [updateEthernetPortProfile, {
    isLoading: isEthernetPortProfileUpdating }] = useUpdateApEthernetPortsMutation()
  const [deactivateSoftGreProfileSettings, {
    isLoading: isSoftGreProfileDeactivting }] = useDeactivateSoftGreProfileOnAPMutation()
  const [deactivateIpSecProfileSettings, {
    isLoading: isIpSecProfileDeactivting }] = useDeactivateIpsecOnAPLanPortMutation()
  const [deactivateClientIsolationOnAp, {
    isLoading: isDeactivateClientIsolationOnAp
  }] = useDeactivateClientIsolationOnApMutation()

  const [apLanPorts, setApLanPorts] = useState({} as WifiApSetting)
  const [venueLanPorts, setVenueLanPorts] = useState({})
  const [selectedModel, setSelectedModel] = useState({} as WifiApSetting)
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as CapabilitiesApModel)
  const [selectedPortCaps, setSelectedPortCaps] = useState({} as LanPort)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [isDhcpEnabled, setIsDhcpEnabled] = useState(false)
  const [formInitializing, setFormInitializing] = useState(true)
  const [lanData, setLanData] = useState([] as LanPort[])
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [shouldDisableGlobalAccessVlan, setShouldDisableGlobalAccessVlan] = useState(false)

  const ethernetPortProfilesRef = useRef<{ [key: string]: EthernetPortProfileViewData }>({})

  const handleEthernetPortProfileDataChanged = (
    portIndex: number,
    profileData: EthernetPortProfileViewData
  ) => {
    ethernetPortProfilesRef.current[portIndex.toString()] = profileData

    checkAndUpdateGlobalAccessVlanState()
  }

  const checkAndUpdateGlobalAccessVlanState = () => {
    if(!isGlobalAccessVlanUntaggedIdEnabled) return

    const currentLanPorts = formRef?.current?.getFieldsValue()?.lan as LanPort[] ||
      selectedModel?.lanPorts || []

    // Check if ethernet ref data is in sync with current lan data
    const isEthernetRefInSync = currentLanPorts.every((port, index) => {
      if (!isEthernetPortProfileEnabled) return true
      const refData = ethernetPortProfilesRef.current[index.toString()]
      return refData !== undefined
    })

    // Count access ports, considering both traditional type and ethernet port profile data
    const accessPortCount = currentLanPorts.filter((port, index) => {
      if (!port.enabled) return false

      // If ethernet port profile is enabled, ref data is in sync, and we have profile data for this port
      if (isEthernetPortProfileEnabled &&
          isEthernetRefInSync &&
          ethernetPortProfilesRef.current[index.toString()]) {
        const profileData = ethernetPortProfilesRef.current[index.toString()]
        return profileData.type === 'ACCESS'
      }

      // For traditional port configuration or when ref data is not in sync, check the type field
      return port.type === ApLanPortTypeEnum.ACCESS
    }).length

    const shouldDisable = accessPortCount <= 1
    setShouldDisableGlobalAccessVlan(shouldDisable)

    // Auto disable the setting when access port count <= 1
    // Only auto-disable when ethernet ref data is in sync to ensure accurate count
    if (shouldDisable &&
        formRef?.current &&
        (!isEthernetPortProfileEnabled || isEthernetRefInSync)) {
      formRef.current.setFieldValue('globalAccessVlanIdEnabled', false)
    }
  }

  const isResetClick = useRef(false)
  const {
    softGREProfileOptionList,
    duplicationChangeDispatch,
    validateIsFQDNDuplicate
  } = useSoftGreProfileLimitedSelection(venueId!)
  const {
    ipsecOptionList, ipsecOptionDispatch, usedProfileData
  } = useIpsecProfileLimitedSelection({
    venueId: venueId!, isVenueOperation: false,
    duplicationChangeDispatch: duplicationChangeDispatch,
    formRef: formRef
  } as { venueId: string, isVenueOperation: boolean,
    duplicationChangeDispatch: React.Dispatch<SoftGreDuplicationChangeDispatcher>,
    formRef?: MutableRefObject<StepsFormLegacyInstance<WifiApSetting>> })

  const isAllowUpdate = isAllowEdit
  const isAllowReset = isAllowEdit

  useEffect(() => {
    if (apDetails && apCaps && apLanPortsData && !isApLanPortsLoading) {
      // eslint-disable-next-line max-len
      const convertToFormData = (lanPortsData: WifiApSetting | VenueLanPorts, lanPortsCap: LanPort[]) => {
        const formData = {
          ...lanPortsData
        }

        formData.lanPorts = getLanPortsWithDefaultEthernetPortProfile(
          formData.lanPorts ?? [], lanPortsCap, tenantId
        )

        return formData
      }

      const setData = async () => {

        const queryPayload = {
          params: { tenantId, venueId },
          payload: {
            isEthernetPortProfileEnabled,
            isEthernetSoftgreEnabled: isSoftGREOnEthernetEnabled,
            isEthernetClientIsolationEnabled,
            isIpSecOverNetworkEnabled: isIpSecOverNetworkEnabled
          },
          enableRbac: true
        }

        const venueLanPortsData = (
          (isEthernetPortProfileEnabled)?
            await getVenueLanPortsWithEthernet(queryPayload, true).unwrap():
            // eslint-disable-next-line max-len
            await getVenueLanPorts(queryPayload, true).unwrap())
          ?.filter(item => item.model === apDetails?.model)?.[0]

        const venueLanPortsSettings = await getVenueLanPortSettingsByModel({
          params: {
            venueId,
            apModel: apCaps?.model,
            lanPortCount: apCaps?.lanPorts?.length?.toString()
          }
        }).unwrap()

        const venueLanPortsMergedData = cloneDeep(venueLanPortsData)

        venueLanPortsMergedData.lanPorts = mergeLanPortSettings(
          venueLanPortsMergedData.lanPorts, venueLanPortsSettings
        )

        const isDhcpEnabled = await getDhcpEnabled(venueId!)
        const apLanPortsCap = apCaps.lanPorts
        const lanPorts = convertToFormData(apLanPortsData, apLanPortsCap) as WifiApSetting
        // eslint-disable-next-line max-len
        const venueLanPorts = convertToFormData(venueLanPortsMergedData, apLanPortsCap) as VenueLanPorts
        setApLanPorts(lanPorts)
        setVenueLanPorts(venueLanPorts)
        // eslint-disable-next-line max-len
        setSelectedModel(lanPorts.useVenueSettings ? { ...venueLanPorts, useVenueSettings: true } : lanPorts)
        setSelectedModelCaps(apCaps as CapabilitiesApModel)
        setSelectedPortCaps(apLanPortsCap?.[activeTabIndex] as LanPort)
        setUseVenueSettings(lanPorts.useVenueSettings ?? true)
        setIsDhcpEnabled(isDhcpEnabled)
        setLanData(lanPorts?.lanPorts as LanPort[])
        setFormInitializing(false)
        setReadyToScroll?.(r => [...(new Set(r.concat('LAN-Ports')))])
      }
      setData()

    }
  }, [apDetails, venueId, apLanPortsData, apCaps])

  useEffect(() => {
    setSelectedModel({
      ...selectedModel,
      lanPorts: formRef?.current?.getFieldsValue()?.lan as LanPort[]
    })
  }, [lanData])

  const onTabChange = (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    setActiveTabIndex(tabIndex)
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
  }
  const handleCustomize = async (useVenueSettings: boolean) => {
    if (useVenueSettings) {
      formRef?.current?.setFieldValue('globalAccessVlanIdEnabled', false)
      // formRef?.current?.setFieldValue('globalAccessVlanId', 1)
    }

    const lanPorts = (useVenueSettings ? venueLanPorts : apLanPorts) as WifiApSetting
    lanPorts.lanPorts = getLanPortsWithDefaultEthernetPortProfile(
      (lanPorts.lanPorts || []),
      selectedModelCaps.lanPorts,
      tenantId
    )

    setUseVenueSettings(useVenueSettings)
    setSelectedModel(lanPorts)
    formRef?.current?.setFieldsValue({
      ...lanPorts,
      lan: lanPorts?.lanPorts,
      useVenueSettings: useVenueSettings
    })
    updateEditContext(formRef?.current as StepsFormLegacyInstance)
  }

  const handleFinish = async (values: WifiApSetting) => {
    formRef?.current?.validateFields().then(async () => {
      try {
        setEditContextData && setEditContextData({
          ...editContextData,
          isDirty: false,
          hasError: false
        })
        setUseVenueSettings(values?.useVenueSettings)

        if (isResetClick.current && isResetLanPort(values)) {
          showActionModal({
            type: 'confirm',
            width: 450,
            title: $t({ defaultMessage: 'Reset Port Settings to Default' }),
            content: $t(EditPortMessages.RESET_PORT_WARNING),
            okText: $t({ defaultMessage: 'Continue' }),
            onOk: async () => {
              try {
                processUpdateLanPorts(values)
                isResetClick.current = false
              } catch (error) {
                console.log(error) // eslint-disable-line no-console
              }
            }
          })
        } else {
          processUpdateLanPorts(values)
        }
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }).catch(() => {})
  }

  const isResetLanPort = (currentLans: WifiApSetting | undefined) => {
    if (!currentLans) return false

    const { lan } = currentLans
    const currentLanPorts: WifiApSetting = {
      ...apLanPorts,
      lanPorts: lan
    }

    const eqOriginLan = isEqualLanPort(currentLanPorts!, apLanPortsData!)
    if (eqOriginLan) return false

    if (defaultLanPorts === undefined) return false
    if (apCaps === undefined) return false

    const defaultLan = cloneDeep(defaultLanPorts)
    defaultLan.lanPorts = getLanPortsWithDefaultEthernetPortProfile(
      defaultLanPorts.lanPorts ?? [], apCaps.lanPorts, tenantId
    )

    return isEqualLanPort(currentLanPorts!, defaultLan!)
  }

  const processUpdateLanPorts = async (values: WifiApSetting) => {
    const { lan, poeMode, poeOut, poeOutMode, useVenueSettings } = values
    const lanPortsNoVni = lan?.filter(lanPort => !lanPort.vni)

    const payload: WifiApSetting = {
      ...apLanPorts,
      lanPorts: lanPortsNoVni,
      ...(poeMode ? { poeMode } : {}),
      ...(poeOut !== undefined ? { poeOut } : {}),
      ...(poeOut
        ? (poeOutMode !== undefined ? { poeOutMode } : {})
        : { poeOutMode: undefined }),
      useVenueSettings
    }

    if (isEthernetPortProfileEnabled) {

      // Must deactivate existing SoftGre relation before add new
      if (isSoftGREOnEthernetEnabled && !isIpSecOverNetworkEnabled) {
        handleSoftGreDeactivate(values)
      }

      if (isIpSecOverNetworkEnabled) {
        handleSoftGreIpSecDeactivate(values)
      }

      if (isEthernetClientIsolationEnabled) {
        await handleClientIsolationDeactivate(values)
      }

      await updateEthernetPortProfile({
        params: { venueId, serialNumber },
        payload,
        useVenueSettings
      }).unwrap()

      isIpSecOverNetworkEnabled && ipsecOptionDispatch && ipsecOptionDispatch({
        state: IpsecOptionChangeState.OnSave
      })
    } else {
      await updateApCustomization({
        params: { tenantId, serialNumber, venueId },
        payload,
        enableRbac: true
      }).unwrap()
    }
  }

  const handleSoftGreDeactivate = async (values: WifiApSetting) => {
    const { useVenueSettings } = values
    for (let i = 0; i < values.lan?.length!; i++) {
      const lanPort = values.lan?.[i] || { portId: '', softGreEnabled: false, enabled: false }
      const originSoftGreId = lanData.find(l => l.portId === lanPort.portId)?.softGreProfileId
      if (
        originSoftGreId &&
        (!lanPort.enabled || !lanPort.softGreEnabled || useVenueSettings)
      ) {
        await deactivateSoftGreProfileSettings({
          params: { venueId, serialNumber, portId: lanPort.portId, policyId: originSoftGreId }
        }).unwrap()
      }
    }
  }

  const handleSoftGreIpSecDeactivate = async (values: WifiApSetting) => {
    const { useVenueSettings } = values
    for (let i = 0; i < values.lan?.length!; i++) {
      const lanPort = values.lan?.[i] || {
        portId: '', softGreEnabled: false, enabled: false,
        softGreProfileId: '', ipsecEnabled: false, ipsecProfileId: '' }
      const originSoftGreId = lanData.find(l => l.portId === lanPort.portId)?.softGreProfileId
      const originIpsecId = lanData.find(l => l.portId === lanPort.portId)?.ipsecProfileId
      if (
        originIpsecId &&
        (!lanPort.enabled || !lanPort.softGreEnabled || !lanPort.ipsecEnabled || useVenueSettings)
      ) {
        await deactivateIpSecProfileSettings({
          params: {
            venueId, serialNumber, portId: lanPort.portId,
            softGreProfileId: originSoftGreId, ipsecProfileId: originIpsecId }
        }).unwrap()
      } else if (
        originSoftGreId &&
        (!lanPort.enabled || !lanPort.softGreEnabled || useVenueSettings)
      ) {
        await deactivateSoftGreProfileSettings({
          params: { venueId, serialNumber, portId: lanPort.portId, policyId: originSoftGreId }
        }).unwrap()
      }
    }
  }

  const handleClientIsolationDeactivate = async (values: WifiApSetting) => {
    const { useVenueSettings } = values

    for (const lanPort of values.lan!) {
      const originClientIsolationProfileId
        = lanData.find(l => l.portId === lanPort.portId)?.clientIsolationProfileId
      if (
        originClientIsolationProfileId &&
          (!lanPort.enabled
          || !lanPort.clientIsolationEnabled
          || useVenueSettings
          || (originClientIsolationProfileId !== lanPort.clientIsolationProfileId))
      ) {
        await deactivateClientIsolationOnAp({
          // eslint-disable-next-line max-len
          params: { venueId, serialNumber, portId: lanPort.portId, policyId: originClientIsolationProfileId }
        }).unwrap()
      }
    }
  }

  const handleDiscard = async () => {
    setUseVenueSettings(apLanPorts?.useVenueSettings ?? false)
    setSelectedModel((apLanPorts?.useVenueSettings
      ? venueLanPorts : apLanPorts) as WifiApSetting)

    isResetClick.current = false
    formRef?.current?.setFieldsValue({
      lan: apLanPorts?.lanPorts,
      poeMode: apLanPorts?.poeMode,
      useVenueSettings: apLanPorts?.useVenueSettings
    })
  }

  const handleFormChange = async (formName: string, info: FormChangeInfo) => {

    if (!info?.changedFields?.length) return

    const index = Number(info?.changedFields?.[0].name.toString().split(',')[1])
    const newLanData = (lanData?.map((item, idx) => {
      return idx === index
        ? formRef?.current?.getFieldsValue()?.lan?.[idx]
        : lanData?.[idx]})) as LanPort[]

    setLanData(newLanData)

    updateEditContext(formRef?.current as StepsFormLegacyInstance)
  }

  const updateEditContext = (form: StepsFormLegacyInstance) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      tabTitle: $t({ defaultMessage: 'Networking' }),
      isDirty: true
    })

    setEditNetworkingContextData && setEditNetworkingContextData({
      ...editNetworkingContextData,
      updateLanPorts: () => handleFinish(form?.getFieldsValue(true) as WifiApSetting),
      discardLanPortsChanges: () => handleDiscard()
    })
  }

  const handleResetDefaultLanPorts = () => {
    if (apCaps && defaultLanPorts && !isDefaultPortsLoading) {
      const defaultLanPortsFormData = {
        ...defaultLanPorts
      }

      defaultLanPortsFormData.lanPorts = getLanPortsWithDefaultEthernetPortProfile(
        defaultLanPortsFormData.lanPorts ?? [], apCaps.lanPorts, tenantId
      )

      setSelectedModel(defaultLanPortsFormData)
      formRef?.current?.setFieldsValue({
        ...defaultLanPortsFormData,
        lan: defaultLanPortsFormData?.lanPorts,
        useVenueSettings: useVenueSettings
      })
      isResetClick.current = true
      updateEditContext(formRef?.current as StepsFormLegacyInstance)

      let voters = [] as Voter[]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultLanPortsFormData.lanPorts.forEach((lanPort: any) => {
        voters.push({
          portId: (lanPort.portId ?? '0'),
          serialNumber
        })
      })

      duplicationChangeDispatch({
        state: SoftGreDuplicationChangeState.ResetToDefault,
        voters: voters
      })

      if (isIpSecOverNetworkEnabled) {
        ipsecOptionDispatch({
          state: IpsecOptionChangeState.ResetToDefault,
          voters: voters
        })
      }
    }
  }

  const navigateToVenue = (venueId: string | undefined) => {
    navigate(`../venues/${venueId}/venue-details/overview`)
  }

  const onGUIChanged = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance)
  }

  return <Loader states={[{
    isLoading: formInitializing,
    isFetching: isApLanPortsUpdating ||
      isEthernetPortProfileUpdating ||
      isSoftGreProfileDeactivting ||
      isIpSecProfileDeactivting ||
      isDeactivateClientIsolationOnAp
  }]}>
    {selectedModel?.lanPorts
      ? <StepsFormLegacy
        formRef={formRef}
        onFormChange={handleFormChange}
      >
        <StepsFormLegacy.StepForm
          initialValues={{
            lan: selectedModel?.lanPorts,
            globalAccessVlanIdEnabled: (selectedModel &&
              'globalAccessVlanIdEnabled' in selectedModel) ?
              selectedModel.globalAccessVlanIdEnabled : false,
            globalAccessVlanId: (selectedModel &&
              'globalAccessVlanId' in selectedModel) ?
              selectedModel.globalAccessVlanId : 1
          }}
        >
          <Row gutter={24}
            style={
              { position: 'absolute', right: '0', top: '0', whiteSpace: 'nowrap',
                marginRight: '34%', transform: 'translateY(-326%)' }}>
            <Col span={10}>
              <SettingMessage showButton={!!selectedModel?.lanPorts} />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                hidden={true}
                name='useVenueSettings'
                valuePropName='checked'
                initialValue={useVenueSettings}
                children={<Switch checked={useVenueSettings} />}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              {isApPoeModeEnabled &&
              <LanPortPoeSettings
                disabled={!isAllowEdit}
                selectedModel={selectedModel}
                selectedModelCaps={selectedModelCaps}
                useVenueSettings={useVenueSettings}
                onGUIChanged={onGUIChanged}
              />
              }
            </Col>
          </Row>
          {isGlobalAccessVlanUntaggedIdEnabled &&
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name={'globalAccessVlanIdEnabled'}
                  label={$t({ defaultMessage: 'Overwrite Access Port VLAN Untagged ID' })}
                  valuePropName='checked'
                  children={<Switch
                    data-testid={'global-access-vlan-id-switch'}
                    disabled={!isAllowEdit || useVenueSettings || shouldDisableGlobalAccessVlan}
                  />}
                />
              </Col>
            </Row>
          }
          {formRef?.current?.getFieldsValue()?.globalAccessVlanIdEnabled &&
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name='globalAccessVlanId'
                  label={$t({ defaultMessage: 'Global VLAN Untag ID' })}
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'Please enter VLAN Untag ID' })
                    },
                    {
                      type: 'number',
                      min: 1,
                      max: 4094,
                      message: $t({ defaultMessage: 'Value must be between 1-4094' })
                    }
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={4094}
                    disabled={!isAllowEdit || useVenueSettings || shouldDisableGlobalAccessVlan}
                    style={{ width: '120px' }}
                    defaultValue={1}
                  />
                </Form.Item>
              </Col>
            </Row>
          }
          <Row gutter={24}>
            <Col span={24}>
              <Tabs
                type='third'
                onChange={onTabChange}
                activeKey={`lan-${activeTabIndex + 1}`}
                animated={true}
              >
                {selectedModel?.lanPorts?.map((lan: LanPort, index: number) =>
                  <Tabs.TabPane
                    tab={$t({ defaultMessage: 'LAN {index}' }, { index: index + 1 })}
                    key={`lan-${index + 1}`}
                    forceRender={true}
                  >
                    <Row>
                      <Col span={8}>
                        <LanPortSettings
                          readOnly={!isAllowEdit || useVenueSettings}
                          selectedPortCaps={selectedPortCaps}
                          selectedModel={selectedModel}
                          setSelectedPortCaps={setSelectedPortCaps}
                          selectedModelCaps={selectedModelCaps}
                          isDhcpEnabled={isDhcpEnabled}
                          index={index}
                          useVenueSettings={useVenueSettings}
                          venueId={venueId}
                          onGUIChanged={onGUIChanged}
                          serialNumber={serialNumber}
                          softGREProfileOptionList={softGREProfileOptionList}
                          optionDispatch={duplicationChangeDispatch}
                          validateIsFQDNDuplicate={validateIsFQDNDuplicate}
                          ipsecOptionList={isIpSecOverNetworkEnabled ? ipsecOptionList : undefined}
                          ipsecOptionDispatch={
                            isIpSecOverNetworkEnabled ? ipsecOptionDispatch : undefined
                          }
                          usedProfileData={isIpSecOverNetworkEnabled ? usedProfileData : undefined}
                          globalAccessPortUntaggedIdEnabled={
                            formRef?.current?.getFieldsValue()?.globalAccessVlanIdEnabled ?? false
                          }
                          globalAccessPortUntaggedId={
                            formRef?.current?.getFieldsValue()?.globalAccessVlanId ?? 1
                          }
                          onEthernetPortProfileDataChanged={(profileData) =>
                            handleEthernetPortProfileDataChanged(index, profileData)
                          }
                        />
                      </Col>
                    </Row>
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Col>
            {selectedModel?.lanPorts && <Col span={24}>
              <Col span={8}>
                <Space style={{ padding: '16px 0' }}>
                  <Image
                    alt={$t({ defaultMessage: 'AP LAN port image - {apModel}' }, {
                      apModel: selectedModelCaps?.model
                    })}
                    preview={false}
                    src={selectedModelCaps?.lanPortPictureDownloadUrl}
                  />
                </Space>
              </Col>
            </Col>}
          </Row>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
      : <SettingMessage showButton={!!selectedModel?.lanPorts} />
    }
  </Loader>

  function SettingMessage ({ showButton }: { showButton: boolean }) {
    const hasVni = lanData.filter(lan => lan?.vni > 0 ).length > 0
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return hasVni ? <></> : <Space
      style={{ display: 'flex', fontSize: '12px' }}>
      {useVenueSettings
        ? <FormattedMessage
          defaultMessage={
            'Currently using LAN port settings of the <venueSingular></venueSingular> ({venue})'}
          values={{
            venue: <Button type='link'
              size='small'
              style={{ verticalAlign: 'middle' }}
              onClick={() => navigateToVenue(venueData?.id)}
            >
              {venueData?.name}
            </Button>
          }} />
        : (<>{$t({ defaultMessage: 'Custom settings' })}
          <Button type='link'
            size='small'
            disabled={!isAllowEdit}
            onClick={handleResetDefaultLanPorts}>
            {$t({ defaultMessage: 'Reset to default' })}
          </Button></>)
      }
      {showButton && <div>|</div>}
      {showButton && <Button type='link'
        size='small'
        disabled={useVenueSettings ? !isAllowUpdate : !isAllowReset}
        onClick={() => handleCustomize(!useVenueSettings)}
      > {useVenueSettings
          ? $t({ defaultMessage: 'Customize' })
          : $t({ defaultMessage: 'Use <VenueSingular></VenueSingular> Settings' })
        }</Button>}
    </Space>
  }

  function getLanPortsWithDefaultEthernetPortProfile (
    lanPorts: LanPort[],
    lanPortsCap: LanPort[],
    tenantId?: string) {

    if(!lanPorts || !isEthernetPortProfileEnabled) {
      return lanPorts
    }

    const newLanPorts = cloneDeep(lanPorts)
    newLanPorts.forEach((lanPort: LanPort)=>{
      if (!lanPort.hasOwnProperty('ethernetPortProfileId') ||
           lanPort.ethernetPortProfileId === null) {
        const defaultType = lanPortsCap.find(cap => cap.id === lanPort.portId)?.defaultType
        switch (defaultType){
          case ApLanPortTypeEnum.ACCESS:
            lanPort.ethernetPortProfileId = tenantId + '_' + ApLanPortTypeEnum.ACCESS.toString()
            break
          case ApLanPortTypeEnum.TRUNK:
            lanPort.ethernetPortProfileId = tenantId + '_' + ApLanPortTypeEnum.TRUNK.toString()
            break
        }
      }
    })

    return newLanPorts
  }
}
