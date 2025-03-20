/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Space, Switch, InputNumber } from 'antd'
import { defineMessage, FormattedMessage, useIntl }   from 'react-intl'
import { useParams }                                  from 'react-router-dom'
import styled                                         from 'styled-components/macro'

import { AnchorContext, Loader, Tooltip }   from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }       from '@acx-ui/icons'
import {
  useGetApStickyClientSteeringQuery, useGetVenueLoadBalancingQuery,
  useResetApStickyClientSteeringMutation,
  useUpdateApStickyClientSteeringMutation
} from '@acx-ui/rc/services'
import {
  StickyClientSteering,
  ApStickyClientSteering
} from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../../index'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'

const { useWatch } = Form

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`

const StyledText = styled.p`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const ClientSteering = (props: ApEditItemProps) => {
  const { $t } = useIntl()
  const colSpan = 8
  const { serialNumber } = useParams()
  const { isAllowEdit=true } = props
  const { venueData, apCapabilities } = useContext(ApDataContext)
  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const enabledFieldName = 'enabled'
  const neighborApPercentageThresholdFieldName = 'neighborApPercentageThreshold'
  const snrThresholdFieldName = 'snrThreshold'

  const { setReadyToScroll } = useContext(AnchorContext)
  const venueId = venueData?.id
  const getVenueLoadBalancing = useGetVenueLoadBalancingQuery({ params: { venueId }, isWifiRbacEnabled })
  const getApStickyClientSteeringQuery = useGetApStickyClientSteeringQuery({ params: { venueId, serialNumber } })
  const [ updateApStickyClientSteering, { isLoading: isUpdatingApStickyClientSteering } ] = useUpdateApStickyClientSteeringMutation()
  const [ resetApStickyClientSteering, { isLoading: isResettingStickyClientSteering }] = useResetApStickyClientSteeringMutation()
  const form = Form.useFormInstance()

  const [stickyClientSteeringEnabled, snrThreshold, percentageThreshold ] = [
    useWatch(enabledFieldName),
    useWatch(snrThresholdFieldName),
    useWatch(neighborApPercentageThresholdFieldName)
  ]

  const [stickyClientSteeringDisable, setStickyClientSteeringDisable] = useState({
    isDisable: false,
    isVenueLoadBalancingOn: true
  })
  const isUseVenueSettingsRef = useRef<boolean>(false)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)
  const venueRef = useRef<StickyClientSteering>()
  const initDataRef = useRef<ApStickyClientSteering>()


  useEffect(() => {
    if(!getApStickyClientSteeringQuery.isLoading) {
      const apStickyClientSteering = getApStickyClientSteeringQuery?.data
      const venueLoadBalancing = getVenueLoadBalancing.data
      if (apStickyClientSteering) {
        initDataRef.current = apStickyClientSteering
        setDataToForm(apStickyClientSteering)
        setIsUseVenueSettings(apStickyClientSteering.useVenueSettings || false)
        isUseVenueSettingsRef.current = (apStickyClientSteering.useVenueSettings || false)
      }
      if (venueLoadBalancing) {
        venueRef.current = {
          enabled: venueLoadBalancing.stickyClientSteeringEnabled,
          snrThreshold: venueLoadBalancing.stickyClientSnrThreshold,
          neighborApPercentageThreshold: venueLoadBalancing.stickyClientNbrApPercentageThreshold
        }
      }
      setReadyToScroll?.(r => [...(new Set(r.concat('client-steering')))])
    }
  }, [getApStickyClientSteeringQuery])


  useEffect(() => {
    const venueLoadBalancing = getVenueLoadBalancing.data
    if (!isUseVenueSettings) {
      if (venueLoadBalancing?.enabled === false || apCapabilities?.supportApStickyClientSteering === false) {
        setStickyClientSteeringDisable({
          isDisable: true,
          isVenueLoadBalancingOn: venueLoadBalancing?.enabled ?? true
        })
        turnOffStickyClientSteering()
      }
    }
  }, [getApStickyClientSteeringQuery, isUseVenueSettings])

  const onFormDataChanged = () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })


    setEditRadioContextData && setEditRadioContextData({
      ...editRadioContextData,
      updateClientSteering: handleUpdateClientSteering,
      discardClientSteeringChanges: handleDiscard
    })

  }

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue
    let data : StickyClientSteering = {}
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

  const handleUpdateClientSteering = async () => {
    try {
      if (isUseVenueSettingsRef.current) {
        await resetApStickyClientSteering({ params: { venueId, serialNumber } }).unwrap()
      } else {
        const payload: StickyClientSteering = {
          enabled: form.getFieldValue(enabledFieldName),
          snrThreshold: form.getFieldValue(snrThresholdFieldName),
          neighborApPercentageThreshold: form.getFieldValue(neighborApPercentageThresholdFieldName)
        }
        await updateApStickyClientSteering(
          { params: { venueId, serialNumber }, payload }
        ).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscard = () => {
    if (initDataRef.current) {
      setIsUseVenueSettings(initDataRef.current.useVenueSettings || false)
      isUseVenueSettingsRef.current = initDataRef.current.useVenueSettings || false
      setDataToForm(initDataRef.current)
    }
  }

  const setDataToForm = (data: ApStickyClientSteering ) => {
    form.setFieldValue(enabledFieldName, data.enabled)
    form.setFieldValue(snrThresholdFieldName, data.snrThreshold)
    form.setFieldValue(neighborApPercentageThresholdFieldName, data.neighborApPercentageThreshold)
  }

  const turnOffStickyClientSteering = () => {
    form.setFieldValue(enabledFieldName, false)
    form.setFieldValue(snrThresholdFieldName, undefined)
    form.setFieldValue(neighborApPercentageThresholdFieldName, undefined)
  }


  const stickyClientSteeringInfoMessage = defineMessage({
    defaultMessage: 'Enabling this feature will help clients who have low SNR to transit to a better AP. This function requires that load balancing is enabled at the <venueSingular></venueSingular> level and will disable the SmartRoam feature on the AP.'
  })

  return (<Loader states={[{
    isLoading: getApStickyClientSteeringQuery.isLoading,
    isFetching: isUpdatingApStickyClientSteering || isResettingStickyClientSteering
  }]}>
    <VenueSettingsHeader venue={venueData}
      disabled={!isAllowEdit}
      isUseVenueSettings={isUseVenueSettings}
      handleVenueSetting={handleVenueSetting} />
    <Row>
      <Col span={colSpan}>
        <FieldLabel width='240px' style={{ marginLeft: '10px' }}>
          <Space>
            {$t({ defaultMessage: 'Sticky Client Steering' })}
            <Tooltip title={$t(stickyClientSteeringInfoMessage)} placement='bottom'>
              <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3, marginLeft: -8 }}/>
            </Tooltip>
          </Space>
          <Form.Item
            name='enabled'
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
          >
            {isUseVenueSettings ?
              <span
                style={{ display: 'flex' }}
                data-testid={'sticky-client-steering-enabled-read-only'}>
                {stickyClientSteeringEnabled? $t({ defaultMessage: 'On' }): $t({ defaultMessage: 'Off' })}
              </span>
              :
              (stickyClientSteeringDisable.isDisable === true && stickyClientSteeringDisable.isVenueLoadBalancingOn === false) ?
                <Tooltip
                  title={$t({
                    defaultMessage: 'Please turn on the load balancing at the <venueSingular></venueSingular> level first, as it is required for this function to work.'
                  })}
                >
                  <Switch
                    disabled={true}
                    data-testid='sticky-client-steering-enabled'
                    onChange={onFormDataChanged}
                  />
                </Tooltip>
                :
                <Switch
                  disabled={stickyClientSteeringDisable.isDisable}
                  data-testid='sticky-client-steering-enabled'
                  onChange={onFormDataChanged}
                />
            }
          </Form.Item>
        </FieldLabel>
      </Col>
    </Row>
    {stickyClientSteeringEnabled &&
    <Row>
      <Col span={colSpan}>
        <Space>
          <Form.Item
            label={$t({ defaultMessage: 'SNR Threshold ' })}
            name='snrThreshold'
            initialValue={15}
            rules={[
              { required: true },
              { type: 'number', min: 5 },
              { type: 'number', max: 30 }
            ]}
            style={{ width: '100px' }}
            children={<InputNumber
              disabled={!isAllowEdit || isUseVenueSettings}
              data-testid='sticky-client-snr-threshold'
              placeholder='5-30'
              min={5}
              max={30}
              onChange={onFormDataChanged} />} />
          <span className='ant-form-text' style={{ marginLeft: '-8px', marginTop: '8px' }}>
            {$t({ defaultMessage: 'dB' })}
          </span>
          <Form.Item
            label={<>
              {$t({ defaultMessage: 'Neighbor AP ' })}
              <Tooltip.Question title={$t({ defaultMessage: 'NBRAP percentage is used to calculate a base SNR and compare it to the SNR received from a neighbor AP.' })} />
            </>}
            name='neighborApPercentageThreshold'
            initialValue={20}
            rules={[
              { required: true, message: $t({ defaultMessage: 'Please enter Neighbor AP' }) },
              { type: 'number', min: 10 },
              { type: 'number', max: 40 }
            ]}
            children={<InputNumber
              disabled={!isAllowEdit || isUseVenueSettings}
              data-testid='sticky-client-nbr-percentage-threshold'
              placeholder='10-40'
              min={10}
              max={40}
              onChange={onFormDataChanged} />} />
          <span className='ant-form-text' style={{ marginLeft: '-9px', marginTop: '8px' }}>
            {$t({ defaultMessage: '%' })}
          </span>
        </Space>
        <StyledText>
          <FormattedMessage
            defaultMessage={`Clients with SNR lower than <b>{snrThreshold}dB</b> will be steered to neighbor access
            points with SNR greater than <b>{percentThreshold}%</b> above the current client SNR.`}
            values={{
              snrThreshold: snrThreshold,
              percentThreshold: percentageThreshold,
              b: (chunk) => <b>{chunk}</b>
            }}
          />
        </StyledText>
      </Col>
    </Row>
    }
  </Loader>
  )
}
