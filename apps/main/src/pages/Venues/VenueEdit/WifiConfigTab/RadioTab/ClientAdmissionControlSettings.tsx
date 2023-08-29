import { useContext, useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader }                                                                               from '@acx-ui/components'
import { ClientAdmissionControlForm, ClientAdmissionControlTypeEnum }                           from '@acx-ui/rc/components'
import { useGetVenueClientAdmissionControlQuery, useUpdateVenueClientAdmissionControlMutation } from '@acx-ui/rc/services'
import { VenueClientAdmissionControl }                                                          from '@acx-ui/rc/utils'

import { VenueEditContext } from '../..'



const { useWatch } = Form

export function ClientAdmissionControlSettings (props: { isLoadOrBandBalaningEnabled?: boolean }) {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const form = Form.useFormInstance()
  const [isTurnedOffAndGrayedOut, setIsTurnedOffAndGrayedOut] = useState(false)

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
  } = useContext(VenueEditContext)

  const { isLoadOrBandBalaningEnabled } = props
  const getClientAdmissionControl = useGetVenueClientAdmissionControlQuery({ params: { venueId } })
  const [ updateClientAdmissionControl, { isLoading: isUpdatingClientAdmissionControl }] =
    useUpdateVenueClientAdmissionControlMutation()

  useEffect(() => {
    const clientAdmissionControlData = getClientAdmissionControl?.data
    if (clientAdmissionControlData) {
      form.setFieldValue(enable24GFieldName,
        (!isTurnedOffAndGrayedOut)? clientAdmissionControlData.enable24G: false)
      form.setFieldValue(enable50GFieldName,
        (!isTurnedOffAndGrayedOut)? clientAdmissionControlData.enable50G: false)
      if (isTurnedOffAndGrayedOut &&
        (clientAdmissionControlData.enable24G || clientAdmissionControlData.enable50G)) {
        onFormDataChanged()
      }
      form.setFieldValue(minClientCount24GFieldName, clientAdmissionControlData.minClientCount24G)
      form.setFieldValue(minClientCount50GFieldName, clientAdmissionControlData.minClientCount50G)
      form.setFieldValue(maxRadioLoad24GFieldName, clientAdmissionControlData.maxRadioLoad24G)
      form.setFieldValue(maxRadioLoad50GFieldName, clientAdmissionControlData.maxRadioLoad50G)
      form.setFieldValue(minClientThroughput24GFieldName,
        clientAdmissionControlData.minClientThroughput24G)
      form.setFieldValue(minClientThroughput50GFieldName,
        clientAdmissionControlData.minClientThroughput50G)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTurnedOffAndGrayedOut, form, getClientAdmissionControl?.data])

  useEffect(() => {
    if (isLoadOrBandBalaningEnabled) {
      form.setFieldValue(enable24GFieldName, false)
      form.setFieldValue(enable50GFieldName, false)
      setIsTurnedOffAndGrayedOut(true)
    } else {
      setIsTurnedOffAndGrayedOut(false)
    }
  }, [form, isLoadOrBandBalaningEnabled])

  const handleUpdateClientAdmissionControl = async (callback?: () => void) => {
    try {
      const payload: VenueClientAdmissionControl = {
        enable24G: form.getFieldValue(enable24GFieldName),
        enable50G: form.getFieldValue(enable50GFieldName),
        minClientCount24G: form.getFieldValue(minClientCount24GFieldName),
        minClientCount50G: form.getFieldValue(minClientCount50GFieldName),
        maxRadioLoad24G: form.getFieldValue(maxRadioLoad24GFieldName),
        maxRadioLoad50G: form.getFieldValue(maxRadioLoad50GFieldName),
        minClientThroughput24G: form.getFieldValue(minClientThroughput24GFieldName),
        minClientThroughput50G: form.getFieldValue(minClientThroughput50GFieldName)
      }
      await updateClientAdmissionControl({
        params: { venueId },
        payload,
        callback: callback
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onFormDataChanged = () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })

    setEditRadioContextData && setEditRadioContextData({
      ...editRadioContextData,
      isClientAdmissionControlDataChanged: true,
      updateClientAdmissionControl: handleUpdateClientAdmissionControl
    })
  }

  return (<Loader states={[{
    isLoading: getClientAdmissionControl.isLoading,
    isFetching: isUpdatingClientAdmissionControl
  }]}>
    <ClientAdmissionControlForm
      key={ClientAdmissionControlTypeEnum.CAC_24G}
      type={ClientAdmissionControlTypeEnum.CAC_24G}
      readOnly={false}
      isEnabled={enable24G}
      isMutuallyExclusive={isTurnedOffAndGrayedOut}
      enabledFieldName={enable24GFieldName}
      minClientCountFieldName={minClientCount24GFieldName}
      maxRadioLoadFieldName={maxRadioLoad24GFieldName}
      minClientThroughputFieldName={minClientThroughput24GFieldName}
      onFormDataChanged={onFormDataChanged}
    />
    <ClientAdmissionControlForm
      key={ClientAdmissionControlTypeEnum.CAC_5G}
      type={ClientAdmissionControlTypeEnum.CAC_5G}
      readOnly={false}
      isEnabled={enable50G}
      isMutuallyExclusive={isTurnedOffAndGrayedOut}
      enabledFieldName={enable50GFieldName}
      minClientCountFieldName={minClientCount50GFieldName}
      maxRadioLoadFieldName={maxRadioLoad50GFieldName}
      minClientThroughputFieldName={minClientThroughput50GFieldName}
      onFormDataChanged={onFormDataChanged}
    />
  </Loader>
  )
}