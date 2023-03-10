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

/*
const countryCodes = COUNTRY_CODE.map(item=> ({
  label: item.name,
  value: item.code
}))

const MapRegionFormItem = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const [currentRegion, setCurrentRegion] = useState<string>('')
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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
      setCurrentRegion(preferenceData?.global.mapRegion as string)
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
*/