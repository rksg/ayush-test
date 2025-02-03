/* eslint-disable max-len */
import { useContext, useEffect } from 'react'

import { Col, InputNumber, Form, Radio, Row, Slider, Space, Switch } from 'antd'
import { defineMessage, useIntl }                                    from 'react-intl'
import { useParams }                                                 from 'react-router-dom'

import { AnchorContext, Loader, Tooltip, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                      from '@acx-ui/icons'
import {
  useGetVenueLoadBalancingQuery, useGetVenueTemplateLoadBalancingQuery,
  useUpdateVenueLoadBalancingMutation,
  useUpdateVenueTemplateLoadBalancingMutation
} from '@acx-ui/rc/services'
import { LoadBalancingMethodEnum, SteeringModeEnum, useConfigTemplate, VenueLoadBalancing } from '@acx-ui/rc/utils'

import { VenueEditContext }                                                                from '../..'
import { useVenueConfigTemplateMutationFnSwitcher, useVenueConfigTemplateQueryFnSwitcher } from '../../../venueConfigTemplateApiSwitcher'
import { FieldLabel, RadioDescription }                                                    from '../styledComponents'

const { useWatch } = Form

export function LoadBalancing (props: {
  setIsLoadOrBandBalaningEnabled?: (isLoadOrBandBalaningEnabled: boolean) => void,
  isAllowEdit?: boolean
 }) {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const { setIsLoadOrBandBalaningEnabled, isAllowEdit=true } = props
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled

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
  const { setReadyToScroll } = useContext(AnchorContext)

  const getLoadBalancing = useVenueConfigTemplateQueryFnSwitcher<VenueLoadBalancing>({
    useQueryFn: useGetVenueLoadBalancingQuery,
    useTemplateQueryFn: useGetVenueTemplateLoadBalancingQuery,
    enableRbac: isWifiRbacEnabled
  })

  const [updateVenueLoadBalancing, { isLoading: isUpdatingVenueLoadBalancing }] = useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueLoadBalancingMutation,
    useUpdateVenueTemplateLoadBalancingMutation
  )

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
    defaultMessage: 'Enabling this feature will help clients who have low SNR to transit to a better AP, and will disable SmartRoam feature on AP. Ensure that APs meet the minimum required version 6.2.2'
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
        defaultMessage: 'Uses the proactive functionality and forcefully rebalances clients via 802.11v BTM'
      })
    }
  ]

  useEffect(() => {
    const loadBalancingData = getLoadBalancing?.data
    if (loadBalancingData) {
      form.setFieldsValue(loadBalancingData)
      setIsLoadOrBandBalaningEnabled?.(loadBalancingData.enabled || loadBalancingData.bandBalancingEnabled)

      setReadyToScroll?.(r => [...(new Set(r.concat('Load-Balancing')))])
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

  const handleUpdateLoadBalancing = async (callback?: () => void) => {
    try {
      const payload = getLoadBalancingDataFromFields()

      await updateVenueLoadBalancing({
        params: { venueId },
        payload,
        enableRbac: resolvedRbacEnabled,
        callback: callback
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
      isLoadBalancingDataChanged: true,
      updateLoadBalancing: handleUpdateLoadBalancing
    })

    setIsLoadOrBandBalaningEnabled?.(form.getFieldValue('enabled') || form.getFieldValue('bandBalancingEnabled'))
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
                allowed to enable client admission control. Make sure that load balancing is enabled on network configuration.` })}
              placement='right'>
              <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }} />
            </Tooltip>
          </Space>
          <Form.Item
            name='enabled'
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
            children={<Switch
              data-testid='load-balancing-enabled'
              disabled={!isAllowEdit}
              onChange={(value) => {
                if (value) {
                  onFormDataChanged()
                } else {
                  showActionModal({
                    type: 'warning',
                    width: 450,
                    content: <p data-testId='load-balancing-off-warning-text'>
                      {
                        $t({ defaultMessage: `Please be aware that disabling the load balancing \n
                      functionality in this <venueSingular></venueSingular> will also deactivate the sticky client steering \n
                      function on all APs within the <venueSingular></venueSingular>. Are you sure you want to disable it?` })
                      }
                    </p>,
                    okText: $t({ defaultMessage: 'Disable' }),
                    cancelText: $t({ defaultMessage: 'Cancel' }),
                    customContent: {
                      action: 'CUSTOM_BUTTONS',
                      buttons: [
                        {
                          text: 'Cancel',
                          type: 'default',
                          key: 'cancel',
                          handler: () => {
                            form.setFieldValue('enabled', true)
                          }
                        },
                        {
                          text: 'Disable',
                          type: 'primary',
                          key: 'start',
                          closeAfterAction: true,
                          handler: onFormDataChanged
                        }
                      ]
                    }
                  })
                }

              }
              } />}
          />
        </FieldLabel>
      </Col>
    </Row>

    {enabled &&
    <Row>
      <Col span={colSpan}>
        <Form.Item
          name='loadBalancingMethod'
          label={$t({ defaultMessage: 'Load Balancing Method' })}
        >
          <Radio.Group disabled={!isAllowEdit} onChange={onLoadBalancingMethodChange}>
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

    {enabled &&
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
              disabled={!isAllowEdit}
              onChange={onFormDataChanged} />}
          />
        </FieldLabel>
      </Col>
    </Row>
    }

    {enabled && stickyClientSteeringEnabled &&
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
              disabled={!isAllowEdit}
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
              disabled={!isAllowEdit}
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
              <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }} />
            </Tooltip>
          </Space>
          <Form.Item
            name='bandBalancingEnabled'
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
            children={<Switch
              data-testid='band-balancing-enabled'
              disabled={!isAllowEdit}
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
            disabled={!isAllowEdit}
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
          <Radio.Group disabled={!isAllowEdit} onChange={onSteeringModeChange}>
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
