import { useContext, useRef, useState, useEffect } from 'react'

import { Col, Form, Image, Row, Space, Switch } from 'antd'
import { isObject }                             from 'lodash'
import { FormChangeInfo }                       from 'rc-field-form/lib/FormContext'
import { FormattedMessage, useIntl }            from 'react-intl'

import {
  Button,
  Loader,
  Tabs,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  AnchorContext
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { ConvertPoeOutToFormData, LanPortPoeSettings, LanPortSettings } from '@acx-ui/rc/components'
import {
  useLazyGetVenueLanPortsQuery,
  useLazyGetVenueSettingsQuery,
  useGetApLanPortsQuery,
  useUpdateApLanPortsMutation,
  useResetApLanPortsMutation,
  useLazyGetDHCPProfileListViewModelQuery,
  useGetDefaultApLanPortsQuery,
  useGetEthernetPortProfileViewDataListQuery
} from '@acx-ui/rc/services'
import {
  LanPort,
  WifiApSetting,
  CapabilitiesApModel,
  VenueLanPorts,
  EthernetPortProfileViewData
} from '@acx-ui/rc/utils'
import {
  useParams,
  useNavigate
} from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext } from '../..'

const useFetchIsVenueDhcpEnabled = () => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const [getVenueSettings] = useLazyGetVenueSettingsQuery()
  const [getDhcpList] = useLazyGetDHCPProfileListViewModelQuery()

  return async (venueId: string) => {
    let isDhcpEnabled: boolean = false

    if (isWifiRbacEnabled) {
      const dhcpList = await getDhcpList({
        payload: {
          fields: ['id', 'venueIds'],
          filters: { venueIds: [venueId] }
        }
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

export function LanPorts () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isResetLanPortEnabled = useIsSplitOn(Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)

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

  const supportTrunkPortUntaggedVlan = useIsSplitOn(Features.WIFI_TRUNK_PORT_UNTAGGED_VLAN_TOGGLE)

  const formRef = useRef<StepsFormLegacyInstance<WifiApSetting>>()
  const { data: apLanPortsData, isLoading: isApLanPortsLoading } = useGetApLanPortsQuery({
    params: { tenantId, serialNumber, venueId },
    enableRbac: isUseWifiRbacApi
  })
  const { data: defaultLanPorts, isLoading: isDefaultPortsLoading } = useGetDefaultApLanPortsQuery({
    params: { venueId, serialNumber }
  }, { skip: !isResetLanPortEnabled })

  const [getVenueLanPorts] = useLazyGetVenueLanPortsQuery()
  const getDhcpEnabled = useFetchIsVenueDhcpEnabled()

  const [updateApCustomization, {
    isLoading: isApLanPortsUpdating }] = useUpdateApLanPortsMutation()
  const [resetApCustomization, {
    isLoading: isApLanPortsResetting }] = useResetApLanPortsMutation()

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
  const [ethPortProfileData, setEthPortProfileData] = useState([] as EthernetPortProfileViewData[])

  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)

  // TODO: rbac
  const isAllowUpdate = true // this.rbacService.isRoleAllowed('UpdateWifiApSetting');
  const isAllowReset = true // this.rbacService.isRoleAllowed('ResetWifiApSetting');

  const defaultPayload = {
    fields: [
      'id',
      'name',
      'type',
      'untagId',
      'vlanMembers',
      'authType',
      'apSerialNumbers'
    ],
    filters: { serialNumber: [serialNumber] }
  }

  const { data: ethList, isLoading: isEthListLoading }
    = useGetEthernetPortProfileViewDataListQuery(
      { payload: defaultPayload }, { skip: !isEthernetPortProfileEnabled })

  useEffect(() => {
    if (apDetails && apCaps && apLanPortsData && !isApLanPortsLoading) {
      // eslint-disable-next-line max-len
      const convertToFormData = (lanPortsData: WifiApSetting | VenueLanPorts, lanPortsCap: LanPort[]) => {
        const poeOutFormData = ConvertPoeOutToFormData(lanPortsData, lanPortsCap)

        return {
          ...lanPortsData,
          ...(poeOutFormData && { poeOut: poeOutFormData })
        }
      }

      const setData = async () => {
        const venueLanPortsData = (await getVenueLanPorts({
          params: { tenantId, venueId },
          enableRbac: isUseWifiRbacApi
        }, true).unwrap())?.filter(item => item.model === apDetails?.model)?.[0]

        const isDhcpEnabled = await getDhcpEnabled(venueId!)

        const apLanPortsCap = apCaps.lanPorts
        const lanPorts = convertToFormData(apLanPortsData, apLanPortsCap)
        const venueLanPorts = convertToFormData(venueLanPortsData, apLanPortsCap)

        setApLanPorts(lanPorts)
        setVenueLanPorts(venueLanPorts)
        setSelectedModel(lanPorts)
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

  useEffect(() => {
    if (!isEthListLoading && serialNumber && ethList) {
      setEthPortProfileData(ethList?.data.filter(item => serialNumber in item.apSerialNumbers))
    }
  })

  const onTabChange = (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    setActiveTabIndex(tabIndex)
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
  }

  const handleCustomize = async (useVenueSettings: boolean) => {
    const lanPorts = (useVenueSettings ? venueLanPorts : apLanPorts) as WifiApSetting
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
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      setUseVenueSettings(values?.useVenueSettings)

      const { lan, poeOut, useVenueSettings } = values

      if (isUseWifiRbacApi) {
        const payload: WifiApSetting = {
          ...apLanPorts,
          lanPorts: lan,
          ...(poeOut && isObject(poeOut) &&
              { poeOut: Object.values(poeOut).some(item => item === true) }),
          useVenueSettings
        }
        await updateApCustomization({
          params: { tenantId, serialNumber, venueId },
          payload,
          enableRbac: true
        }).unwrap()
      } else {
        if (values?.useVenueSettings) {
          await resetApCustomization({ params: { tenantId, serialNumber } }).unwrap()
        } else {
          const { lan, poeOut } = values
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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscard = async () => {
    setUseVenueSettings(apLanPorts?.useVenueSettings ?? false)
    setSelectedModel((apLanPorts?.useVenueSettings
      ? venueLanPorts : apLanPorts) as WifiApSetting)

    formRef?.current?.setFieldsValue({
      lan: apLanPorts?.lanPorts,
      useVenueSettings: apLanPorts?.useVenueSettings
    })
  }

  const handleFormChange = async (formName: string, info: FormChangeInfo) => {
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
      updateLanPorts: () => handleFinish(form?.getFieldsValue() as WifiApSetting),
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

      setSelectedModel(defaultLanPortsFormData)
      formRef?.current?.setFieldsValue({
        ...defaultLanPortsFormData,
        lan: defaultLanPortsFormData?.lanPorts,
        useVenueSettings: useVenueSettings
      })
      updateEditContext(formRef?.current as StepsFormLegacyInstance)
    }
  }

  const navigateToVenue = (venueId: string | undefined) => {
    navigate(`../venues/${venueId}/venue-details/overview`)
  }

  return <Loader states={[{
    isLoading: formInitializing,
    isFetching: isApLanPortsUpdating || isApLanPortsResetting
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
                          readOnly={useVenueSettings}
                          selectedPortCaps={selectedPortCaps}
                          selectedModel={selectedModel}
                          setSelectedPortCaps={setSelectedPortCaps}
                          selectedModelCaps={selectedModelCaps}
                          isDhcpEnabled={isDhcpEnabled}
                          isTrunkPortUntaggedVlanEnabled={supportTrunkPortUntaggedVlan}
                          index={index}
                          useVenueSettings={useVenueSettings}
                          ethPortProfileConfig={ethPortProfileData}
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
    return <Space
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
          <Button type='link' size='small' onClick={handleResetDefaultLanPorts}>
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
}
