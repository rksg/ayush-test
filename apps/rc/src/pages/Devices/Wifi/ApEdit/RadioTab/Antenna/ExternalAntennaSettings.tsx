/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row }  from 'antd'
import { cloneDeep, find } from 'lodash'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { AnchorContext, Loader }               from '@acx-ui/components'
import { ApExtAntennaForm }                    from '@acx-ui/rc/components'
import {
  useLazyGetApExternalAntennaSettingsQuery,
  useLazyGetVenueExternalAntennaQuery,
  useUpdateApExternalAntennaSettingsMutation
} from '@acx-ui/rc/services'
import { ExternalAntenna } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'

import { paramsType } from './AntennaSection'

const cleanExtModel = (model: ExternalAntenna) => {
  let data = JSON.parse(JSON.stringify(model))

  if (data.enable24G !== undefined && data.enable24G === false) {
    delete data.gain24G
  }
  if (data.enable50G !== undefined && data.enable50G === false) {
    delete data.gain50G
  }
  return data
}

export function ExternalAntennaSettings () {
  const { $t } = useIntl()

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

  const form = Form.useFormInstance()

  const [formInitializing, setFormInitializing] = useState(true)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [initExtAntenna, setInitExtAntenna] = useState({} as ExternalAntenna)
  const [extAntenna, setExtAntenna] = useState({} as ExternalAntenna)

  const [getVenueExtAntenna] = useLazyGetVenueExternalAntennaQuery()
  const [getApExtAntenna] = useLazyGetApExternalAntennaSettingsQuery()

  const [updateApExtAntSettings, { isLoading: isUpdatingExtAntSettings }]
   = useUpdateApExternalAntennaSettingsMutation()

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
        const apExtAnt = (await getApExtAntenna({
          params: { venueId, serialNumber }
        }).unwrap())

        const { externalAntenna, useVenueSettings } = cloneDeep(apExtAnt)

        if (externalAntenna) {
          const apExtAntSettings = convertToFormData(externalAntenna)
          customExtAntennaRef.current = apExtAntSettings
          setExtAntenna(apExtAntSettings)
          setInitExtAntenna(cloneDeep(apExtAntSettings))
        }

        const venueExtAnt = (await getVenueExtAntenna({ params: { venueId } }, true).unwrap())
        if (venueExtAnt) {
          // eslint-disable-next-line max-len
          const findSettings = find(venueExtAnt, (extAntSettings: ExternalAntenna) => extAntSettings.model === model)
          if (findSettings) {
            venueExtAntennaRef.current = convertToFormData(cloneDeep(findSettings))
          }
        }

        setIsUseVenueSettings(useVenueSettings)
        isUseVenueSettingsRef.current = useVenueSettings


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

    form.setFieldValue('externalAntenna', extAnt)

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
    try {
      const params = paramsRef.current
      const payload = {
        useVenueSettings: isUseVenueSettingsRef.current,
        externalAntenna: cleanExtModel(form.getFieldValue('externalAntenna'))
      }
      await updateApExtAntSettings({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingExtAntSettings
  }]}>
    <VenueSettingsHeader venue={venueData}
      isUseVenueSettings={isUseVenueSettings}
      handleVenueSetting={handleVenueSetting} />
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
