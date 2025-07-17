/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Row }        from 'antd'
import { cloneDeep, find } from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { AnchorContext, Loader, showActionModal }                                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { ApExtAntennaForm }                                                                     from '@acx-ui/rc/components'
import {
  useLazyGetApExternalAntennaSettingsQuery,
  useLazyGetApExternalAntennaSettingsV1001Query,
  useLazyGetApGroupExternalAntennaQuery,
  useLazyGetVenueExternalAntennaQuery,
  useUpdateApExternalAntennaSettingsMutation, useUpdateApExternalAntennaSettingsV1001Mutation
} from '@acx-ui/rc/services'
import {
  ApExternalAntennaSettings,
  ApExternalAntennaSettingsV1001,
  cleanExtModel,
  ExternalAntenna
} from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { VenueOrApGroupSettingsHeader } from '../../VenueOrApGroupSettingsHeader'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'

import { paramsType } from './AntennaSection'



export function ExternalAntennaSettings () {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase3Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { apData: apDetails, apCapabilities, venueData } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const { serialNumber } = useParams()

  const isUseVenueSettingsRef = useRef<boolean>(true)
  const venueExtAntennaRef = useRef<ExternalAntenna>()
  const customExtAntennaRef = useRef<ExternalAntenna>()
  const paramsRef = useRef<paramsType>()

  const [formInitializing, setFormInitializing] = useState(true)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [initExtAntenna, setInitExtAntenna] = useState({} as ExternalAntenna)
  const [extAntenna, setExtAntenna] = useState({} as ExternalAntenna)

  const [getVenueExtAntenna] = useLazyGetVenueExternalAntennaQuery()
  const [getApGroupExtAntenna] = useLazyGetApGroupExternalAntennaQuery()
  const [getApExtAntenna] = useLazyGetApExternalAntennaSettingsQuery()
  const [getApExtAntennaV1001] = useLazyGetApExternalAntennaSettingsV1001Query()

  const [updateApExtAntSettings, { isLoading: isUpdatingExtAntSettings }]
   = useUpdateApExternalAntennaSettingsMutation()
  const [updateApExtAntSettingsV1001, { isLoading: isUpdatingExtAntSettingsV1001 }]
    = useUpdateApExternalAntennaSettingsV1001Mutation()

  const venueId = venueData?.id

  useEffect(() => {
    if (apDetails && venueId) {
      const { model } = apDetails
      paramsRef.current = {
        venueId: venueId,
        serialNumber: serialNumber!
      }

      const convertToFormData = (data: ExternalAntenna) => {
        const capExternalAntenna = apCapabilities?.externalAntenna
        if (data.enable24G === false && data.gain24G === undefined) {
          data.gain24G = capExternalAntenna?.gain24G || null
        }
        if (data.enable50G === false && data.gain50G === undefined) {
          data.gain50G = capExternalAntenna?.gain50G || null
        }
        data.supportDisable = capExternalAntenna?.supportDisable ?? null
        data.coupled = capExternalAntenna?.coupled || undefined

        return data
      }

      const setData = async () => {
        const apExtAnt = isApGroupMoreParameterPhase3Enabled
          ? (await getApExtAntennaV1001({
            params: { venueId, serialNumber }
          }).unwrap())
          : (await getApExtAntenna({
            params: { venueId, serialNumber }
          }).unwrap())

        const externalAntennaObject = cloneDeep(apExtAnt)
        if (externalAntennaObject.externalAntenna) {
          const apExtAntSettings = convertToFormData(externalAntennaObject.externalAntenna)
          customExtAntennaRef.current = apExtAntSettings
          setExtAntenna(apExtAntSettings)
          setInitExtAntenna(cloneDeep(apExtAntSettings))
        }

        const venueExtAnt = (await getVenueExtAntenna({ params: { venueId } }, true).unwrap())

        const apGroupExtAnt = (await getApGroupExtAntenna({
          // eslint-disable-next-line max-len
          params: { venueId, apGroupId: apDetails.apGroupId }, skip: !isApGroupMoreParameterPhase3Enabled
        }, true).unwrap())

        // eslint-disable-next-line max-len
        const findSettings = find(
          apDetails.apGroupId ? apGroupExtAnt.externalAntennaSettings : venueExtAnt,
          (extAntSettings: ExternalAntenna) => extAntSettings.model === model)
        if (findSettings) {
          venueExtAntennaRef.current = convertToFormData(cloneDeep(findSettings))
        }

        const venueOrApGroupSettings = isApGroupMoreParameterPhase3Enabled
          ? (apExtAnt as ApExternalAntennaSettingsV1001).useVenueOrApGroupSettings
          : (apExtAnt as ApExternalAntennaSettings).useVenueSettings
        setIsUseVenueSettings(venueOrApGroupSettings)
        isUseVenueSettingsRef.current = venueOrApGroupSettings


        setFormInitializing(false)
        setReadyToScroll?.(r => [...(new Set(r.concat('External-Antenna')))])
      }
      setData()
    }

  }, [venueId, apDetails])

  const handleVenueSetting = async () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    const extAnt = (isUseVenue)?
      venueExtAntennaRef.current :
      customExtAntennaRef.current

    setExtAntenna(extAnt!)

    handleFormChanged()
  }

  const handleExtAntennaChanged = (newData: ExternalAntenna) => {
    customExtAntennaRef.current = newData
    handleFormChanged()
  }


  const handleFormChanged = () => {
    setEditRadioContextData({
      ...editRadioContextData,
      updateExternalAntenna: handleUpdateExtAntenna
    })

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
  }

  const handleUpdateExtAntenna = async () => {
    const isUseVenue = isUseVenueSettingsRef.current
    const extAnt = (isUseVenue)?
      venueExtAntennaRef.current :
      customExtAntennaRef.current

    if (extAnt) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'External Antenna Settings Change' }),
        content:
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Modifying the External Antenna settings will cause a reboot of this AP. Are you sure you want to continue?' }),
        okText: $t({ defaultMessage: 'Continue' }),
        onOk: async () => {
          try {
            const params = paramsRef.current
            if (isApGroupMoreParameterPhase3Enabled) {
              const payload = {
                useVenueOrApGroupSettings: isUseVenueSettingsRef.current,
                externalAntenna: cleanExtModel(extAnt)
              }

              await updateApExtAntSettingsV1001({ params, payload }).unwrap()
            } else {
              const payload = {
                useVenueSettings: isUseVenueSettingsRef.current,
                externalAntenna: cleanExtModel(extAnt)
              }

              await updateApExtAntSettings({ params, payload }).unwrap()
            }
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        }
      })
    }
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingExtAntSettings || isUpdatingExtAntSettingsV1001
  }]}>
    { isApGroupMoreParameterPhase3Enabled
      ? <VenueOrApGroupSettingsHeader apGroupId={apDetails?.apGroupId}
        isUseVenueSettings={isUseVenueSettings}
        handleVenueSetting={handleVenueSetting} />
      : <VenueSettingsHeader venue={venueData}
        isUseVenueSettings={isUseVenueSettings}
        handleVenueSetting={handleVenueSetting} />}
    <Row gutter={24}>
      <Col span={8}>
        <ApExtAntennaForm
          apiSelectedApExternalAntenna={initExtAntenna}
          selectedApExternalAntenna={extAntenna}
          readOnly={isUseVenueSettings}
          onExternalAntennaChanged={handleExtAntennaChanged}
        />
      </Col>
    </Row>
  </Loader>
  )
}
