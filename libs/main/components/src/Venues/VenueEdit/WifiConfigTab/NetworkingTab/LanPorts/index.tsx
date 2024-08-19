import { useContext, useState, useEffect, useRef } from 'react'

import { Col, Form, Image, Row, Select, Space, Tooltip } from 'antd'
import { isEqual }                                       from 'lodash'
import { useIntl }                                       from 'react-intl'

import { AnchorContext, Button, Loader, Tabs }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { LanPortPoeSettings, LanPortSettings, ConvertPoeOutToFormData }
  from '@acx-ui/rc/components'
import {
  useGetVenueSettingsQuery,
  useGetVenueLanPortsQuery,
  useGetDefaultVenueLanPortsQuery,
  useUpdateVenueLanPortsMutation,
  useGetVenueTemplateSettingsQuery,
  useGetVenueTemplateLanPortsQuery,
  useUpdateVenueTemplateLanPortsMutation,
  useGetDHCPProfileListQuery,
  useGetDhcpTemplateListQuery
} from '@acx-ui/rc/services'
import {
  CapabilitiesApModel,
  DHCPSaveData,
  LanPort,
  useConfigTemplate,
  VenueLanPorts,
  VenueSettings,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

import { VenueUtilityContext }            from '../..'
import DefaultApModelDiagram              from '../../../../assets/images/aps/ap-model-placeholder.png'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { VenueEditContext } from '../../../index'


const { useWatch } = Form

const useIsVenueDhcpEnabled = (venueId: string | undefined) => {
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? enableTemplateRbac : isWifiRbacEnabled

  const { data: venueSettings } = useVenueConfigTemplateQueryFnSwitcher<VenueSettings>({
    useQueryFn: useGetVenueSettingsQuery,
    useTemplateQueryFn: useGetVenueTemplateSettingsQuery,
    skip: resolvedRbacEnabled
  })

  const queryPayload = {
    fields: ['id', 'venueIds'],
    filters: { venueIds: [venueId] }
  }
  const { data: dhcpList } = useVenueConfigTemplateQueryFnSwitcher<DHCPSaveData[]>({
    useQueryFn: useGetDHCPProfileListQuery,
    useTemplateQueryFn: useGetDhcpTemplateListQuery,
    skip: !resolvedRbacEnabled,
    payload: queryPayload,
    templatePayload: queryPayload,
    enableRbac: resolvedRbacEnabled
  })

  return resolvedRbacEnabled
    ? !!dhcpList?.[0]
    : venueSettings?.dhcpServiceSetting?.enabled ?? false
}

export function LanPorts () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const customGuiChagedRef = useRef(false)
  const { venueApCaps, isLoadingVenueApCaps } = useContext(VenueUtilityContext)
  const isDhcpEnabled = useIsVenueDhcpEnabled(venueId)
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isLanPortResetEnabled = useIsSplitOn(Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled

  const { data: defaultVenueLanPorts, isLoading: isDefaultPortsLoading } =
    useGetDefaultVenueLanPortsQuery({ params: { venueId } }, { skip: !isLanPortResetEnabled })

  const venueLanPorts = useVenueConfigTemplateQueryFnSwitcher<VenueLanPorts[]>({
    useQueryFn: useGetVenueLanPortsQuery,
    useTemplateQueryFn: useGetVenueTemplateLanPortsQuery,
    enableRbac: isWifiRbacEnabled
  })

  // eslint-disable-next-line max-len
  const [updateVenueLanPorts, { isLoading: isUpdatingVenueLanPorts }] = useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueLanPortsMutation,
    useUpdateVenueTemplateLanPortsMutation
  )

  const apModelsOptions = venueLanPorts?.data?.map(m => ({ label: m.model, value: m.model })) ?? []
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [lanPortOrinData, setLanPortOrinData] = useState(venueLanPorts?.data)
  const [lanPortData, setLanPortData] = useState(venueLanPorts?.data)
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as CapabilitiesApModel)
  const [selectedPortCaps, setSelectedPortCaps] = useState({} as LanPort)

  const supportTrunkPortUntaggedVlan = useIsSplitOn(Features.WIFI_TRUNK_PORT_UNTAGGED_VLAN_TOGGLE)

  const form = Form.useFormInstance()
  const [apModel, apPoeMode, lanPoeOut, lanPorts] = [
    useWatch('model'),
    useWatch('poeMode'),
    useWatch('poeOut'),
    useWatch('lan')
  ]

  useEffect(() => {
    if (venueLanPorts?.data?.length) {
      setLanPortData(venueLanPorts?.data)
      setLanPortOrinData(venueLanPorts?.data)

      setReadyToScroll?.(r => [...(new Set(r.concat('LAN-Ports')))])
    }
  }, [setReadyToScroll, venueLanPorts?.data])

  useEffect(() => {
    const { model, lan, poeOut, poeMode } = form?.getFieldsValue()

    //if (isEqual(model, apModel) && (isEqual(lan, lanPorts))) {
    if (customGuiChagedRef.current && isEqual(model, apModel)) {
      const newData = lanPortData?.map((item) => {
        return item.model === apModel
          ? {
            ...item,
            lanPorts: lan,
            ...(poeMode && { poeMode: poeMode }),
            ...(poeOut && { poeOut: poeOut[activeTabIndex] })
          } : item
      }) as VenueLanPorts[]

      setEditContextData && setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        tabTitle: $t({ defaultMessage: 'Networking' }),
        isDirty: !isEqual(newData, lanPortOrinData),
        hasError: form.getFieldsError().map(item => item.errors).flat().length > 0
      })

      setEditNetworkingContextData && setEditNetworkingContextData({
        ...editNetworkingContextData,
        updateLanPorts: () => handleUpdateLanPorts(newData),
        discardLanPorts: () => handleDiscardLanPorts(lanPortOrinData)
      })

      setLanPortData(newData)
      setSelectedModel(getSelectedModelData(newData, apModel))

      customGuiChagedRef.current = false
    }
  }, [apPoeMode, lanPoeOut, lanPorts])

  const onTabChange = (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    setActiveTabIndex(tabIndex)
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
  }

  const handleModelChange = (value: string) => {
    const modelCaps = venueApCaps?.apModels?.filter(item => item.model === value)[0]
    const selected = getSelectedModelData(lanPortData as VenueLanPorts[], value)
    const lanPortsCap = modelCaps?.lanPorts || []
    const poeOutFormData = ConvertPoeOutToFormData(selected, lanPortsCap) as VenueLanPorts
    const tabIndex = 0

    setSelectedModel(selected)
    setSelectedModelCaps(modelCaps as CapabilitiesApModel)
    setActiveTabIndex(tabIndex)
    setSelectedPortCaps(modelCaps?.lanPorts?.[tabIndex] as LanPort)

    form?.setFieldsValue({
      ...selected,
      poeOut: poeOutFormData,
      lan: selected?.lanPorts
    })
  }

  const handleDiscardLanPorts = async (orinData?: VenueLanPorts[]) => {
    const data = (orinData ?? lanPortOrinData) as VenueLanPorts[]
    const selected = getSelectedModelData(data, apModel)
    setLanPortData(data)
    setLanPortOrinData(data)

    form?.setFieldsValue({
      ...selected,
      poeOut: Array(form.getFieldValue('poeOut')?.length).fill(selected?.poeOut),
      lan: selected?.lanPorts
    })
  }

  const handleUpdateLanPorts = async (data?: VenueLanPorts[]) => {
    try {
      setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      const payload = data ?? lanPortData
      if (payload) {
        setLanPortData(payload)
        setLanPortOrinData(payload)
        await updateVenueLanPorts({
          params: { tenantId, venueId },
          payload,
          enableRbac: resolvedRbacEnabled
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGUIChanged = (fieldName: string) => {
    customGuiChagedRef.current = true
  }

  const handleResetDefaultSettings = () => {
    if (!defaultVenueLanPorts || !apModel || isDefaultPortsLoading) {
      return
    }

    const defaultLanPorts = defaultVenueLanPorts.filter(lanPort => lanPort.model === apModel)?.[0]
    setSelectedModel(defaultLanPorts)
    form?.setFieldsValue({
      ...defaultLanPorts,
      poeOut: Array(form.getFieldValue('poeOut')?.length).fill(defaultLanPorts?.poeOut),
      lan: defaultLanPorts?.lanPorts
    })

    customGuiChagedRef.current = true
  }

  return (<Loader states={[{
    isLoading: venueLanPorts.isLoading || isLoadingVenueApCaps,
    isFetching: isUpdatingVenueLanPorts
  }]}>
    <Row gutter={24}>
      <Col span={8}>
        <Form.Item
          name='model'
          label={$t({ defaultMessage: 'AP Model' })}
          initialValue={null}
          children={<Select
            data-testid='apModelSelect'
            options={[
              { label: $t({ defaultMessage: 'No model selected' }), value: null },
              ...apModelsOptions
            ]}
            onChange={handleModelChange}
          />}
        />
        <LanPortPoeSettings
          selectedModel={selectedModel}
          selectedModelCaps={selectedModelCaps}
          onGUIChanged={handleGUIChanged}
        />
      </Col>
      {!isTemplate && isLanPortResetEnabled && apModel &&
      <Col style={{ paddingLeft: '0px', paddingTop: '28px' }}>
        <Tooltip title={$t(WifiNetworkMessages.LAN_PORTS_RESET_TOOLTIP)} >
          <Button type='link' onClick={handleResetDefaultSettings}>
            {$t({ defaultMessage: 'Reset to default' })}
          </Button>
        </Tooltip>
      </Col>}
    </Row>
    <Row gutter={24}>
      <Col span={24}> {
        selectedModel?.lanPorts && <Tabs
          type='third'
          activeKey={`lan-${activeTabIndex+1}`}
          onChange={onTabChange}
        	animated={true}
        >
          { selectedModel?.lanPorts?.map((lan, index) =>
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'LAN {index}' }, { index: index+1 })}
              key={`lan-${index+1}`}
              forceRender={true}
            >
              <Row>
                <Col span={8}>
                  <LanPortSettings
                    selectedPortCaps={selectedPortCaps}
                    selectedModel={selectedModel}
                    setSelectedPortCaps={setSelectedPortCaps}
                    selectedModelCaps={selectedModelCaps}
                    isDhcpEnabled={isDhcpEnabled}
                    isTrunkPortUntaggedVlanEnabled={supportTrunkPortUntaggedVlan}
                    onGUIChanged={handleGUIChanged}
                    index={index}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
          ) }
        </Tabs>
      } </Col>
      <Col span={24}>
        <Col span={8}>
          <Space style={{ padding: '16px 0' }}>
            <Image
              alt={selectedModelCaps?.lanPortPictureDownloadUrl
                ? $t({ defaultMessage: 'AP LAN port image - {apModel}' }, {
                  apModel: selectedModelCaps?.model
                })
                : $t({ defaultMessage: 'AP LAN port default image' })}
              preview={false}
              src={selectedModelCaps?.lanPortPictureDownloadUrl || DefaultApModelDiagram}
            />
          </Space>
        </Col>
      </Col>
    </Row>
  </Loader>)
}

function getSelectedModelData (list: VenueLanPorts[], model: string) {
  return list?.filter(item => item.model === model)?.[0]
}
