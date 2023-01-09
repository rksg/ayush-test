import { useState, useEffect } from 'react'

import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { cssStr }                                              from '@acx-ui/components'
import { useIsSplitOn, Features }                              from '@acx-ui/feature-toggle'
import { useGetPreferencesQuery, useUpdatePreferenceMutation } from '@acx-ui/rc/services'
import { COUNTRY_CODE }                                        from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'

import { MessageMapping } from './MessageMapping'

const countryCodes = COUNTRY_CODE.map(item=> ({
  label: item.name,
  value: item.code
}))

const MapRegionFormItem = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const [currentRegion, setCurrentRegion] = useState('US')
  const preferenceData = useGetPreferencesQuery({ params })
  const [updatePreferences, { isLoading: isUpdatingPreference }] = useUpdatePreferenceMutation()


  const handleMapRegionChange = (regionCode:string) => {
    setCurrentRegion(regionCode)
    saveMapRegion(regionCode)
  }

  const saveMapRegion = (regionCode: string) => {
    // const mapRegion= {
    //   mspRegion: regionCode
    // }

    const payload = {
      global: { ...preferenceData?.data?.global, mapRegion: regionCode }
    }

    updatePreferences({ params, payload })
  }

  const updateMapRegion = (regionCode: string) => {
    if (regionCode && regionCode !== '') {
      const script = document.createElement('script')
      // const key = this.helpLinksService.getGlobalValue('GoogleMapsApiKey');
      const key =''
      script.onerror = () => {
        // eslint-disable-next-line no-console
        console.log('Failed to load google maps key from env')
      }

      script.onload = () => {
        // CONFIRM"
        // window['showGMap'] = true
        // eslint-disable-next-line no-console
        console.log('google maps key fetched successfully')
      }

      // eslint-disable-next-line max-len
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + key + `&region=${regionCode}&libraries=places&language=en`
      if (document.currentScript) {
        document.currentScript.parentNode?.insertBefore(script, document.currentScript)
      } else {
        (document.head || document.getElementsByTagName('head')[0]).appendChild(script)
      }
    }
  }

  useEffect(() => {
    updateMapRegion(currentRegion)
  }, [currentRegion])


  // const regionLabel = _.find(countryCodes, { code: currentRegion })

  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Map Region' })}
        >
          <Select
            value={currentRegion}
            options={countryCodes}
            onChange={handleMapRegionChange}
            showSearch
            allowClear
            optionFilterProp='label'
            style={{ width: '200px' }}
          />
        </Form.Item>
        <Typography.Paragraph style={{ color: cssStr('--acx-neutrals-50') }}>
          {$t(MessageMapping.map_region_description)}
        </Typography.Paragraph>
      </Col>
    </Row>
  )
}

export { MapRegionFormItem }