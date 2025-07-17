import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row }  from 'antd'
import { cloneDeep, find } from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { AnchorContext, Loader, showActionModal }                                       from '@acx-ui/components'
import { Features, useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { ApAntennaTypeSelector }                                                        from '@acx-ui/rc/components'
import {
  useLazyGetApAntennaTypeSettingsQuery,
  useLazyGetApAntennaTypeSettingsV1001Query,
  useLazyGetApGroupAntennaTypeQuery,
  useLazyGetVenueAntennaTypeQuery,
  useUpdateApAntennaTypeSettingsMutation, useUpdateApAntennaTypeSettingsV1001Mutation
} from '@acx-ui/rc/services'
import {
  ApAntennaTypeEnum,
  ApAntennaTypeSettings,
  ApAntennaTypeSettingsV1001,
  VenueApAntennaTypeSettings
} from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { VenueOrApGroupSettingsHeader } from '../../VenueOrApGroupSettingsHeader'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'

export type paramsType = {
  tenantId?: string
  venueId: string
  serialNumber: string
}

export function AntennaSection () {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

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
  const customAntennaTypeRef = useRef<ApAntennaTypeSettings | ApAntennaTypeSettingsV1001>()
  const paramsRef = useRef<paramsType>()

  // eslint-disable-next-line max-len
  const [antennaType, setAntennaType] = useState({} as ApAntennaTypeSettings | ApAntennaTypeSettingsV1001)
  const [formInitializing, setFormInitializing] = useState(true)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [getVenueAntennaType] = useLazyGetVenueAntennaTypeQuery()
  const [getApGroupAntennaType] = useLazyGetApGroupAntennaTypeQuery()
  const [getApAntennaType] = useLazyGetApAntennaTypeSettingsQuery()
  const [getApAntennaTypeV1001] = useLazyGetApAntennaTypeSettingsV1001Query()

  const [updateApAntTypeSettings, { isLoading: isUpdatingAntTypeSettings }]
   = useUpdateApAntennaTypeSettingsMutation()
  const [updateApAntTypeSettingsV1001, { isLoading: isUpdatingAntTypeSettingsV1001 }]
    = useUpdateApAntennaTypeSettingsV1001Mutation()

  const venueId = venueData?.id

  useEffect(() => {
    if (apDetails && venueId) {
      const { model } = apDetails
      paramsRef.current = {
        venueId: venueId,
        serialNumber: serialNumber!
      }
      const setData = async () => {
        const apAntType = isApGroupMoreParameterPhase1Enabled
          ? (await getApAntennaTypeV1001({
            params: { venueId, serialNumber }
          }).unwrap())
          : (await getApAntennaType({
            params: { venueId, serialNumber },
            enableRbac: isUseRbacApi
          }).unwrap())

        customAntennaTypeRef.current = cloneDeep(apAntType)

        const venueAntType = (await getVenueAntennaType({
          params: { venueId },
          enableRbac: isUseRbacApi
        }, true).unwrap())

        const apGroupAntType = (await getApGroupAntennaType({
          // eslint-disable-next-line max-len
          params: { venueId, apGroupId: apDetails.apGroupId }, skip: !isApGroupMoreParameterPhase1Enabled
        }, true).unwrap())

        // eslint-disable-next-line max-len
        const findSettings = find(
          apDetails.apGroupId ? apGroupAntType.antennaTypeSettings : venueAntType,
          (antTypeSettings: VenueApAntennaTypeSettings) => antTypeSettings.model === model)

        if (findSettings) {
          venueAntennaTypeRef.current = findSettings
        }

        const venueOrApGroupSettings = isApGroupMoreParameterPhase1Enabled
          ? (apAntType as ApAntennaTypeSettingsV1001).useVenueOrApGroupSettings
          : (apAntType as ApAntennaTypeSettings).useVenueSettings
        setIsUseVenueSettings(venueOrApGroupSettings)
        isUseVenueSettingsRef.current = venueOrApGroupSettings

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
          if (isApGroupMoreParameterPhase1Enabled) {
            const payload = {
              useVenueOrApGroupSettings: isUseVenueSettingsRef.current,
              antennaType: form.getFieldValue('antennaType')
            }
            await updateApAntTypeSettingsV1001({ params, payload }).unwrap()
          } else {
            const payload = {
              useVenueSettings: isUseVenueSettingsRef.current,
              antennaType: form.getFieldValue('antennaType')
            }
            await updateApAntTypeSettings({ params, payload, enableRbac: isUseRbacApi }).unwrap()
          }
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingAntTypeSettings || isUpdatingAntTypeSettingsV1001
  }]}>
    { isApGroupMoreParameterPhase1Enabled
      ? <VenueOrApGroupSettingsHeader apGroupId={apDetails?.apGroupId}
        isUseVenueSettings={isUseVenueSettings}
        handleVenueSetting={handleVenueSetting} />
      : <VenueSettingsHeader venue={venueData}
        isUseVenueSettings={isUseVenueSettings}
        handleVenueSetting={handleVenueSetting} />}
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
