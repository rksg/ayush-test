import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Image, Row, Space, Switch } from 'antd'
import { cloneDeep, isObject }                  from 'lodash'
import { FormChangeInfo }                       from 'rc-field-form/lib/FormContext'
import { FormattedMessage, useIntl }            from 'react-intl'

import {
  AnchorContext,
  Button,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tabs,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                             from '@acx-ui/feature-toggle'
import { ConvertPoeOutToFormData, LanPortPoeSettings, LanPortSettings, SoftGreIpSecState, useSoftGreProfileLimitedSelection } from '@acx-ui/rc/components'
import {
  useDeactivateSoftGreProfileOnAPMutation,
  useDeactivateIpsecOnAPLanPortMutation,
  useGetApLanPortsWithActivatedProfilesQuery,
  useGetDefaultApLanPortsQuery,
  useLazyGetDHCPProfileListViewModelQuery,
  useLazyGetVenueLanPortWithEthernetSettingsQuery,
  useLazyGetVenueLanPortsQuery,
  useLazyGetVenueSettingsQuery,
  useResetApLanPortsMutation,
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
  mergeLanPortSettings, Voter, SoftGreDuplicationChangeState
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'

const useFetchIsVenueDhcpEnabled = () => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isServiceRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const [getVenueSettings] = useLazyGetVenueSettingsQuery()
  const [getDhcpList] = useLazyGetDHCPProfileListViewModelQuery()

  return async (venueId: string) => {
    let isDhcpEnabled: boolean = false

    if (isWifiRbacEnabled) {
      const dhcpList = await getDhcpList({
        payload: {
          fields: ['id', 'venueIds'],
          filters: { venueIds: [venueId] }
        },
        enableRbac: isServiceRbacEnabled
      }).unwrap()

      isDhcpEnabled = !!dhcpList?.data[0]
    } else {
      const venueSettings = (await getVenueSettings({
        params: { venueId } }, true).unwrap())

      isDhcpEnabled = venueSettings?.dhcpServiceSetting?.enabled ?? false
    }

    return isDhcpEnabled
  }
}

export function LanPorts (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props
  const navigate = useNavigate()
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isResetLanPortEnabled = useIsSplitOn(Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)
  const isEthernetClientIsolationEnabled =
    useIsSplitOn(Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)


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
  const supportTrunkPortUntaggedVlan = useIsSplitOn(Features.WIFI_TRUNK_PORT_UNTAGGED_VLAN_TOGGLE)
  const isSoftGREOnEthernetEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const formRef = useRef<StepsFormLegacyInstance<WifiApSetting>>()
  const { data: apLanPortsData, isLoading: isApLanPortsLoading } =
  useGetApLanPortsWithActivatedProfilesQuery({
    params: { tenantId, serialNumber, venueId },
    enableRbac: isUseWifiRbacApi,
    enableEthernetProfile: isEthernetPortProfileEnabled,
    enableSoftGreOnEthernet: isSoftGREOnEthernetEnabled,
    enableIpsecOverNetwork: isIpSecOverNetworkEnabled,
    enableClientIsolationOnEthernet: isEthernetClientIsolationEnabled
  })
  const { data: defaultLanPorts, isLoading: isDefaultPortsLoading } = useGetDefaultApLanPortsQuery({
    params: { venueId, serialNumber }
  }, { skip: !isResetLanPortEnabled })

  const [getVenueLanPortsWithEthernet] = useLazyGetVenueLanPortWithEthernetSettingsQuery()
  const [getVenueLanPorts] = useLazyGetVenueLanPortsQuery()
  const getDhcpEnabled = useFetchIsVenueDhcpEnabled()

  const [getVenueLanPortSettingsByModel] = useLazyGetVenueLanPortSettingsByModelQuery()

  const [updateApCustomization, {
    isLoading: isApLanPortsUpdating }] = useUpdateApLanPortsMutation()
  const [updateEthernetPortProfile, {
    isLoading: isEthernetPortProfileUpdating }] = useUpdateApEthernetPortsMutation()
  const [resetApCustomization, {
    isLoading: isApLanPortsResetting }] = useResetApLanPortsMutation()
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
  const [lanPortIdx, setLanPortIdx] = useState(0)
  const isResetClick = useRef(false)
  const {
    softGREProfileOptionList,
    duplicationChangeDispatch,
    validateIsFQDNDuplicate
  } = useSoftGreProfileLimitedSelection(venueId!)
  const {
    isVenueBoundIpsec,
    boundSoftGreIpsecList,
    softGreIpsecProfileValidator
  } = SoftGreIpSecState(venueId!, false)

  const isAllowUpdate = isAllowEdit // this.rbacService.isRoleAllowed('UpdateWifiApSetting');
  const isAllowReset = isAllowEdit // this.rbacService.isRoleAllowed('ResetWifiApSetting');

  useEffect(() => {
    if (apDetails && apCaps && apLanPortsData && !isApLanPortsLoading) {
      // eslint-disable-next-line max-len
      const convertToFormData = (lanPortsData: WifiApSetting | VenueLanPorts, lanPortsCap: LanPort[]) => {
        const poeOutFormData = ConvertPoeOutToFormData(lanPortsData, lanPortsCap)
        const formData = {
          ...lanPortsData,
          ...(poeOutFormData && { poeOut: poeOutFormData })
        }

        formData.lanPorts = getLanPortsWithDefaultEthernetPortProfile(
          formData.lanPorts, lanPortsCap, tenantId
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
          enableRbac: isUseWifiRbacApi
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
        const lanPorts = convertToFormData(apLanPortsData, apLanPortsCap)
        const venueLanPorts = convertToFormData(venueLanPortsMergedData, apLanPortsCap)
        setApLanPorts(lanPorts)
        setVenueLanPorts(venueLanPorts)
        setSelectedModel(lanPorts.useVenueSettings ? venueLanPorts : lanPorts)
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

  const onTabChange = async (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    const form = formRef?.current as StepsFormLegacyInstance
    form.validateFields([['lan', lanPortIdx, 'softGreIpsecValidator']])
      .then(async () => {
        try {
          // eslint-disable-next-line no-console
          console.log('onTabChange:', tabIndex)
          setActiveTabIndex(tabIndex)
          setLanPortIdx(tabIndex)
          setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      }).catch(() => {})
  }
  const handleCustomize = async (useVenueSettings: boolean) => {
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

        if (isResetLanPortEnabled && isResetClick.current && isResetLanPort(values)) {
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

    const { lan, poeOut } = currentLans
    const currentLanPorts: WifiApSetting = {
      ...apLanPorts,
      lanPorts: lan,
      ...(poeOut && isObject(poeOut) &&
          { poeOut: Object.values(poeOut).some(item => item === true) })
    }

    const eqOriginLan = isEqualLanPort(currentLanPorts!, apLanPortsData!)
    if (eqOriginLan) return false

    return isEqualLanPort(currentLanPorts!, defaultLanPorts!)
  }

  const processUpdateLanPorts = async (values: WifiApSetting) => {
    const { lan, poeOut, useVenueSettings } = values
    const lanPortsNoVni = lan?.filter(lanPort => !lanPort.vni)

    if (isUseWifiRbacApi || isEthernetPortProfileEnabled) {
      const payload: WifiApSetting = {
        ...apLanPorts,
        lanPorts: lanPortsNoVni,
        ...(poeOut && isObject(poeOut) &&
            { poeOut: Object.values(poeOut).some(item => item === true) }),
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
      } else {
        await updateApCustomization({
          params: { tenantId, serialNumber, venueId },
          payload,
          enableRbac: true
        }).unwrap()
      }
    } else {
      if (values?.useVenueSettings) {
        await resetApCustomization({ params: { tenantId, serialNumber } }).unwrap()
      } else {
        const payload: WifiApSetting = {
          ...apLanPorts,
          lanPorts: lan,
          //...(poeMode && { poeMode: poeMode }), // ALTO AP config doesn't support PoeMode
          ...(poeOut && isObject(poeOut) &&
              { poeOut: Object.values(poeOut).some(item => item === true) }),
          useVenueSettings: false
        }
        await updateApCustomization({ params: { tenantId, serialNumber }, payload }).unwrap()
      }
    }
  }

  const handleSoftGreDeactivate = (values: WifiApSetting) => {
    const { useVenueSettings } = values
    values.lan?.forEach(lanPort => {
      const originSoftGreId = lanData.find(l => l.portId === lanPort.portId)?.softGreProfileId
      if (
        originSoftGreId &&
        (!lanPort.enabled || !lanPort.softGreEnabled || useVenueSettings)
      ) {
        deactivateSoftGreProfileSettings({
          params: { venueId, serialNumber, portId: lanPort.portId, policyId: originSoftGreId }
        }).unwrap()
      }
    })
  }

  const handleSoftGreIpSecDeactivate = (values: WifiApSetting) => {
    const { useVenueSettings } = values
    values.lan?.forEach(lanPort => {
      const originSoftGreId = lanData.find(l => l.portId === lanPort.portId)?.softGreProfileId
      const originIpsecId = lanData.find(l => l.portId === lanPort.portId)?.ipsecProfileId
      if (
        originIpsecId &&
        (!lanPort.enabled || !lanPort.softGreEnabled || !lanPort.ipsecEnabled || useVenueSettings)
      ) {
        deactivateIpSecProfileSettings({
          params: {
            venueId, serialNumber, portId: lanPort.portId,
            softGreProfileId: lanPort.softGreProfileId, ipsecProfileId: originIpsecId }
        }).unwrap()
      } else if (
        originSoftGreId &&
        (!lanPort.enabled || !lanPort.softGreEnabled || lanPort.ipsecEnabled || useVenueSettings)
      ) {
        deactivateSoftGreProfileSettings({
          params: { venueId, serialNumber, portId: lanPort.portId, policyId: originSoftGreId }
        }).unwrap()
      }
    })
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
      useVenueSettings: apLanPorts?.useVenueSettings
    })
  }

  const handleFormChange = async (formName: string, info: FormChangeInfo) => {

    if (info?.changedFields) return

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
      const poeOutFormData = ConvertPoeOutToFormData(defaultLanPorts, apCaps.lanPorts)
      const defaultLanPortsFormData = {
        ...defaultLanPorts,
        ...(poeOutFormData && { poeOut: poeOutFormData })
      }

      defaultLanPortsFormData.lanPorts = getLanPortsWithDefaultEthernetPortProfile(
        defaultLanPortsFormData.lanPorts, apCaps.lanPorts, tenantId
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
      isApLanPortsResetting ||
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
          initialValues={{ lan: selectedModel?.lanPorts }}
        >
          <Row gutter={24}
            style={isResetLanPortEnabled ?
              { position: 'absolute', right: '0', top: '0', whiteSpace: 'nowrap',
                marginRight: '34%', transform: 'translateY(-326%)' } : {}}>
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
              <LanPortPoeSettings
                context='ap'
                disabled={!isAllowEdit}
                selectedModel={selectedModel}
                selectedModelCaps={selectedModelCaps}
                useVenueSettings={useVenueSettings}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Tabs
                type='third'
                onChange={onTabChange}
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
                          isTrunkPortUntaggedVlanEnabled={supportTrunkPortUntaggedVlan}
                          index={index}
                          useVenueSettings={useVenueSettings}
                          venueId={venueId}
                          onGUIChanged={onGUIChanged}
                          serialNumber={serialNumber}
                          softGREProfileOptionList={softGREProfileOptionList}
                          optionDispatch={duplicationChangeDispatch}
                          validateIsFQDNDuplicate={validateIsFQDNDuplicate}
                          isVenueBoundIpsec={isVenueBoundIpsec}
                          boundSoftGreIpsecList={boundSoftGreIpsecList}
                          softGreIpsecProfileValidator={softGreIpsecProfileValidator}
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
      style={isResetLanPortEnabled ? { display: 'flex', fontSize: '12px' } :
        { display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
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
        : (isResetLanPortEnabled ? <>{$t({ defaultMessage: 'Custom settings' })}
          <Button type='link'
            size='small'
            disabled={!isAllowEdit}
            onClick={handleResetDefaultLanPorts}>
            {$t({ defaultMessage: 'Reset to default' })}
          </Button></> : $t({ defaultMessage: 'Custom settings' }) )
      }
      {showButton && isResetLanPortEnabled && <div>|</div>}
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
