import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Image, Row, Select, Space, Tooltip } from 'antd'
import { isEqual, clone, cloneDeep }                     from 'lodash'
import { useIntl }                                       from 'react-intl'

import {
  AnchorContext,
  Button,
  Loader,
  showActionModal,
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  LanPortPoeSettings,
  LanPortSettings,
  ConvertPoeOutToFormData,
  useSoftGreProfileActivation
}
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
  useGetDhcpTemplateListQuery,
  useActivateEthernetPortProfileOnVenueApModelPortIdMutation,
  useGetVenueLanPortWithEthernetSettingsQuery,
  useUpdateVenueLanPortSpecificSettingsMutation,
  useUpdateVenueLanPortSettingsMutation,
  useActivateClientIsolationOnVenueMutation,
  useDeleteClientIsolationOnVenueMutation
} from '@acx-ui/rc/services'
import {
  ApLanPortTypeEnum,
  CapabilitiesApModel,
  DHCPSaveData,
  EditPortMessages,
  isEqualLanPort,
  LanPort,
  VenueLanPortSettings,
  useConfigTemplate,
  VenueLanPorts,
  VenueSettings,
  WifiNetworkMessages,
  SoftGreState
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
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const supportTrunkPortUntaggedVlan = useIsSplitOn(Features.WIFI_TRUNK_PORT_UNTAGGED_VLAN_TOGGLE)
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isEthernetClientIsolationEnabled =
    useIsSplitOn(Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)

  const { defaultLanPortsByModelMap, isDefaultPortsLoading } =
    useGetDefaultVenueLanPortsQuery({ params: { venueId } },
      { selectFromResult: ({ data, isLoading }) => {
        return {
          defaultLanPortsByModelMap: new Map(data?.map(l => [l.model, l])),
          isDefaultPortsLoading: isLoading
        }

      }, skip: !isLanPortResetEnabled })

  const venueLanPorts = useVenueConfigTemplateQueryFnSwitcher<VenueLanPorts[]>({
    useQueryFn: (
      (isEthernetPortProfileEnabled)?
        useGetVenueLanPortWithEthernetSettingsQuery : useGetVenueLanPortsQuery
    ),
    useTemplateQueryFn: useGetVenueTemplateLanPortsQuery,
    enableRbac: isWifiRbacEnabled,
    payload: {
      isEthernetPortProfileEnabled,
      isEthernetSoftgreEnabled,
      isEthernetClientIsolationEnabled
    }
  })
  // eslint-disable-next-line max-len
  const [updateVenueLanPorts, { isLoading: isUpdatingVenueLanPorts }] = useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueLanPortsMutation,
    useUpdateVenueTemplateLanPortsMutation
  )

  const [updateActivateEthernetPortProfile] =
    useActivateEthernetPortProfileOnVenueApModelPortIdMutation()

  const [updateActivateClientIsolationPolicy] = useActivateClientIsolationOnVenueMutation()
  const [updateDeactivateClientIsolationPolicy] = useDeleteClientIsolationOnVenueMutation()
  const [updateLanPortSetting] = useUpdateVenueLanPortSettingsMutation()

  const [updateLanPortSpecificSetting] =
    useUpdateVenueLanPortSpecificSettingsMutation()

  const apModelsOptions = venueLanPorts?.data?.map(m => ({ label: m.model, value: m.model })) ?? []
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [lanPortOrinData, setLanPortOrinData] = useState(venueLanPorts?.data)
  const [lanPortData, setLanPortData] = useState(venueLanPorts?.data)
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as CapabilitiesApModel)
  const [selectedPortCaps, setSelectedPortCaps] = useState({} as LanPort)
  const [resetModels, setResetModels] = useState([] as string[])
  const { dispatch, handleUpdateSoftGreProfile } = useSoftGreProfileActivation(selectedModel)

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
    const lanPortsCap = modelCaps?.lanPorts || []
    // eslint-disable-next-line max-len
    const selected = getSelectedModelData(lanPortData as VenueLanPorts[], value)

    const poeOutFormData = ConvertPoeOutToFormData(selected, lanPortsCap) as VenueLanPorts
    const tabIndex = 0
    const selectedModel = getModelWithDefaultEthernetPortProfile(selected, lanPortsCap, tenantId)
    setSelectedModel(selectedModel)
    setSelectedModelCaps(modelCaps as CapabilitiesApModel)
    setActiveTabIndex(tabIndex)
    setSelectedPortCaps(modelCaps?.lanPorts?.[tabIndex] as LanPort)
    form?.setFieldsValue({
      ...selectedModel,
      poeOut: poeOutFormData,
      lan: selectedModel?.lanPorts
    })
  }

  const handleDiscardLanPorts = async (orinData?: VenueLanPorts[]) => {
    const data = (orinData ?? lanPortOrinData) as VenueLanPorts[]
    const selected = getSelectedModelData(data, apModel)
    setLanPortData(data)
    setLanPortOrinData(data)
    setResetModels([])
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
        if (isLanPortResetEnabled && isResetLanPort(payload)) {
          showActionModal({
            type: 'confirm',
            width: 450,
            title: $t({ defaultMessage: 'Reset Port Settings to Default' }),
            content: $t(EditPortMessages.RESET_PORT_WARNING),
            okText: $t({ defaultMessage: 'Continue' }),
            onOk: async () => {
              try {
                processUpdateVenueLanPorts(payload)
                setResetModels([])
              } catch (error) {
                console.log(error) // eslint-disable-line no-console
              }
            }
          })
        } else {
          processUpdateVenueLanPorts(payload)
        }
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleUpdateEthernetPortProfile = async (
    model:string,
    lanPort:LanPort,
    originLanPort?:LanPort
  ) => {

    // Workaround: The type will be empty if we set ethernet port profile, and this is for legacy API payload
    if(!!!lanPort.type) {
      lanPort.type = originLanPort?.type
    }

    if (lanPort.ethernetPortProfileId &&
      lanPort.ethernetPortProfileId !== originLanPort?.ethernetPortProfileId) {

      await updateActivateEthernetPortProfile({
        params: {
          venueId: venueId,
          apModel: model,
          portId: lanPort.portId,
          id: lanPort.ethernetPortProfileId
        }
      }).unwrap()
    }
  }

  const handleDeactivateClientIsolationPolicy = async (
    model:string,
    lanPort:LanPort,
    originLanPort?:LanPort
  ) => {
    const originClientIsolationId = originLanPort?.clientIsolationProfileId
    if(!originClientIsolationId) {
      return
    }

    if(originClientIsolationId || !lanPort.clientIsolationEnabled) {
      await updateDeactivateClientIsolationPolicy({
        params: {
          venueId: venueId,
          apModel: model,
          portId: lanPort.portId,
          policyId: originClientIsolationId
        }
      }).unwrap()
    }
  }
  const handleUpdateClientIsolationPolicy = async (
    model:string,
    lanPort:LanPort
  ) => {
    const clientIsolationId = lanPort.clientIsolationProfileId

    if(clientIsolationId && lanPort.clientIsolationEnabled) {
      await updateActivateClientIsolationPolicy({
        params: {
          venueId: venueId,
          apModel: model,
          portId: lanPort.portId,
          policyId: clientIsolationId
        }
      }).unwrap()
    }
  }

  const handleUpdateLanPortSettings = async (
    model:string,
    lanPort:LanPort,
    originLanPort?:LanPort
  ) => {
    const venueLanPortSetting = getVenueLanPortSettingsByLanPortData(lanPort)
    const originVenueLanPortSetting =
      (originLanPort)? getVenueLanPortSettingsByLanPortData(originLanPort): {}

    if(!isEqual(venueLanPortSetting, originVenueLanPortSetting)) {
      await updateLanPortSetting({
        params: {
          venueId: venueId,
          apModel: model,
          portId: lanPort.portId
        },
        payload: venueLanPortSetting
      }).unwrap()
    }

    // Activate Client Isolation must wait Lan settings enable client isolation saved
    if(isEthernetClientIsolationEnabled) {
      handleUpdateClientIsolationPolicy(model, lanPort)
    }
  }

  const getVenueLanPortSettingsByLanPortData = (lanPortData: LanPort):VenueLanPortSettings => ({
    enabled: lanPortData.enabled,
    clientIsolationEnabled: lanPortData.clientIsolationEnabled,
    clientIsolationSettings: lanPortData.clientIsolationSettings
  })

  const handleUpdateLanPortSpecificSettings = async (
    model:string,
    venueLanPorts:VenueLanPorts,
    originVenueLanPorts:VenueLanPorts
  ) => {

    const { lanPorts, ...rest } = venueLanPorts
    const { lanPorts: originLanPorts, ...originRest } = originVenueLanPorts

    if(!isEqual(rest, originRest)) {
      await updateLanPortSpecificSetting({
        params: {
          venueId: venueId,
          apModel: model
        },
        payload: {
          poeMode: venueLanPorts.poeMode,
          poeOut: venueLanPorts.poeOut
        }
      }).unwrap()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGUIChanged = (fieldName: string) => {
    customGuiChagedRef.current = true
  }

  const handleResetDefaultSettings = () => {
    if (!defaultLanPortsByModelMap || !apModel || isDefaultPortsLoading) {
      return
    }

    const defaultLanPorts = defaultLanPortsByModelMap.get(apModel)
    if (defaultLanPorts === undefined) return

    const defaultLanPortsData =
      getModelWithDefaultEthernetPortProfile(defaultLanPorts, selectedModelCaps.lanPorts, tenantId)

    setSelectedModel(defaultLanPortsData as VenueLanPorts)
    form?.setFieldsValue({
      ...defaultLanPortsData,
      poeOut: Array(form.getFieldValue('poeOut')?.length).fill(defaultLanPortsData?.poeOut),
      lan: defaultLanPortsData?.lanPorts
    })
    let records = clone(resetModels)
    records.push(apModel)
    setResetModels([...new Set(records)])

    defaultLanPortsData.lanPorts.forEach((lanPort, index) => {
      dispatch({
        state: SoftGreState.ResetToDefault,
        portId: lanPort.portId,
        index
      })
    })


    customGuiChagedRef.current = true
  }

  const isResetLanPort = (payload: VenueLanPorts[]) => {
    for (let model of resetModels) {
      let currentLan = payload.find(l => l.model === model)
      const originLan = lanPortOrinData?.find(o => o.model === model)
      const eqOriginLan = isEqualLanPort(currentLan!, originLan!)
      if (eqOriginLan) continue

      const defaultLan = defaultLanPortsByModelMap.get(model)
      const resetToDefault = isEqualLanPort(currentLan!, defaultLan!)
      if (resetToDefault) {
        return true
      }
    }

    return false
  }

  const processUpdateVenueLanPorts = async (payload: VenueLanPorts[]) => {
    if (isEthernetPortProfileEnabled) {
      payload.forEach((venueLanPort) => {
        const originVenueLanPort = lanPortOrinData?.find((oldVenueLanPort) => {
          return oldVenueLanPort.model === venueLanPort.model
        })

        if (originVenueLanPort) {
          // Uppdate Lan port specific settings
          handleUpdateLanPortSpecificSettings(venueLanPort.model, venueLanPort, originVenueLanPort)
        }

        venueLanPort.lanPorts.forEach((lanPort) => {
          const originLanPort = originVenueLanPort?.lanPorts.find((oldLanPort)=> {
            return oldLanPort.portId === lanPort.portId
          })
          // Update ethernet port profile
          handleUpdateEthernetPortProfile(venueLanPort.model, lanPort, originLanPort)
          // Update SoftGre Profile
          handleUpdateSoftGreProfile(venueLanPort.model, lanPort, originLanPort)

          // Before disable Client Isolation must deacticvate Client Isolation policy
          if(isEthernetClientIsolationEnabled) {
            handleDeactivateClientIsolationPolicy(venueLanPort.model, lanPort, originLanPort)
          }

          // Update Lan settings
          handleUpdateLanPortSettings(venueLanPort.model, lanPort, originLanPort)
        })
      })
    }

    setLanPortData(payload)
    setLanPortOrinData(payload)

    if (!isEthernetPortProfileEnabled) {
      await updateVenueLanPorts({
        params: { tenantId, venueId },
        payload,
        enableRbac: resolvedRbacEnabled
      }).unwrap()
    }

    setResetModels([])
  }

  return (<Loader states={[{
    isLoading: venueLanPorts.isLoading || isLoadingVenueApCaps,
    isFetching: isUpdatingVenueLanPorts
  }]}>
    <Row gutter={24}>
      <Col span={6}>
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
                    venueId={venueId}
                    dispatch={dispatch}
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

// eslint-disable-next-line max-len
function getModelWithDefaultEthernetPortProfile (selectedModel: VenueLanPorts, lanPortsCaps: LanPort[], tenantId?: string) {
  if(!selectedModel) {
    return selectedModel
  }

  const model = cloneDeep(selectedModel)
  model.lanPorts.forEach((lanPort) => {
    if (!lanPort.hasOwnProperty('ethernetPortProfileId') ||
          lanPort.ethernetPortProfileId === null) {
      const defaultType = lanPortsCaps.find(cap => cap.id === lanPort.portId)?.defaultType
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

  return model
}

