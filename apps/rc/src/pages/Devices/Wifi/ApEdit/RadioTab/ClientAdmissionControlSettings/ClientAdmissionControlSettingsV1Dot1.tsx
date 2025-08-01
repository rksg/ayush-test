import { useContext, useEffect, useState, useRef } from 'react'

import { Col, Form, Radio, Row, Space } from 'antd'
import { FormattedMessage, useIntl }    from 'react-intl'
import { useParams }                    from 'react-router-dom'
import styled                           from 'styled-components/macro'

import { AnchorContext, Loader }    from '@acx-ui/components'
import {
  ClientAdmissionControlForm,
  ClientAdmissionControlTypeEnum,
  ClientAdmissionControlLevelEnum
} from '@acx-ui/rc/components'
import {
  useLazyGetApGroupClientAdmissionControlQuery,
  useGetApClientAdmissionControl_v1_1Query,
  useUpdateApClientAdmissionControl_v1_1Mutation
} from '@acx-ui/rc/services'
import { ClientAdmissionControl, ApClientAdmissionControl_v1_1, ApGroupClientAdmissionControl } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'

const { useWatch } = Form

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin: 10px;
`

export function ClientAdmissionControlSettingsV1Dot1 (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { isAllowEdit=true } = props
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
    apViewContextData,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { venueData } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const venueId = venueData?.id
  const apGroupId = apViewContextData?.deviceGroupId

  const [getApGroupClientAdmissionControl] = useLazyGetApGroupClientAdmissionControlQuery()

  const getApClientAdmissionControl = useGetApClientAdmissionControl_v1_1Query(
    { params: { venueId, serialNumber }, skip: !venueId }
  )

  const [updateClientAdmissionControl, { isLoading: isUpdatingClientAdmissionControl }] =
    useUpdateApClientAdmissionControl_v1_1Mutation()

  const apGroupRef = useRef<ApGroupClientAdmissionControl>()
  const initDataRef = useRef<ApClientAdmissionControl_v1_1>()
  const isInheritSettingsRef = useRef<boolean>(false)
  const [isInheritSettings, setIsInheritSettings] = useState(true)
  const isUseVenueSettingsRef = useRef<boolean>(false)

  useEffect(() => {
    if(!getApClientAdmissionControl.isLoading) {
      const setData = async () => {
        const clientAdmissionControlData = getApClientAdmissionControl?.data
        if (clientAdmissionControlData) {
          initDataRef.current = clientAdmissionControlData
          setDataToForm(clientAdmissionControlData)
          // eslint-disable-next-line max-len
          setIsInheritSettings(clientAdmissionControlData.useVenueOrApGroupSettings || false)
          // eslint-disable-next-line max-len
          isInheritSettingsRef.current = clientAdmissionControlData.useVenueOrApGroupSettings || false
        }
        if (venueId && apGroupId) {
          const apGroupClientAdmissionControl = (await getApGroupClientAdmissionControl(
            { params: { venueId, apGroupId } }, true).unwrap())
          apGroupRef.current = apGroupClientAdmissionControl
          isUseVenueSettingsRef.current = apGroupClientAdmissionControl.useVenueSettings || false
        }
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

  const handleInheritOrCustomize = () => {
    let isInherited = !isInheritSettings
    setIsInheritSettings(isInherited)
    isInheritSettingsRef.current = isInherited
    let data : ClientAdmissionControl = {}
    if (isInherited) {
      if (apGroupRef.current) {
        data = apGroupRef.current
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
      if(isInheritSettingsRef.current) {
        await updateClientAdmissionControl(
          { params: { venueId, serialNumber },
            payload: { useVenueOrApGroupSettings: true },
            enableRbac: true }).unwrap()
      } else {
        const payload: ApClientAdmissionControl_v1_1 = {
          enable24G: form.getFieldValue(enable24GFieldName),
          enable50G: form.getFieldValue(enable50GFieldName),
          minClientCount24G: form.getFieldValue(minClientCount24GFieldName),
          minClientCount50G: form.getFieldValue(minClientCount50GFieldName),
          maxRadioLoad24G: form.getFieldValue(maxRadioLoad24GFieldName),
          maxRadioLoad50G: form.getFieldValue(maxRadioLoad50GFieldName),
          minClientThroughput24G: form.getFieldValue(minClientThroughput24GFieldName),
          minClientThroughput50G: form.getFieldValue(minClientThroughput50GFieldName),
          useVenueOrApGroupSettings: isInheritSettingsRef.current
        }
        await updateClientAdmissionControl(
          { params: { venueId, serialNumber }, payload }
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
      setIsInheritSettings(initDataRef.current.useVenueOrApGroupSettings || false)
      isInheritSettingsRef.current = initDataRef.current.useVenueOrApGroupSettings || false
      setDataToForm(initDataRef.current)
    }
  }

  const useInheritSettingsOrCustomizeSettings = () => {
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
                value={isInheritSettings}
                onChange={handleInheritOrCustomize}
                disabled={!isAllowEdit}>
                <Space direction='vertical'>
                  <Radio value={true} data-testid='client-admission-control-inheritSettings'>
                    {isUseVenueSettingsRef.current ? (
                      <FormattedMessage
                        defaultMessage={
                          'Use inherited settings from <VenueSingular></VenueSingular>'
                        }
                      />
                    ) : (
                      <FormattedMessage
                        defaultMessage={'Use inherited settings from AP Group'}
                      />
                    )}
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

  return (<Loader states={[{
    isLoading: getApClientAdmissionControl.isLoading,
    isFetching: isUpdatingClientAdmissionControl
  }]}>
    {useInheritSettingsOrCustomizeSettings()}
    <Row gutter={0}>
      <Col style={{ width: '340px' }}>
        <ClientAdmissionControlForm
          key={ClientAdmissionControlLevelEnum.AP_LEVEL+ClientAdmissionControlTypeEnum.CAC_24G}
          level={ClientAdmissionControlLevelEnum.AP_LEVEL}
          type={ClientAdmissionControlTypeEnum.CAC_24G}
          readOnly={!isAllowEdit || isInheritSettings}
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
          readOnly={!isAllowEdit || isInheritSettings}
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
