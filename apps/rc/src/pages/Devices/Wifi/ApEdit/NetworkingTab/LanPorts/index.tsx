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
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { ConvertPoeOutToFormData, LanPortPoeSettings, LanPortSettings } from '@acx-ui/rc/components'
import {
  useLazyGetVenueQuery,
  useLazyGetVenueLanPortsQuery,
  useLazyGetVenueSettingsQuery,
  useGetApLanPortsQuery,
  useUpdateApLanPortsMutation,
  useResetApLanPortsMutation
} from '@acx-ui/rc/services'
import {
  LanPort,
  WifiApSetting,
  CapabilitiesApModel,
  VenueExtended
} from '@acx-ui/rc/utils'
import {
  useParams,
  useNavigate
} from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext } from '../..'

export function LanPorts () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const { apData: apDetails, apCapabilities: apCaps } = useContext(ApDataContext)
  const supportTrunkPortUntaggedVlan = useIsSplitOn(Features.WIFI_TRUNK_PORT_UNTAGGED_VLAN_TOGGLE)

  const formRef = useRef<StepsFormLegacyInstance<WifiApSetting>>()
  const { data: apLanPorts, isLoading: isApLanPortsLoading }
    = useGetApLanPortsQuery({ params: { tenantId, serialNumber } })

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueLanPorts] = useLazyGetVenueLanPortsQuery()
  const [getVenueSettings] = useLazyGetVenueSettingsQuery()


  const [updateApCustomization, {
    isLoading: isApLanPortsUpdating }] = useUpdateApLanPortsMutation()
  const [resetApCustomization, {
    isLoading: isApLanPortsResetting }] = useResetApLanPortsMutation()


  const [venue, setVenue] = useState({} as VenueExtended)
  const [venueLanPorts, setVenueLanPorts] = useState({})
  const [selectedModel, setSelectedModel] = useState({} as WifiApSetting)
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as CapabilitiesApModel)
  const [selectedPortCaps, setSelectedPortCaps] = useState({} as LanPort)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [initData, setInitData] = useState({} as WifiApSetting)
  const [isDhcpEnabled, setIsDhcpEnabled] = useState(false)
  const [formInitializing, setFormInitializing] = useState(true)
  const [lanData, setLanData] = useState([] as LanPort[])
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  // TODO: rbac
  const isAllowUpdate = true // this.rbacService.isRoleAllowed('UpdateWifiApSetting');
  const isAllowReset = true // this.rbacService.isRoleAllowed('ResetWifiApSetting');

  useEffect(() => {
    if (apDetails && apCaps && apLanPorts && !isApLanPortsLoading) {
      const { venueId } = apDetails
      const setData = async () => {
        const venue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())

        const venueLanPortsData = (await getVenueLanPorts({
          params: { tenantId, venueId }
        }, true).unwrap())?.filter(item => item.model === apDetails?.model)?.[0]

        const venueSettings = (await getVenueSettings({
          params: { tenantId, venueId } }, true).unwrap())

        const apLanPortsCap = apCaps.lanPorts
        const apPoeOutFormData = ConvertPoeOutToFormData(apLanPorts, apLanPortsCap)
        const lanPorts = {
          ...apLanPorts,
          ...(apPoeOutFormData && { poeOut: apPoeOutFormData })
        }

        const venuePoeOutFormData = ConvertPoeOutToFormData(venueLanPortsData, apLanPortsCap)
        const venueLanPorts = {
          ...venueLanPortsData,
          ...(venuePoeOutFormData && { poeOut: venuePoeOutFormData })
        }

        setVenue(venue)
        setVenueLanPorts(venueLanPorts)
        setSelectedModel(lanPorts )
        setSelectedModelCaps(apCaps as CapabilitiesApModel)
        setSelectedPortCaps(apLanPortsCap?.[activeTabIndex] as LanPort)
        setUseVenueSettings(lanPorts.useVenueSettings ?? true)
        setIsDhcpEnabled(venueSettings?.dhcpServiceSetting?.enabled ?? false)
        setLanData(lanPorts?.lanPorts as LanPort[])
        setInitData(lanPorts)
        setFormInitializing(false)
      }
      setData()
    }
  }, [apDetails, apLanPorts, apCaps])

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

      if (values?.useVenueSettings) {
        await resetApCustomization({ params: { tenantId, serialNumber } }).unwrap()
      } else {
        //const { lan, poeOut, poeMode } = values
        const { lan, poeOut } = values
        const payload: WifiApSetting = {
          ...initData,
          lanPorts: lan,
          //...(poeMode && { poeMode: poeMode }), // ALTO AP config doesn't support PoeMode
          ...(poeOut && isObject(poeOut) &&
              { poeOut: Object.values(poeOut).some(item => item === true) }),
          useVenueSettings: false
        }

        //console.log('values: ', values)
        //console.log('payload: ', payload)

        await updateApCustomization({ params: { tenantId, serialNumber }, payload }).unwrap()
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
          <Row gutter={24}>
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
      style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}
    >
      {useVenueSettings
        ? <FormattedMessage
          defaultMessage={'Currently using LAN port settings of the venue ({venue})'}
          values={{
            venue: <Button type='link'
              size='small'
              style={{ verticalAlign: 'middle' }}
              onClick={() => navigateToVenue(venue?.id)}
            >
              {venue?.name}
            </Button>
          }} />
        : $t({ defaultMessage: 'Custom settings' })
      }
      {showButton && <Button type='link'
        size='small'
        disabled={useVenueSettings ? !isAllowUpdate : !isAllowReset}
        onClick={() => handleCustomize(!useVenueSettings)}
      > {useVenueSettings
          ? $t({ defaultMessage: 'Customize' })
          : $t({ defaultMessage: 'Use Venue Settings' })
        }</Button>}
    </Space>
  }
}
