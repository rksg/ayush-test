import { useContext, useRef, useState, useEffect } from 'react'

import { Col, Form, Image, Row, Space, Switch } from 'antd'
import { isEqual }                              from 'lodash'
import { FormattedMessage, useIntl }            from 'react-intl'

import {
  Button,
  Loader,
  showToast,
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
  const venueBasePath = useTenantLink('')

  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const formRef = useRef<StepsFormInstance<WifiApSetting>>()
  const { data: apDetails } = useGetApQuery({ params: { tenantId, serialNumber } })
  const { data: apLanPorts } = useGetApLanPortsQuery({ params: { tenantId, serialNumber } })
  const { data: apCaps } = useGetApCapabilitiesQuery({ params: { tenantId, serialNumber } })

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
  // TODO: rbac
  const isAllowUpdate = true // this.rbacService.isRoleAllowed('UpdateWifiApSetting');
  const isAllowReset = true // this.rbacService.isRoleAllowed('ResetWifiApSetting');

  useEffect(() => {
    if (apDetails && apLanPorts && apCaps) {
      const setData = async () => {
        const venue = (await getVenue({
          params: { tenantId, venueId: apDetails.venueId } }, true).unwrap())
        const venueLanPorts = (await getVenueLanPorts({
          params: { tenantId, venueId: apDetails.venueId }
        }, true).unwrap()).filter(item => item.model === apDetails.model)?.[0]
        const venueSettings = (await getVenueSettings({
          params: { tenantId, venueId: apDetails.venueId } }, true).unwrap())
        const modelCaps = apCaps.apModels?.filter(item => item.model === apDetails?.model)?.[0]

        setVenue(venue)
        setVenueLanPorts(venueLanPorts)
        setSelectedModel((apLanPorts?.useVenueSettings
          ? venueLanPorts : apLanPorts) as WifiApSetting)
        setSelectedModelCaps(modelCaps as CapabilitiesApModel)
        setSelectedPortCaps(modelCaps?.lanPorts?.[0] as LanPort)
        setUseVenueSettings(apLanPorts?.useVenueSettings)
        setIsDhcpEnabled(venueSettings?.dhcpServiceSetting?.enabled ?? false)

        formRef?.current?.setFieldsValue({
          ...apLanPorts,
          lan: apLanPorts?.lanPorts
        })
      }
      setData()
    }
  }, [apDetails, apLanPorts, apCaps])

  const onTabChange = (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
  }

  const handleCustomize = async (useVenueSettings: boolean) => {
    // console.log('useVenueSettings: ', useVenueSettings)
    const lanPorts = (useVenueSettings ? venueLanPorts : apLanPorts) as WifiApSetting
    setUseVenueSettings(useVenueSettings)
    setSelectedModel(lanPorts)

    formRef?.current?.setFieldsValue({
      ...lanPorts,
      lan: lanPorts?.lanPorts,
      useVenueSettings: useVenueSettings
    })
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'LAN Port' }),
      isDirty: checkFormIsDirty(formRef?.current as StepsFormInstance, useVenueSettings),
      hasError: checkFormIsInvalid(formRef?.current as StepsFormInstance),
      updateChanges: () => handleFinish(formRef?.current?.getFieldsValue() as WifiApSetting),
      discardChanges: () => handleDiscard()
    })
  }

  const handleFinish = async (values: WifiApSetting) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      setUseVenueSettings(values?.useVenueSettings) ////
      if (values?.useVenueSettings) {
        await resetApCustomization({ params: { tenantId, serialNumber } }).unwrap()
      } else {
        const payload = {
          lanPorts: values?.lan,
          useVenueSettings: false
        }
        await updateApCustomization({ params: { tenantId, serialNumber }, payload }).unwrap()
      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleDiscard = async () => {
    setUseVenueSettings(apLanPorts?.useVenueSettings ?? false)
    formRef?.current?.setFieldsValue({
      lan: apLanPorts?.lanPorts,
      useVenueSettings: apLanPorts?.useVenueSettings
    })
  }

  const handleFormChange = async () => {
    setSelectedModel({
      ...selectedModel,
      lanPorts: formRef?.current?.getFieldsValue()?.lan as LanPort[]
    })

    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'LAN Port' }),
      isDirty: checkFormIsDirty(formRef?.current as StepsFormInstance, useVenueSettings),
      hasError: checkFormIsInvalid(formRef?.current as StepsFormInstance),
      updateChanges: () => handleFinish(formRef?.current?.getFieldsValue() as WifiApSetting),
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
    return !isEqual(apLanPorts, newData)
  }

  const redirectToVenue = (venueId: string | undefined) => {
    navigate({
      // ...venueBasePath,
      // pathname: `${venueId}/venue-details/overview`
    }, { replace: true })
  }

  return <StepsForm
    formRef={formRef}
    onFinish={handleFinish}
    onFormChange={handleFormChange}
    onCancel={() => navigate({
      ...basePath,
      pathname: `${basePath.pathname}/aps/${serialNumber}/details/overview`
    })
    }
    buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
  >
    <StepsForm.StepForm>
      <Loader states={[{
        isLoading: !selectedModel?.lanPorts?.length,
        isFetching: isApLanPortsUpdating || isApLanPortsResetting
      }]}>
        <Row gutter={24}>
          <Col span={10}>
            {<Space style={{ display: 'flex', justifyContent: 'space-between' }}>
              {useVenueSettings
                ? <FormattedMessage
                  defaultMessage={'Currently using LAN port settings of the venue ({venue})'}
                  values={{
                    venue: <Button type='link' size='small' onClick={() => redirectToVenue(venue?.id)}>{venue?.name}</Button>
                  }}/>
                : $t({ defaultMessage: 'Custom settings' })
              }
              <Button type='link'
                size='small'
                disabled={useVenueSettings ? !isAllowUpdate : !isAllowReset}
                onClick={() => handleCustomize(!useVenueSettings)}
              > {useVenueSettings
                  ? $t({ defaultMessage: 'Customize' })
                  : $t({ defaultMessage: 'Use Venue Settings' })
                }</Button>
            </Space>}
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
                        // form={formRef.current}
                        data={selectedModel?.lanPorts?.[index]} //
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
          <Col span={24}>
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
          </Col>
        </Row>
      </Loader>
    </StepsForm.StepForm>
  </StepsForm>
}