import { useContext, useEffect, useState, useRef } from 'react'


import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'
import styled             from 'styled-components/macro'

import { AnchorContext, Loader }     from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  ClientAdmissionControlForm,
  ClientAdmissionControlTypeEnum,
  ClientAdmissionControlLevelEnum
} from '@acx-ui/rc/components'
import {
  useLazyGetVenueClientAdmissionControlQuery,
  useGetApClientAdmissionControlQuery,
  useUpdateApClientAdmissionControlMutation,
  useDeleteApClientAdmissionControlMutation
} from '@acx-ui/rc/services'
import { ApClientAdmissionControl, VenueClientAdmissionControl, ClientAdmissionControl } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


const { useWatch } = Form

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin: 10px;
`

export function ClientAdmissionControlSettings (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { isAllowEdit=true } = props
  const form = Form.useFormInstance()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

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

  const { venueData } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const venueId = venueData?.id

  const [getVenueClientAdmissionCtrl] = useLazyGetVenueClientAdmissionControlQuery()
  const getApClientAdmissionControl =
    useGetApClientAdmissionControlQuery(
      { params: { venueId, serialNumber }, enableRbac: isUseRbacApi }
    )
  const [updateClientAdmissionControl, { isLoading: isUpdatingClientAdmissionControl }] =
    useUpdateApClientAdmissionControlMutation()
  const [deleteClientAdmissionControl, { isLoading: isDeletingClientAdmissionControl }] =
    useDeleteApClientAdmissionControlMutation()

  const venueRef = useRef<VenueClientAdmissionControl>()
  const initDataRef = useRef<ApClientAdmissionControl>()
  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  useEffect(() => {
    if(!getApClientAdmissionControl.isLoading) {
      const setData = async () => {
        const clientAdmissionControlData = getApClientAdmissionControl?.data
        if (clientAdmissionControlData) {
          initDataRef.current = clientAdmissionControlData
          setDataToForm(clientAdmissionControlData)
          setIsUseVenueSettings(clientAdmissionControlData.useVenueSettings || false)
          isUseVenueSettingsRef.current = clientAdmissionControlData.useVenueSettings || false
        }
        const venueClientAdmissionCtrl = (await getVenueClientAdmissionCtrl(
          { params: { venueId }, enableRbac: isUseRbacApi }, true).unwrap())
        venueRef.current = venueClientAdmissionCtrl
      }
      setData()

      setReadyToScroll?.(r => [...(new Set(r.concat('Client-Admission-Control')))])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, getApClientAdmissionControl?.data])

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
    try {
      if(isUseVenueSettingsRef.current) {
        if (isUseRbacApi) {
          await updateClientAdmissionControl(
            { params: { venueId, serialNumber },
              payload: { useVenueSettings: true },
              enableRbac: isUseRbacApi }).unwrap()
        } else {
          await deleteClientAdmissionControl({ params: { serialNumber } }).unwrap()
        }
      } else {
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
        await updateClientAdmissionControl(
          { params: { venueId, serialNumber }, payload, enableRbac: isUseRbacApi }
        ).unwrap()
      }
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
      updateClientAdmissionControl: handleUpdateClientAdmissionControl,
      discardClientAdmissionControlChanges: handleDiscard
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
    isFetching: isUpdatingClientAdmissionControl || isDeletingClientAdmissionControl
  }]}>
    <VenueSettingsHeader venue={venueData}
      disabled={!isAllowEdit}
      isUseVenueSettings={isUseVenueSettings}
      handleVenueSetting={handleVenueSetting} />
    <Row gutter={0}>
      <Col style={{ width: '340px' }}>
        <ClientAdmissionControlForm
          key={ClientAdmissionControlLevelEnum.AP_LEVEL+ClientAdmissionControlTypeEnum.CAC_24G}
          level={ClientAdmissionControlLevelEnum.AP_LEVEL}
          type={ClientAdmissionControlTypeEnum.CAC_24G}
          readOnly={!isAllowEdit || isUseVenueSettings}
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
          key={ClientAdmissionControlLevelEnum.AP_LEVEL+ClientAdmissionControlTypeEnum.CAC_5G}
          level={ClientAdmissionControlLevelEnum.AP_LEVEL}
          type={ClientAdmissionControlTypeEnum.CAC_5G}
          readOnly={!isAllowEdit || isUseVenueSettings}
          isEnabled={enable50G}
          isMutuallyExclusive={false}
          enabledFieldName={enable50GFieldName}
          minClientCountFieldName={minClientCount50GFieldName}
          maxRadioLoadFieldName={maxRadioLoad50GFieldName}
          minClientThroughputFieldName={minClientThroughput50GFieldName}
          onFormDataChanged={onFormDataChanged}
        />
      </Col>
    </Row>
  </Loader>
  )
}
