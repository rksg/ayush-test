import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row }  from 'antd'
import { cloneDeep, find } from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { AnchorContext, Loader }           from '@acx-ui/components'
import { ApAntennaTypeSelector }           from '@acx-ui/rc/components'
import {
  useLazyGetApAntennaTypeSettingsQuery,
  useLazyGetVenueAntennaTypeQuery,
  useLazyGetVenueQuery,
  useUpdateApAntennaTypeSettingsMutation
} from '@acx-ui/rc/services'
import { ApAntennaTypeEnum, ApAntennaTypeSettings, VenueExtended, VeuneApAntennaTypeSettings } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'

type paramsType = {
  tenantId: string
  venueId: string
  serialNumber: string
}

export function AntennaSection () {
  const { $t } = useIntl()
  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { apData: apDetails } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const { tenantId, serialNumber } = useParams()

  const form = Form.useFormInstance()

  const isUseVenueSettingsRef = useRef<boolean>(true)
  const venueAntennaTypeRef = useRef<VeuneApAntennaTypeSettings>()
  const customAntennaTypeRef = useRef<ApAntennaTypeSettings>()
  const paramsRef = useRef<paramsType>()

  const [antennaType, setAntennaType] = useState({} as ApAntennaTypeSettings)
  const [venue, setVenue] = useState({} as VenueExtended)
  const [formInitializing, setFormInitializing] = useState(true)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueAntennaType] = useLazyGetVenueAntennaTypeQuery()
  const [getApAntennaType] = useLazyGetApAntennaTypeSettingsQuery()

  const [updateApAntTypeSettings, { isLoading: isUpdatingAntTypeSettings }]
   = useUpdateApAntennaTypeSettingsMutation()

  useEffect(() => {
    if (apDetails) {
      const { venueId, model } = apDetails
      paramsRef.current = {
        tenantId: tenantId!,
        venueId: venueId,
        serialNumber: serialNumber!
      }
      const setData = async () => {
        const apAntType = (await getApAntennaType({ params: { venueId, serialNumber } }).unwrap())
        customAntennaTypeRef.current = cloneDeep(apAntType)

        const apVenue = (await getVenue({ params: { tenantId, venueId } }, true).unwrap())

        const venueAntType = (await getVenueAntennaType({ params: { venueId } }, true).unwrap())
        if (venueAntType) {
          // eslint-disable-next-line max-len
          const findSettings = find(venueAntType, (antTypeSettings: VeuneApAntennaTypeSettings) => antTypeSettings.model === model)
          if (findSettings) {
            venueAntennaTypeRef.current = findSettings
          }
        }

        setIsUseVenueSettings(apAntType.useVenueSettings)
        isUseVenueSettingsRef.current = apAntType.useVenueSettings

        setAntennaType(apAntType)
        setVenue(apVenue)
        setFormInitializing(false)
        setReadyToScroll?.(r => [...(new Set(r.concat('Antenna')))])
      }
      setData()
    }

  }, [apDetails])

  const handleVenueSetting = async () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    const antType = (isUseVenue)?
      venueAntennaTypeRef.current?.antennaType :
      customAntennaTypeRef.current?.antennaType

    form.setFieldValue('antennaType', antType)

    handleFormChanged()
  }

  const handleAntennaTypesChanged = (value: VeuneApAntennaTypeSettings | ApAntennaTypeEnum) => {
    const antType = value as ApAntennaTypeEnum
    customAntennaTypeRef.current = {
      useVenueSettings: isUseVenueSettingsRef.current,
      antennaType: antType
    }

    handleFormChanged()
  }

  const handleFormChanged = () => {
    setEditRadioContextData({
      ...editRadioContextData,
      updateApAntennaType: handleUpdateAntennaType
    })

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
  }

  const handleUpdateAntennaType = async () => {
    try {
      const params = paramsRef.current
      const payload = {
        useVenueSettings: isUseVenueSettingsRef.current,
        antennaType: form.getFieldValue('antennaType')
      }
      await updateApAntTypeSettings({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingAntTypeSettings
  }]}>
    <VenueSettingsHeader venue={venue}
      isUseVenueSettings={isUseVenueSettings}
      handleVenueSetting={handleVenueSetting} />
    <Row gutter={20}>
      <Col span={4}>
        <ApAntennaTypeSelector selectedApAntennaType={antennaType}
          readOnly={isUseVenueSettings}
          onAntennaTypeChanged={handleAntennaTypesChanged}
        />
      </Col>
    </Row>
  </Loader>
  )
}
