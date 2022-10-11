import { useState, useEffect } from 'react'

import { Col, Form, Image, Row, Select, Space, Tabs } from 'antd'
import { isEqual, replace }                           from 'lodash'
import { useIntl }                                    from 'react-intl'

import { Loader, Subtitle }                                      from '@acx-ui/components'
import {
  useGetVenueCapabilitiesQuery,
  useGetVenueSettingsQuery,
  useGetVenueLanPortsQuery
  // useUpdateVenueLanPortsMutation
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

import { LanPortSettings } from './LanPortSettings'

const { useWatch } = Form

export function LanPorts () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const venueSettings = useGetVenueSettingsQuery({ params: { tenantId, venueId } })
  const venueLanPorts = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })
  const venueCaps = useGetVenueCapabilitiesQuery({ params: { tenantId, venueId } })
  //const [updateVenueLanPorts] = useUpdateVenueLanPortsMutation()

  const apModelsOptions = venueLanPorts?.data?.map(m => ({ label: m.model, value: m.model })) ?? []
  const [isDhcpEnabled, setIsDhcpEnabled] = useState(false)
  // const [useVenueSettings, setUseVenueSettings] = useState(false)
  const [lanPortData, setLanPortData] = useState(venueLanPorts?.data)
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const [selectedModelCaps, setSelectedModelCaps] = useState({} as ApModel)
  const [selectedPortCaps, setSelectedPortCaps] = useState({} as LanPort)

  const form = Form.useFormInstance()
  const [apModel, poeMode, poeOut, lanPorts] = [
    useWatch('model'),
    useWatch('poeMode'),
    useWatch('poeOut'),
    useWatch('lan')
  ]

  useEffect(() => {
    if (venueLanPorts?.data?.length) {
      setLanPortData(venueLanPorts?.data)
    }
  }, [venueLanPorts?.data])

  useEffect(() => {
    if (!venueSettings?.isLoading) {
      const { data } = venueSettings
      setIsDhcpEnabled(data?.dhcpServiceSetting?.enabled)
    }
  }, [venueSettings?.data])


  useEffect(() => {
    const { model, lan, poeOut } = form?.getFieldsValue()
    if (isEqual(model, apModel) && isEqual(lan, lanPorts)) {
      const landata = lanPortData?.map((item) => {
        return item.model === apModel
          ? {
            ...item,
            lanPorts: lanPorts,
            ...(poeMode && { poeMode: poeMode }),
            ...(poeOut && { poeOut: poeOut.includes(true) })
          } : item
      })

      // console.log('isEqual: ', isEqual(landata, venueLanPorts?.data))
      // console.log(landata, venueLanPorts?.data, selectedModel)

      setLanPortData(landata)
      setSelectedModel(landata?.filter(item => item.model === apModel)[0] as VenueLanPorts)
    }
  }, [poeMode, poeOut, lanPorts]) //apModel

  const onTabChange = (tab: string) => {
    const tabIndex = Number(tab.split('-')[1]) - 1
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[tabIndex] as LanPort)
  }

  const handleModelChange = (value: string) => {
    const modelCaps = venueCaps?.data?.apModels?.filter(item => item.model === value)[0]
    setSelectedModel(lanPortData?.filter(item => item.model === value)[0] as VenueLanPorts)
    setSelectedModelCaps(modelCaps as ApModel)
    setSelectedPortCaps(modelCaps?.lanPorts?.[0] as LanPort)

    form?.setFieldValue('lan', lanPortData?.filter(item => item.model === value)[0]?.lanPorts)
  }

  return (<>
    <Subtitle level={3}>{$t({ defaultMessage: 'LAN Ports' })}</Subtitle>
    <Loader states={[{ isLoading: venueLanPorts.isLoading || venueCaps.isLoading }]}>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item
            name='model'
            label={$t({ defaultMessage: 'AP Model' })}
            initialValue={null}
            children={<Select
              options={[
                { label: 'No model selected', value: null },
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
        <Col span={24}> {
          selectedModel?.lanPorts && <Tabs
            onChange={onTabChange}
          // animated={true}
          >
            { selectedModel?.lanPorts?.map((lan, index) =>
              <Tabs.TabPane tab={`LAN ${index+1}`} key={`lan-${index+1}`} forceRender={true}>
                <Col span={8}>
                  <LanPortSettings
                    form={form}
                    selectedPortCaps={selectedPortCaps}
                    selectedModel={selectedModel}
                    setSelectedPortCaps={setSelectedPortCaps}
                    selectedModelCaps={selectedModelCaps}
                    isDhcpEnabled={isDhcpEnabled}
                    // useVenueSettings={useVenueSettings}
                    lan={lan}
                    index={index}
                  />
                </Col>
              </Tabs.TabPane>
            ) }
          </Tabs>
        } </Col>
        <Col span={24}>
          <Col span={8}>
            {/* <Button onClick={async () => {
								try {
									await updateVenueLanPorts({ params: { tenantId, venueId }, payload: lanPortData }).unwrap()
									// navigate(linkToNetworks, { replace: true })
								} catch {
									showToast({
										type: 'error',
										content: 'An error occurred'
									})
								}
						}}>OK</Button> */}
            <Space style={{ padding: '16px 0' }}>
              <Image
                alt={selectedModelCaps?.lanPortPictureDownloadUrl
                  ? `AP Lan port image - ${selectedModelCaps?.model}`
                  : 'AP Lan port default image'}
                preview={false}
                src={selectedModelCaps?.lanPortPictureDownloadUrl || DefaultApModelDiagram}
              />
            </Space>
          </Col>
        </Col>
      </Row>
    </Loader>
  </>)
}

export function toReadablePoeMode (poeMode:string) {
  const replaced = replace(poeMode, '-', '/')
  return replace(replaced, '_', ' ')
}