import { useContext, useState, useEffect, useRef } from 'react'

import { Col, Form, Image, Row, Select, Space } from 'antd'
import { isEqual }                              from 'lodash'
import { useIntl }                              from 'react-intl'

import { Loader, Tabs }                                                 from '@acx-ui/components'
import { ConvertPoeOutToFormData, LanPortPoeSettings, LanPortSettings } from '@acx-ui/rc/components'
import {
  useGetVenueSettingsQuery,
  useGetVenueLanPortsQuery,
  useUpdateVenueLanPortsMutation, useGetVenueApCapabilitiesQuery
} from '@acx-ui/rc/services'
import {
  ApModel,
  LanPort,
  VenueLanPorts
} from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

import DefaultApModelDiagram from '../../../../../../assets/images/aps/ap-model-placeholder.png'
import { VenueEditContext }  from '../../../index'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'


const { useWatch } = Form

export function LanPorts () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

  const customGuiChagedRef = useRef(false)

  const venueSettings = useGetVenueSettingsQuery({ params: { tenantId, venueId } })
  const venueLanPorts = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })
  const venueCaps = useGetVenueApCapabilitiesQuery({ params: { tenantId, venueId } })
  const [updateVenueLanPorts, {
    isLoading: isUpdatingVenueLanPorts }] = useUpdateVenueLanPortsMutation()

  const apModelsOptions = venueLanPorts?.data?.map(m => ({ label: m.model, value: m.model })) ?? []
  const [isDhcpEnabled, setIsDhcpEnabled] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [lanPortOrinData, setLanPortOrinData] = useState(venueLanPorts?.data)
  const [lanPortData, setLanPortData] = useState(venueLanPorts?.data)
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as ApModel)
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
    }
  }, [venueLanPorts?.data])

  useEffect(() => {
    if (!venueSettings?.isLoading) {
      const { data } = venueSettings
      setIsDhcpEnabled(data?.dhcpServiceSetting?.enabled || false)
    }
  }, [venueSettings?.data])

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
    const modelCaps = venueCaps?.data?.apModels?.filter(item => item.model === value)[0]
    const selected = getSelectedModelData(lanPortData as VenueLanPorts[], value)
    const lanPortsCap = modelCaps?.lanPorts || []
    const poeOutFormData = ConvertPoeOutToFormData(selected, lanPortsCap) as VenueLanPorts
    const tabIndex = 0

    setSelectedModel(selected)
    setSelectedModelCaps(modelCaps as ApModel)
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
          payload
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGUIChanged = (fieldName: string) => {
    //console.log('GUI Changed: '+ fieldName)
    customGuiChagedRef.current = true
  }

  return (<Loader states={[{
    isLoading: venueLanPorts.isLoading || venueCaps.isLoading,
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
                    isTrunkPortUntagedVlanEnabled={supportTrunkPortUntaggedVlan}
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
