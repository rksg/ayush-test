import { useContext, useState, useEffect } from 'react'

import { Col, Form, Image, Row, Select, Space, Tabs } from 'antd'
import { isEqual, replace }                           from 'lodash'
import { useIntl }                                    from 'react-intl'

import { Loader, showToast }       from '@acx-ui/components'
import {
  useGetVenueCapabilitiesQuery,
  useGetVenueSettingsQuery,
  useGetVenueLanPortsQuery,
  useUpdateVenueLanPortsMutation
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

import { LanPortSettings } from './LanPortSettings'

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

  const venueSettings = useGetVenueSettingsQuery({ params: { tenantId, venueId } })
  const venueLanPorts = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })
  const venueCaps = useGetVenueCapabilitiesQuery({ params: { tenantId, venueId } })
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

  const form = Form.useFormInstance()
  const [apModel, poeMode, lanPoeOut, lanPorts] = [
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
    const { model, lan, poeOut } = form?.getFieldsValue()
    if (isEqual(model, apModel) && isEqual(lan, lanPorts)) {
      const newData = lanPortData?.map((item) => {
        return item.model === apModel
          ? {
            ...item,
            lanPorts: lanPorts,
            ...(poeMode && item.poeMode && { poeMode: poeMode }),
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
    }
  }, [poeMode, lanPoeOut, lanPorts])

  const onTabChange = (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    setActiveTabIndex(tabIndex)
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
  }

  const handleModelChange = (value: string) => {
    const modelCaps = venueCaps?.data?.apModels?.filter(item => item.model === value)[0]
    const selected = getSelectedModelData(lanPortData as VenueLanPorts[], value)
    const tabIndex = (modelCaps?.lanPorts?.length ?? 0) <= activeTabIndex ? 0 : activeTabIndex
    setActiveTabIndex(tabIndex)
    setSelectedModel(selected)
    setSelectedModelCaps(modelCaps as ApModel)
    setSelectedPortCaps(modelCaps?.lanPorts?.[tabIndex] as LanPort)

    form?.setFieldsValue({
      ...selected,
      poeOut: Array(form.getFieldValue('poeOut')?.length).fill(selected?.poeOut),
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
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
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
            options={[
              { label: $t({ defaultMessage: 'No model selected' }), value: null },
              ...apModelsOptions
            ]}
            onChange={handleModelChange}
          />}
        />
        { selectedModelCaps?.canSupportPoeMode && <Form.Item
          name='poeMode'
          label={$t({ defaultMessage: 'PoE Operating Mode' })}
          initialValue={selectedModel?.poeMode}
          children={<Select
            options={selectedModelCaps?.poeModeCapabilities?.map(item => ({
              label: toReadablePoeMode(item), value: item
            }))}
          />}
        /> }
      </Col>
    </Row>
    <Row gutter={24}>
      <Col span={12}> {
        selectedModel?.lanPorts && <Tabs
          onChange={onTabChange}
        	animated={true}
        >
          { selectedModel?.lanPorts?.map((lan, index) =>
            <Tabs.TabPane
              tab={$t({ defaultMessage: 'LAN {index}' }, { index: index+1 })}
              key={`lan-${index+1}`}
              forceRender={true}
            >
              <Col span={16}>
                <LanPortSettings
                  selectedPortCaps={selectedPortCaps}
                  selectedModel={selectedModel}
                  setSelectedPortCaps={setSelectedPortCaps}
                  selectedModelCaps={selectedModelCaps}
                  isDhcpEnabled={isDhcpEnabled}
                  index={index}
                />
              </Col>
            </Tabs.TabPane>
          ) }
        </Tabs>
      } </Col>
      <Col span={24}>
        <Col span={8}>
          <Space style={{ padding: '16px 0' }}>
            <Image
              alt={selectedModelCaps?.lanPortPictureDownloadUrl
                ? `${$t({ defaultMessage: 'AP LAN port image' })} - ${selectedModelCaps?.model}`
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

export function toReadablePoeMode (poeMode:string) {
  const replaced = replace(poeMode, '-', '/')
  return replace(replaced, '_', ' ')
}