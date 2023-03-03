/* eslint-disable max-len */
import { useContext, useEffect } from 'react'

import { Col, Form, Radio, Row, Slider, Space, Switch } from 'antd'
import { defineMessage, useIntl }                       from 'react-intl'
import { useParams }                                    from 'react-router-dom'

import { cssStr, Loader, Tooltip }                                            from '@acx-ui/components'
import { InformationSolid, QuestionMarkCircleOutlined }                       from '@acx-ui/icons'
import { useGetVenueLoadBalancingQuery, useUpdateVenueLoadBalancingMutation } from '@acx-ui/rc/services'
import { LoadBalancingMethodEnum, SteeringModeEnum }                          from '@acx-ui/rc/utils'

import { VenueEditContext }             from '../..'
import { FieldLabel, RadioDescription } from '../styledComponents'

const { useWatch } = Form

export function LoadBalancing () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const form = Form.useFormInstance()
  const [enabled, loadBalancingMethod, bandBalancingEnabled ] = [
    useWatch('enabled'),
    useWatch('loadBalancingMethod'),
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


  const infoMessage = defineMessage({
    defaultMessage: `Make sure background scan is selected for channel selection
    method on radios you would like to run load balancing. Also,
    enable load balancing on network configuration.`
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
      bandBalancingEnabled,
      bandBalancingClientPercent24G,
      steeringMode
    } = form.getFieldsValue()

    return {
      enabled,
      loadBalancingMethod,
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
      isLoadBalancingDataChanged: true,
      updateLoadBalancing: handleUpdateLoadBalancing
    })
  }


  return (<Loader states={[{
    isLoading: getLoadBalancing.isLoading,
    isFetching: isUpdatingVenueLoadBalancing
  }]}>
    <Row gutter={0}>
      <Col span={10}>
        <FieldLabel width='200px'>
          {$t({ defaultMessage: 'Use Load Balancing' })}
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
      <Col span={10}
        style={{
          backgroundColor: cssStr('--acx-accents-orange-10'),
          marginBottom: '10px',
          fontSize: cssStr('--acx-body-4-font-size'),
          padding: '10px 20px 10px 10px'
        }}>
        <Space align='start'>
          <InformationSolid />
          <span>-</span>
          <div>{ $t(infoMessage) }</div>
        </Space>
      </Col>
    </Row>

    {enabled &&
    <Row>
      <Col span={10}>
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

    {(!enabled || loadBalancingMethod === LoadBalancingMethodEnum.CLIENT_COUNT) &&
    <Row gutter={0}>
      <Col span={10}>
        <FieldLabel width='200px'>
          {$t({ defaultMessage: 'Band Balancing' })}
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
      <Col span={10}>
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
      <Col span={10}>
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
