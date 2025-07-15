import { useContext, useEffect, useState, useRef } from 'react'

import { Col, Form, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { AnchorContext, Loader } from '@acx-ui/components'

import {
  ClientAdmissionControlForm,
  ClientAdmissionControlTypeEnum,
  ClientAdmissionControlLevelEnum
} from '@acx-ui/rc/components'

import {  
  useGetApGroupClientAdmissionControlQuery,
  useUpdateApGroupClientAdmissionControlMutation,
  useLazyGetVenueClientAdmissionControlQuery
} from '@acx-ui/rc/services'

import { ApGroupClientAdmissionControl, ClientAdmissionControl, VenueClientAdmissionControl } from '@acx-ui/rc/utils'

import { ApGroupEditContext } from '../context'

const { useWatch } = Form

export function ClientAdmissionControlSettings(props: {
  isAllowEdit?: boolean
}) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { isAllowEdit = true} = props

  const { apGroupId } = useParams()
  const {
    venueId,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApGroupEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const enable24GFieldName = 'enableClientAdmissionControl24G'
  const enable50GFieldName = 'enableClientAdmissionControl50G'
  const minClientCount24GFieldName = 'clientAdmissionControlMinClientCount24G'
  const minClientCount50GFieldName = 'clientAdmissionControlMinClientCount50G'
  const maxRadioLoad24GFieldName = 'clientAdmissionControlMaxRadioLoad24G'
  const maxRadioLoad50GFieldName = 'clientAdmissionControlMaxRadioLoad50G'
  const minClientThroughput24GFieldName = 'clientAdmissionControlMinClientThroughput24G'
  const minClientThroughput50GFieldName = 'clientAdmissionControlMinClientThroughput50G'

  const [enable24G, enable50G] = [
    useWatch<boolean>(enable24GFieldName),
    useWatch<boolean>(enable50GFieldName)
  ]
  
  const getApGroupClientAdmissionControl = useGetApGroupClientAdmissionControlQuery({
    params: { venueId: venueId, apGroupId: apGroupId }
  })

  const [updateApGroupClientAdmissionControl, { isLoading: isUpdatingClientAdmissionControl }] =
    useUpdateApGroupClientAdmissionControlMutation()

  const [getVenueClientAdmissionControl] = useLazyGetVenueClientAdmissionControlQuery()

  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true) 
  const isUseVenueSettingsRef = useRef<boolean>(true)
  const initClientAdmissionControlRef = useRef<ApGroupClientAdmissionControl>()
  const venueClientAdmissionControlRef = useRef<VenueClientAdmissionControl>()

  useEffect(() => {       
    if(!getApGroupClientAdmissionControl.isLoading) {
      const setData = async () => {
        const clientAdmissionControlData = getApGroupClientAdmissionControl?.data
        if (clientAdmissionControlData) {
          initClientAdmissionControlRef.current = clientAdmissionControlData
          setDataToForm(clientAdmissionControlData)
          setIsUseVenueSettings(clientAdmissionControlData.useVenueSettings || false)
          isUseVenueSettingsRef.current = clientAdmissionControlData.useVenueSettings || false
        }

        const venueClientAdmissionControl = (await getVenueClientAdmissionControl(
          { params: { venueId }, enableRbac: true }, true).unwrap())
        venueClientAdmissionControlRef.current = venueClientAdmissionControl
      }
      setData()
      setReadyToScroll?.(r => [...(new Set(r.concat('Client-Admission-Control')))])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, getApGroupClientAdmissionControl?.data])  

  const setDataToForm = (data: ApGroupClientAdmissionControl ) => { 
    form.setFieldValue(enable24GFieldName, data.enable24G)
    form.setFieldValue(enable50GFieldName, data.enable50G)
    form.setFieldValue(minClientCount24GFieldName, data.minClientCount24G)
    form.setFieldValue(minClientCount50GFieldName, data.minClientCount50G)
    form.setFieldValue(maxRadioLoad24GFieldName, data.maxRadioLoad24G)
    form.setFieldValue(maxRadioLoad50GFieldName, data.maxRadioLoad50G)
    form.setFieldValue(minClientThroughput24GFieldName, data.minClientThroughput24G)
    form.setFieldValue(minClientThroughput50GFieldName, data.minClientThroughput50G)
  }

  const handleVenueOrCustomizeSetting = (e: RadioChangeEvent) => {
    const isUseVenue = e.target.value
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    let data : ClientAdmissionControl = {}
    if (isUseVenue) {
      if (venueClientAdmissionControlRef.current) {
        data = venueClientAdmissionControlRef.current
      }
    } else {
      if (initClientAdmissionControlRef.current) {
        data = initClientAdmissionControlRef.current
      }
    }
    setDataToForm(data)
    onFormDataChanged()
  }

  const handleUpdate = async () => {
    try {
      const payload: ApGroupClientAdmissionControl = isUseVenueSettingsRef.current
        ? { useVenueSettings: true }
        : { useVenueSettings: false,
            enable24G: form.getFieldValue(enable24GFieldName),
            enable50G: form.getFieldValue(enable50GFieldName),
            minClientCount24G: form.getFieldValue(minClientCount24GFieldName),
            minClientCount50G: form.getFieldValue(minClientCount50GFieldName),
            maxRadioLoad24G: form.getFieldValue(maxRadioLoad24GFieldName),
            maxRadioLoad50G: form.getFieldValue(maxRadioLoad50GFieldName),
            minClientThroughput24G: form.getFieldValue(minClientThroughput24GFieldName),
            minClientThroughput50G: form.getFieldValue(minClientThroughput50GFieldName),
          };
  
      await updateApGroupClientAdmissionControl({
        params: { venueId, apGroupId },
        payload
      }).unwrap();
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
    }
  };

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
      updateClientAdmissionControl: handleUpdate,
      discardClientAdmissionControl: handleDiscard
    })
  }

  const handleDiscard = () => {
    if (initClientAdmissionControlRef.current) {
      setIsUseVenueSettings(initClientAdmissionControlRef.current.useVenueSettings || false)
      isUseVenueSettingsRef.current = initClientAdmissionControlRef.current.useVenueSettings || false
      setDataToForm(initClientAdmissionControlRef.current)
    }
  }

  const useVenueSettingsOrCustomizeRadio = () => {
    return (
      <Row gutter={20}>
        <Col span={12}>
          <Space style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            paddingBottom: '20px' }} >
            {
              <Radio.Group
                data-testid='client-admission-control'
                value={isUseVenueSettings}
                onChange={handleVenueOrCustomizeSetting}
                disabled={!isAllowEdit}>
                <Space direction='vertical'>
                  <Radio value={true} data-testid='client-admission-control-useVenueSettings'>
                    <FormattedMessage defaultMessage={'Use inherited settings from venue'} />
                  </Radio>
                  <Radio value={false} data-testid='client-admission-control-customizeSettings'>
                    <FormattedMessage defaultMessage={'Customize settings'} />
                  </Radio>
                </Space>
              </Radio.Group>
            }
          </Space>
        </Col>
      </Row>
    )
  }

  return (
    <Loader states={[{
      isLoading: getApGroupClientAdmissionControl.isLoading,
      isFetching: isUpdatingClientAdmissionControl
    }]}>
    {useVenueSettingsOrCustomizeRadio()}
      <Row gutter={[0, 16]}>
        {<Col style={{ width: '340px' }}>
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
          </Col>}
      </Row>
    </Loader>
  )
}
