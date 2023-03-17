import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { useIsSplitOn, Features }      from '@acx-ui/feature-toggle'
import { countryCodes, usePreference } from '@acx-ui/rc/components'

import { MessageMapping } from '../MessageMapping'


const MapRegionFormItem = () => {
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const {
    data: preferenceData,
    currentMapRegion,
    update: updatePreferences,
    getReqState,
    updateReqState
  } = usePreference()

  const handleMapRegionChange = async (regionCode:string) => {
    if (!regionCode) return
    const payload = {
      global: { ...preferenceData?.global, mapRegion: regionCode }
    }

    updatePreferences({ newData: payload })
  }

  const isLoadingPreference = getReqState.isLoading || getReqState.isFetching
  const isUpdatingPreference = updateReqState.isLoading

  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Map Region' })}
        >
          {isMapEnabled ? (
            <Select
              value={currentMapRegion}
              options={countryCodes}
              onChange={handleMapRegionChange}
              showSearch
              allowClear
              optionFilterProp='label'
              disabled={isUpdatingPreference || isLoadingPreference}
            />
          ) :
            $t(MessageMapping.map_region_not_enabled_message)
          }
        </Form.Item>
        <Typography.Paragraph className='description greyText'>
          {$t(MessageMapping.map_region_description)}
        </Typography.Paragraph>
      </Col>
    </Row>
  )
}

export { MapRegionFormItem }