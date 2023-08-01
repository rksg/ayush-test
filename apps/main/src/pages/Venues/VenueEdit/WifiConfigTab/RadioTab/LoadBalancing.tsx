/* eslint-disable max-len */
import { useContext, useEffect } from 'react'

import { Col, InputNumber, Form, Radio, Row, Slider, Space, Switch } from 'antd'
import { defineMessage, FormattedMessage, useIntl }                  from 'react-intl'
import { useParams }                                                 from 'react-router-dom'

import { cssStr, Loader, Tooltip }                                            from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }             from '@acx-ui/feature-toggle'
import { InformationSolid, QuestionMarkCircleOutlined }                       from '@acx-ui/icons'
import { useGetVenueLoadBalancingQuery, useUpdateVenueLoadBalancingMutation } from '@acx-ui/rc/services'
import { LoadBalancingMethodEnum, SteeringModeEnum }                          from '@acx-ui/rc/utils'

import { VenueEditContext }             from '../..'
import { FieldLabel, RadioDescription } from '../styledComponents'

const { useWatch } = Form

export function LoadBalancing () {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const form = Form.useFormInstance()
  const [enabled, loadBalancingMethod, stickyClientSteeringEnabled, snrThreshold, percentageThreshold, bandBalancingEnabled ] = [
    useWatch('enabled'),
    useWatch('loadBalancingMethod'),
    useWatch('stickyClientSteeringEnabled'),
    useWatch('stickyClientSnrThreshold'),
    useWatch('stickyClientNbrApPercentageThreshold'),
    useWatch('bandBalancingEnabled')
  ]

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)

  const getLoadBalancing = useGetVenueLoadBalancingQuery({ params: { venueId } })
  const [updateVenueLoadBalancing, { isLoading: isUpdatingVenueLoadBalancing }] =
    useUpdateVenueLoadBalancingMutation()

  const betaStickyFlag = useIsTierAllowed(TierFeatures.BETA_CLB)
  const stickyClientFlag = useIsSplitOn(Features.STICKY_CLIENT_STEERING)
  const clientAdmissionControlFlag = useIsSplitOn(Features.WIFI_FR_6029_FG6_1_TOGGLE)
  const supportStickyClient = betaStickyFlag && stickyClientFlag

  const infoMessage = defineMessage({
    defaultMessage: `Make sure <b>background scan</b> is selected for channel selection
    method on radios you would like to run load balancing. Also,
    enable <b>load balancing</b> on network configuration.`
  })

  const loadBalancingMethods = [
    {
      method: LoadBalancingMethodEnum.CLIENT_COUNT,
      text: defineMessage({ defaultMessage: 'Based on Client Count' })
    },
    {
      method: LoadBalancingMethodEnum.CAPCITY,
      text: defineMessage({ defaultMessage: 'Based on Capacity' }),
      info: defineMessage({
        defaultMessage: 'Capacity determination is based on multiple factors including bandwidth, data rate and number of streams.'
      })
    }
  ]

  const stickyClientSteeringInfoMessage = defineMessage({
    defaultMessage: 'Enabling this feature will help clients who have low SNR to transit to a better AP, and will disable SmartRoam feature on AP'
  })

  const steeringModes = [
    {
      mode: SteeringModeEnum.BASIC,
      text: defineMessage({ defaultMessage: 'Basic' }),
      description: defineMessage({
        defaultMessage: 'Witholds probe and authentication responses at connection time in heavily loaded band to balance clients to the other band'
      })
    }, {
      mode: SteeringModeEnum.PROACTIVE,
      text: defineMessage({ defaultMessage: 'Proactive' }),
      description: defineMessage({
        defaultMessage: 'Uses the Basic functionality and actively rebalances clients via 802.11v BTM'
      })
    }, {
      mode: SteeringModeEnum.STRICT,
      text: defineMessage({ defaultMessage: 'Strict' }),
      description: defineMessage({
      // eslint-disable-next-line max-len
        defaultMessage: 'Uses the proactive functionaity and forcefully rebalances clients via 802.11v BTM'
      })
    }
  ]

  useEffect(() => {
    const loadBalancingData = getLoadBalancing?.data
    if (loadBalancingData) {
      form.setFieldsValue(loadBalancingData)
      setEditRadioContextData && setEditRadioContextData({
        ...editRadioContextData,
        isBandBalancingEnabled: loadBalancingData.bandBalancingEnabled,
        isLoadBalancingEnabled: loadBalancingData.enabled
      })
    }

  }, [getLoadBalancing?.data])


  const onLoadBalancingMethodChange = () => {
    onFormDataChanged()
  }

  const onSteeringModeChange = () => {
    onFormDataChanged()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  const handleUpdateLoadBalancing = async () => {
    try {
      const payload = getLoadBalancingDataFromFields()

      await updateVenueLoadBalancing({
        params: { venueId },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const getLoadBalancingDataFromFields = () => {
    const {
      enabled,
      loadBalancingMethod,
      stickyClientSteeringEnabled,
      stickyClientSnrThreshold,
      stickyClientNbrApPercentageThreshold,
      bandBalancingEnabled,
      bandBalancingClientPercent24G,
      steeringMode
    } = form.getFieldsValue()

    return {
      enabled,
      loadBalancingMethod,
      stickyClientSteeringEnabled,
      stickyClientSnrThreshold,
      stickyClientNbrApPercentageThreshold,
      bandBalancingEnabled,
      bandBalancingClientPercent24G,
      steeringMode
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
      isBandBalancingEnabled: form.getFieldValue('bandBalancingEnabled'),
      isLoadBalancingEnabled: form.getFieldValue('enabled'),
      isLoadBalancingDataChanged: true,
      updateLoadBalancing: handleUpdateLoadBalancing
    })
  }


  return (<Loader states={[{
    isLoading: getLoadBalancing.isLoading,
    isFetching: isUpdatingVenueLoadBalancing
  }]}>
    <Row gutter={0}>
      <Col span={colSpan}>
        <FieldLabel width='200px'>
          <Space>
            {$t({ defaultMessage: 'Use Load Balancing' })}
            <Tooltip
              title={$t({ defaultMessage: `When load balancing or band balancing is enabled, you will not be 
                allowed to enable client admission control.` })}
              placement='right'>
              {clientAdmissionControlFlag &&
                <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }} />
              }
            </Tooltip>
          </Space>
          <Form.Item
            name='enabled'
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
            children={<Switch
              data-testid='load-balancing-enabled'
              onChange={onFormDataChanged} />}
          />
        </FieldLabel>
      </Col>
    </Row>

    <Row>
      <Col span={colSpan}
        style={{
          backgroundColor: cssStr('--acx-accents-orange-10'),
          marginBottom: '10px',
          fontSize: cssStr('--acx-body-4-font-size'),
          padding: '10px 50px 10px 10px'
        }}>
        <Space align='start'>
          <InformationSolid />
          <div>
            <FormattedMessage
              {...infoMessage}
              values={{
                b: (text: string) => <strong>{text}</strong>
              }}
            />
          </div>
        </Space>
      </Col>
    </Row>

    {enabled &&
    <Row>
      <Col span={colSpan}>
        <Form.Item
          name='loadBalancingMethod'
          label={$t({ defaultMessage: 'Load Balancing Method' })}
        >
          <Radio.Group onChange={onLoadBalancingMethodChange}>
            <Space direction='vertical'>
              {loadBalancingMethods.map(({ method, text, info }) => (
                <Radio key={method} value={method}>
                  {$t(text)}
                  {info &&
                  <Tooltip title={$t(info)} placement='bottom'>
                    <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }}/>
                  </Tooltip>
                  }
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>
    </Row>
    }

    {supportStickyClient && enabled &&
    <Row>
      <Col span={colSpan}>
        <FieldLabel width='200px'>
          <Space>
            {$t({ defaultMessage: 'Sticky Client Steering' })}
            <Tooltip title={$t(stickyClientSteeringInfoMessage)} placement='bottom'>
              <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3, marginLeft: -8 }}/>
            </Tooltip>
          </Space>
          <Form.Item
            name='stickyClientSteeringEnabled'
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
            children={<Switch
              data-testid='sticky-client-steering-enabled'
              onChange={onFormDataChanged} />}
          />
        </FieldLabel>
      </Col>
    </Row>
    }

    {supportStickyClient && enabled && stickyClientSteeringEnabled &&
    <Row>
      <Col span={colSpan}>
        <Space>
          <Form.Item
            label={$t({ defaultMessage: 'SNR Threshold ' })}
            name='stickyClientSnrThreshold'
            initialValue={15}
            rules={[
              { required: true },
              { type: 'number', min: 5 },
              { type: 'number', max: 30 }
            ]}
            style={{ width: '100px' }}
            children={<InputNumber
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
            name='stickyClientNbrApPercentageThreshold'
            initialValue={20}
            rules={[
              { required: true, message: $t({ defaultMessage: 'Please enter Neighbor AP' }) },
              { type: 'number', min: 10 },
              { type: 'number', max: 40 }
            ]}
            children={<InputNumber
              data-testid='sticky-client-nbr-percentage-threshold'
              placeholder='10-40'
              min={10}
              max={40}
              onChange={onFormDataChanged} />} />
          <span className='ant-form-text' style={{ marginLeft: '-9px', marginTop: '8px' }}>
            {$t({ defaultMessage: '%' })}
          </span>
        </Space>
        <Form.Item
          label={
            $t({ defaultMessage: `Clients with SNR lower than {snrThreshold}dB will be steered to neighbor access 
            points with SNR greater than {percentThreshold}% above the current client SNR.` },
            { snrThreshold: snrThreshold,
              percentThreshold: percentageThreshold })
          }
        />
      </Col>
    </Row>
    }

    {(!enabled || loadBalancingMethod === LoadBalancingMethodEnum.CLIENT_COUNT) &&
    <Row gutter={0}>
      <Col span={colSpan}>
        <FieldLabel width='200px'>
          <Space>
            {$t({ defaultMessage: 'Band Balancing' })}
            <Tooltip
              title={$t({ defaultMessage: `When load balancing or band balancing is enabled, you will not be 
                allowed to enable client admission control.` })}
              placement='right'>
              {clientAdmissionControlFlag &&
                <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }} />
              }
            </Tooltip>
          </Space>
          <Form.Item
            name='bandBalancingEnabled'
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
            children={<Switch
              data-testid='band-balancing-enabled'
              onChange={onFormDataChanged} />}
          />
        </FieldLabel>
      </Col>
    </Row>
    }

    {bandBalancingEnabled &&
    <Row>
      <Col span={colSpan}>
        <Form.Item
          label={$t({ defaultMessage: '2.4 GHz Client load (%)' })}
          name='bandBalancingClientPercent24G'
        >
          <Slider
            tipFormatter={formatter}
            style={{ width: '240px' }}
            min={0}
            max={100}
            marks={{ 0: '0%', 100: '100%' }}
            onChange={onFormDataChanged}
          />
        </Form.Item>
      </Col>
    </Row>
    }

    <Row>
      <Col span={colSpan}>
        <Form.Item
          name='steeringMode'
          label={$t({ defaultMessage: 'Steering Mode' })}
        >
          <Radio.Group onChange={onSteeringModeChange}>
            <Space direction='vertical'>
              {steeringModes.map(({ mode, text, description }) => (
                <Radio key={mode} value={mode}>
                  {$t(text)}
                  <RadioDescription>
                    {$t(description)}
                  </RadioDescription>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>
    </Row>
  </Loader>
  )
}
