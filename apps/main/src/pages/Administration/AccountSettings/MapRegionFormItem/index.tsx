import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { useIsSplitOn, Features }      from '@acx-ui/feature-toggle'
import { countryCodes, usePreference } from '@acx-ui/rc/components'

import { MessageMapping } from '../MessageMapping'

const MapRegionFormItem = () => {
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const {
    currentMapRegion,
    updatePartial: updatePreferences,
    getReqState,
    updateReqState
  } = usePreference()

  const handleMapRegionChange = (regionCode:string) => {
    if (!regionCode) return
    const payload = {
      global: { mapRegion: regionCode }
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
              onChange={handleMapRegionChange}
              showSearch
              optionFilterProp='children'
              disabled={isUpdatingPreference || isLoadingPreference}
            >
              {countryCodes.map(({ label, value }) =>
                (<Select.Option value={value} key={value} children={label}/>)
              )}
            </Select>
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
