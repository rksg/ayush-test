import { useContext, useEffect, useState, useRef } from 'react'


import { Form }      from 'antd'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { Loader }                                                                                                                                           from '@acx-ui/components'
import { ClientAdmissionControlForm, ClientAdmissionControlTypeEnum }                                                                                       from '@acx-ui/rc/components'
import { useLazyGetVenueQuery, useLazyGetVenueClientAdmissionControlQuery, useGetApClientAdmissionControlQuery, useUpdateApClientAdmissionControlMutation } from '@acx-ui/rc/services'
import { ApClientAdmissionControl, VenueClientAdmissionControl, ClientAdmissionControl, VenueExtended }                                                     from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'


const { useWatch } = Form

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin: 10px;
`

export function ClientAdmissionControlSettings () {
  const { tenantId, serialNumber } = useParams()
  const form = Form.useFormInstance()

  const enable24GFieldName = 'enableClientAdmissionControl24G'
  const enable50GFieldName = 'enableClientAdmissionControl50G'
  const minClientCount24GFieldName = 'clientAdmissionControlMinClientCount24G'
  const minClientCount50GFieldName = 'clientAdmissionControlMinClientCount50G'
  const maxRadioLoad24GFieldName = 'clientAdmissionControlMaxRadioLoad24G'
  const maxRadioLoad50GFieldName = 'clientAdmissionControlMaxRadioLoad50G'
  const minClientThroughput24GFieldName = 'clientAdmissionControlMinClientThroughput24G'
  const minClientThroughput50GFieldName = 'clientAdmissionControlMinClientThroughput50G'

  const [ enable24G, enable50G ] = [
    useWatch<boolean>(enable24GFieldName),
    useWatch<boolean>(enable50GFieldName)
  ]

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { apData: apDetails } = useContext(ApDataContext)
  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueClientAdmissionCtrl] = useLazyGetVenueClientAdmissionControlQuery()
  const getApClientAdmissionControl =
    useGetApClientAdmissionControlQuery({ params: { serialNumber } })
  const [updateClientAdmissionControl, { isLoading: isUpdatingClientAdmissionControl }] =
    useUpdateApClientAdmissionControlMutation()

  const venueRef = useRef<VenueClientAdmissionControl>()
  const initDataRef = useRef<ApClientAdmissionControl>()
  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const [venue, setVenue] = useState({} as VenueExtended)

  useEffect(() => {
    if(apDetails) {
      const venueId = apDetails.venueId
      const setData = async () => {
        const apVenue = (await getVenue({ params: { tenantId, venueId } }, true).unwrap())
        setVenue(apVenue)
        const clientAdmissionControlData = getApClientAdmissionControl?.data
        if (clientAdmissionControlData) {
          initDataRef.current = clientAdmissionControlData
          setDataToForm(clientAdmissionControlData)
          setIsUseVenueSettings(clientAdmissionControlData.useVenueSettings || false)
          isUseVenueSettingsRef.current = clientAdmissionControlData.useVenueSettings || false
        }
        const venueClientAdmissionCtrl = (await getVenueClientAdmissionCtrl(
          { params: { venueId } }, true).unwrap())
        venueRef.current = venueClientAdmissionCtrl
      }
      setData()
    }
  }, [form, getApClientAdmissionControl?.data, apDetails])

  const setDataToForm = (data: ClientAdmissionControl ) => {
    form.setFieldValue(enable24GFieldName, data.enable24G)
    form.setFieldValue(enable50GFieldName, data.enable50G)
    form.setFieldValue(minClientCount24GFieldName, data.minClientCount24G)
    form.setFieldValue(minClientCount50GFieldName, data.minClientCount50G)
    form.setFieldValue(maxRadioLoad24GFieldName, data.maxRadioLoad24G)
    form.setFieldValue(maxRadioLoad50GFieldName, data.maxRadioLoad50G)
    form.setFieldValue(minClientThroughput24GFieldName, data.minClientThroughput24G)
    form.setFieldValue(minClientThroughput50GFieldName, data.minClientThroughput50G)
  }

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue
    let data : ClientAdmissionControl = {}
    if (isUseVenue) {
      if (venueRef.current) {
        data = venueRef.current
      }
    } else {
      if (initDataRef.current) {
        data = initDataRef.current
      }
    }
    setDataToForm(data)
    onFormDataChanged()
  }

  const handleUpdateClientAdmissionControl = async () => {
    console.log(isUseVenueSettingsRef.current)
    try {
      const payload: ApClientAdmissionControl = {
        enable24G: form.getFieldValue(enable24GFieldName),
        enable50G: form.getFieldValue(enable50GFieldName),
        minClientCount24G: form.getFieldValue(minClientCount24GFieldName),
        minClientCount50G: form.getFieldValue(minClientCount50GFieldName),
        maxRadioLoad24G: form.getFieldValue(maxRadioLoad24GFieldName),
        maxRadioLoad50G: form.getFieldValue(maxRadioLoad50GFieldName),
        minClientThroughput24G: form.getFieldValue(minClientThroughput24GFieldName),
        minClientThroughput50G: form.getFieldValue(minClientThroughput50GFieldName),
        useVenueSettings: isUseVenueSettingsRef.current
      }
      await updateClientAdmissionControl({
        params: { serialNumber },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onFormDataChanged = () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      isDirty: true
    })

    setEditRadioContextData && setEditRadioContextData({
      ...editRadioContextData,
      updateClientAdmissionControl: handleUpdateClientAdmissionControl,
      discardClientAdmissionControl: handleDiscard
    })
  }

  const handleDiscard = () => {
    if (initDataRef.current) {
      setIsUseVenueSettings(initDataRef.current.useVenueSettings || false)
      isUseVenueSettingsRef.current = initDataRef.current.useVenueSettings || false
      setDataToForm(initDataRef.current)
    }
  }

  return (<Loader states={[{
    isLoading: getApClientAdmissionControl.isLoading,
    isFetching: isUpdatingClientAdmissionControl
  }]}>
    <VenueSettingsHeader venue={venue}
      isUseVenueSettings={isUseVenueSettings}
      handleVenueSetting={handleVenueSetting} />
    <ClientAdmissionControlForm
      key={ClientAdmissionControlTypeEnum.CAC_24G}
      type={ClientAdmissionControlTypeEnum.CAC_24G}
      readOnly={isUseVenueSettings}
      isEnabled={enable24G}
      isMutuallyExclusive={false}
      enabledFieldName={enable24GFieldName}
      minClientCountFieldName={minClientCount24GFieldName}
      maxRadioLoadFieldName={maxRadioLoad24GFieldName}
      minClientThroughputFieldName={minClientThroughput24GFieldName}
      onFormDataChanged={onFormDataChanged}
    />
    <br/>
    <ClientAdmissionControlForm
      key={ClientAdmissionControlTypeEnum.CAC_5G}
      type={ClientAdmissionControlTypeEnum.CAC_5G}
      readOnly={isUseVenueSettings}
      isEnabled={enable50G}
      isMutuallyExclusive={false}
      enabledFieldName={enable50GFieldName}
      minClientCountFieldName={minClientCount50GFieldName}
      maxRadioLoadFieldName={maxRadioLoad50GFieldName}
      minClientThroughputFieldName={minClientThroughput50GFieldName}
      onFormDataChanged={onFormDataChanged}
    />
  </Loader>
  )
}