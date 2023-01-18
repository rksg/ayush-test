import { useState, useEffect } from 'react'

import { DEFAULT_ID }                         from '@googlemaps/js-api-loader'
import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { showToast }                                           from '@acx-ui/components'
import { get }                                                 from '@acx-ui/config'
import { useIsSplitOn, Features }                              from '@acx-ui/feature-toggle'
import { useGetPreferencesQuery, useUpdatePreferenceMutation } from '@acx-ui/rc/services'
import { COUNTRY_CODE }                                        from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'

import { MessageMapping } from '../MessageMapping'

const countryCodes = COUNTRY_CODE.map(item=> ({
  label: item.name,
  value: item.code
}))

const MapRegionFormItem = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const [currentRegion, setCurrentRegion] = useState('')
  const { data: preferenceData, isLoading: isLoadingPreference, isFetching: isFetchingPreference }
    = useGetPreferencesQuery({ params })
  const [updatePreferences, { isLoading: isUpdatingPreference }] = useUpdatePreferenceMutation()

  const handleMapRegionChange = async (regionCode:string) => {
    if (!regionCode) return
    const payload = {
      global: { ...preferenceData?.global, mapRegion: regionCode }
    }

    try {
      await updatePreferences({ params, payload }).unwrap()

      setCurrentRegion(regionCode)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const updateMapRegion = (regionCode: string) => {
    if (regionCode) {
      const gKey= get('GOOGLE_MAPS_KEY')
      const gMapElem = document.getElementById(DEFAULT_ID)

      // FIXME: should update loader config via @googlemaps/js-api-loader API.
      //        but it is still an open issue(https://github.com/googlemaps/js-api-loader/issues/100).
      if (gMapElem) {
        gMapElem.remove()
      }

      const script = document.createElement('script')
      script.id = DEFAULT_ID
      script.onerror = () => {
        // eslint-disable-next-line no-console
        console.log('Failed to load google maps key from env')
      }

      script.onload = () => {
        // eslint-disable-next-line no-console
        console.log('google maps key fetched successfully')
      }

      // eslint-disable-next-line max-len
      script.src = `https://maps.googleapis.com/maps/api/js?key=${gKey}&region=${regionCode}&libraries=places&language=en`
      document.head.appendChild(script)
    }
  }

  useEffect(() => {
    if (isMapEnabled)
      updateMapRegion(currentRegion)
  }, [currentRegion, isMapEnabled])

  useEffect(() => {
    if (preferenceData?.global.mapRegion)
      setCurrentRegion(preferenceData?.global.mapRegion)
  }, [preferenceData])


  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Map Region' })}
        >
          {isMapEnabled ? (
            <Select
              value={currentRegion}
              options={countryCodes}
              onChange={handleMapRegionChange}
              showSearch
              allowClear
              optionFilterProp='label'
              disabled={isUpdatingPreference || isLoadingPreference || isFetchingPreference}
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