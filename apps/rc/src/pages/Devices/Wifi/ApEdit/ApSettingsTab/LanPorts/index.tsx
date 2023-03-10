import { useContext, useRef, useState, useEffect } from 'react'

import { Col, Form, Image, Row, Space, Switch } from 'antd'
import { isEqual }                              from 'lodash'
import { FormChangeInfo }                       from 'rc-field-form/lib/FormContext' //'antd/lib/form/context'
import { FormattedMessage, useIntl }            from 'react-intl'

import {
  Button,
  Loader,
  Tabs,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { LanPortSettings }          from '@acx-ui/rc/components'
import {
  useGetApQuery,
  useGetApLanPortsQuery,
  useGetApCapabilitiesQuery,
  useLazyGetVenueQuery,
  useLazyGetVenueLanPortsQuery,
  useLazyGetVenueSettingsQuery,
  useUpdateApCustomizationMutation,
  useResetApCustomizationMutation
} from '@acx-ui/rc/services'
import {
  LanPort,
  WifiApSetting,
  CapabilitiesApModel,
  VenueExtended
} from '@acx-ui/rc/utils'
import {
  useParams,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ApEditContext } from '../../../ApEdit/index'

export function LanPorts () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const formRef = useRef<StepsFormInstance<WifiApSetting>>()
  const { data: apDetails } = useGetApQuery({ params: { tenantId, serialNumber } })
  const { data: apCaps } = useGetApCapabilitiesQuery({ params: { tenantId, serialNumber } })
  const { data: apLanPorts, isLoading: isApLanPortsLoading }
    = useGetApLanPortsQuery({ params: { tenantId, serialNumber } })

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueLanPorts] = useLazyGetVenueLanPortsQuery()
  const [getVenueSettings] = useLazyGetVenueSettingsQuery()
  const [updateApCustomization, {
    isLoading: isApLanPortsUpdating }] = useUpdateApCustomizationMutation()
  const [resetApCustomization, {
    isLoading: isApLanPortsResetting }] = useResetApCustomizationMutation()

  const [venue, setVenue] = useState({} as VenueExtended)
  const [venueLanPorts, setVenueLanPorts] = useState({})
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as CapabilitiesApModel)
  const [selectedPortCaps, setSelectedPortCaps] = useState({} as LanPort)
  const [selectedModel, setSelectedModel] = useState({} as WifiApSetting)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [isDhcpEnabled, setIsDhcpEnabled] = useState(false)
  const [formInitializing, setFormInitializing] = useState(true)
  const [lanData, setLanData] = useState([] as LanPort[])
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  // TODO: rbac
  const isAllowUpdate = true // this.rbacService.isRoleAllowed('UpdateWifiApSetting');
  const isAllowReset = true // this.rbacService.isRoleAllowed('ResetWifiApSetting');

  useEffect(() => {
    if (apDetails && apCaps && !isApLanPortsLoading) {
      const setData = async () => {
        const venue = (await getVenue({
          params: { tenantId, venueId: apDetails?.venueId } }, true).unwrap())
        const venueLanPorts = (await getVenueLanPorts({
          params: { tenantId, venueId: apDetails?.venueId }
        }, true).unwrap())?.filter(item => item.model === apDetails?.model)?.[0]
        const venueSettings = (await getVenueSettings({
          params: { tenantId, venueId: apDetails?.venueId } }, true).unwrap())
        const modelCaps = apCaps.apModels?.filter(item => item.model === apDetails?.model)?.[0]

        const lanPorts = (apLanPorts?.useVenueSettings
          ? venueLanPorts : apLanPorts) as WifiApSetting
        setVenue(venue)
        setVenueLanPorts(venueLanPorts)
        setSelectedModel(lanPorts)
        setSelectedModelCaps(modelCaps as CapabilitiesApModel)
        setSelectedPortCaps(modelCaps?.lanPorts?.[activeTabIndex] as LanPort)
        setUseVenueSettings(apLanPorts?.useVenueSettings ?? true)
        setIsDhcpEnabled(venueSettings?.dhcpServiceSetting?.enabled ?? false)
        setLanData(lanPorts?.lanPorts as LanPort[])
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
    updateEditContext(formRef?.current as StepsFormInstance, useVenueSettings)
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
    updateEditContext(formRef?.current as StepsFormInstance, useVenueSettings)
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
        const payload = {
          lanPorts: values?.lan,
          useVenueSettings: false
        }
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
      return idx == index
        ? formRef?.current?.getFieldsValue()?.lan?.[idx]
        : lanData?.[idx]})) as LanPort[]

    setLanData(newLanData)
  }

  const updateEditContext = (form: StepsFormInstance, useVenueSettings: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'LAN Port' }),
      isDirty: checkFormIsDirty(form as StepsFormInstance, useVenueSettings),
      hasError: checkFormIsInvalid(form as StepsFormInstance),
      updateChanges: () => handleFinish(form?.getFieldsValue() as WifiApSetting),
      discardChanges: () => handleDiscard()
    })
  }

  const checkFormIsInvalid = (form: StepsFormInstance) => {
    return form?.getFieldsError().map(item => item.errors).flat().length > 0
  }

  const checkFormIsDirty = (form: StepsFormInstance, useVenueSettings: boolean) => {
    const newData = {
      lanPorts: form?.getFieldsValue()?.lan,
      useVenueSettings: useVenueSettings
    }
    return !!apLanPorts && !isEqual(apLanPorts, newData)
  }

  const navigateToVenue = (venueId: string | undefined) => {
    navigate(`../venues/${venueId}/venue-details/overview`)
  }

  return <Loader states={[{
    isLoading: formInitializing,
    isFetching: isApLanPortsUpdating || isApLanPortsResetting
  }]}>
    {selectedModel?.lanPorts
      ? <StepsForm
        formRef={formRef}
        onFinish={handleFinish}
        onFormChange={handleFormChange}
        onCancel={() => navigate({
          ...basePath,
          pathname: `${basePath.pathname}/wifi/${serialNumber}/details/overview`
        })
        }
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm
          initialValues={{ lan: selectedModel?.lanPorts }}
        >
          <Row gutter={24}>
            <Col span={10}>
              <SettingMessage showButton={!!selectedModel?.lanPorts} />
            </Col>
            <Col span={24}>
              <Form.Item
                hidden={true}
                name='useVenueSettings'
                initialValue={useVenueSettings}
                children={<Switch checked={useVenueSettings} />}
              />
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
        </StepsForm.StepForm>
      </StepsForm>
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
