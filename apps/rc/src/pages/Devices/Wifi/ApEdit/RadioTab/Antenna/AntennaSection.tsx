import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row }  from 'antd'
import { cloneDeep, find } from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { AnchorContext, Loader, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { ApAntennaTypeSelector }                  from '@acx-ui/rc/components'
import {
  useLazyGetApAntennaTypeSettingsQuery,
  useLazyGetVenueAntennaTypeQuery,
  useUpdateApAntennaTypeSettingsMutation
} from '@acx-ui/rc/services'
import { ApAntennaTypeEnum, ApAntennaTypeSettings, VenueApAntennaTypeSettings } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'

export type paramsType = {
  tenantId?: string
  venueId: string
  serialNumber: string
}

export function AntennaSection () {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { apData: apDetails, venueData } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const { serialNumber } = useParams()

  const form = Form.useFormInstance()

  const isUseVenueSettingsRef = useRef<boolean>(true)
  const venueAntennaTypeRef = useRef<VenueApAntennaTypeSettings>()
  const customAntennaTypeRef = useRef<ApAntennaTypeSettings>()
  const paramsRef = useRef<paramsType>()

  const [antennaType, setAntennaType] = useState({} as ApAntennaTypeSettings)
  const [formInitializing, setFormInitializing] = useState(true)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [getVenueAntennaType] = useLazyGetVenueAntennaTypeQuery()
  const [getApAntennaType] = useLazyGetApAntennaTypeSettingsQuery()

  const [updateApAntTypeSettings, { isLoading: isUpdatingAntTypeSettings }]
   = useUpdateApAntennaTypeSettingsMutation()

  const venueId = venueData?.id

  useEffect(() => {
    if (apDetails && venueId) {
      const { model } = apDetails
      paramsRef.current = {
        venueId: venueId,
        serialNumber: serialNumber!
      }
      const setData = async () => {
        const apAntType = (await getApAntennaType({
          params: { venueId, serialNumber },
          enableRbac: isUseRbacApi
        }).unwrap())

        customAntennaTypeRef.current = cloneDeep(apAntType)

        const venueAntType = (await getVenueAntennaType({
          params: { venueId },
          enableRbac: isUseRbacApi
        }, true).unwrap())

        if (venueAntType) {
          // eslint-disable-next-line max-len
          const findSettings = find(venueAntType, (antTypeSettings: VenueApAntennaTypeSettings) => antTypeSettings.model === model)
          if (findSettings) {
            venueAntennaTypeRef.current = findSettings
          }
        }

        setIsUseVenueSettings(apAntType.useVenueSettings)
        isUseVenueSettingsRef.current = apAntType.useVenueSettings

        setAntennaType(apAntType)
        setFormInitializing(false)
        setReadyToScroll?.(r => [...(new Set(r.concat('Antenna')))])
      }
      setData()
    }

  }, [venueId, apDetails])

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

  const handleAntennaTypesChanged = (value: VenueApAntennaTypeSettings | ApAntennaTypeEnum) => {
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
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'Antenna Type Change' }),
      content:
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Modifying the Antenna type will cause a reboot of this AP. Are you sure you want to continue?' }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          const params = paramsRef.current
          const payload = {
            useVenueSettings: isUseVenueSettingsRef.current,
            antennaType: form.getFieldValue('antennaType')
          }
          await updateApAntTypeSettings({ params, payload, enableRbac: isUseRbacApi }).unwrap()
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingAntTypeSettings
  }]}>
    <VenueSettingsHeader venue={venueData}
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
