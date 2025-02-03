import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Select, Space, Switch } from 'antd'
import { defineMessage, useIntl }                from 'react-intl'
import { useParams }                             from 'react-router-dom'

import { Tooltip } from '@acx-ui/components'
import {
  AnchorContext,
  Loader
} from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import {
  useGetVenueApRebootTimeoutQuery,
  useUpdateVenueApRebootTimeoutMutation,
  useGetVenueTemplateApRebootTimeoutSettingsQuery,
  useUpdateVenueTemplateApRebootTimeoutSettingsMutation
} from '@acx-ui/rc/services'
import { VenueApRebootTimeout } from '@acx-ui/rc/utils'
import {
  TimeoutHourEnum,
  TimeoutMinuteEnum
} from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { FieldLabel } from '../../styledComponents'

const { useWatch } = Form

const HourTypeOptions = [
  { label: defineMessage({ defaultMessage: '0' }), value: TimeoutHourEnum._0 },
  { label: defineMessage({ defaultMessage: '1' }), value: TimeoutHourEnum._1 },
  { label: defineMessage({ defaultMessage: '2' }), value: TimeoutHourEnum._2 },
  { label: defineMessage({ defaultMessage: '3' }), value: TimeoutHourEnum._3 },
  { label: defineMessage({ defaultMessage: '4' }), value: TimeoutHourEnum._4 },
  { label: defineMessage({ defaultMessage: '5' }), value: TimeoutHourEnum._5 },
  { label: defineMessage({ defaultMessage: '6' }), value: TimeoutHourEnum._6 },
  { label: defineMessage({ defaultMessage: '7' }), value: TimeoutHourEnum._7 },
  { label: defineMessage({ defaultMessage: '8' }), value: TimeoutHourEnum._8 },
  { label: defineMessage({ defaultMessage: '9' }), value: TimeoutHourEnum._9 },
  { label: defineMessage({ defaultMessage: '10' }), value: TimeoutHourEnum._10 },
  { label: defineMessage({ defaultMessage: '11' }), value: TimeoutHourEnum._11 },
  { label: defineMessage({ defaultMessage: '12' }), value: TimeoutHourEnum._12 },
  { label: defineMessage({ defaultMessage: '13' }), value: TimeoutHourEnum._13 },
  { label: defineMessage({ defaultMessage: '14' }), value: TimeoutHourEnum._14 },
  { label: defineMessage({ defaultMessage: '15' }), value: TimeoutHourEnum._15 },
  { label: defineMessage({ defaultMessage: '16' }), value: TimeoutHourEnum._16 },
  { label: defineMessage({ defaultMessage: '17' }), value: TimeoutHourEnum._17 },
  { label: defineMessage({ defaultMessage: '18' }), value: TimeoutHourEnum._18 },
  { label: defineMessage({ defaultMessage: '19' }), value: TimeoutHourEnum._19 },
  { label: defineMessage({ defaultMessage: '20' }), value: TimeoutHourEnum._20 },
  { label: defineMessage({ defaultMessage: '21' }), value: TimeoutHourEnum._21 },
  { label: defineMessage({ defaultMessage: '22' }), value: TimeoutHourEnum._22 },
  { label: defineMessage({ defaultMessage: '23' }), value: TimeoutHourEnum._23 },
  { label: defineMessage({ defaultMessage: '24' }), value: TimeoutHourEnum._24 }
]

const ServerHourTypeOptions = [
  { label: defineMessage({ defaultMessage: '0' }), value: TimeoutHourEnum._0 },
  { label: defineMessage({ defaultMessage: '2' }), value: TimeoutHourEnum._2 },
  { label: defineMessage({ defaultMessage: '4' }), value: TimeoutHourEnum._4 },
  { label: defineMessage({ defaultMessage: '6' }), value: TimeoutHourEnum._6 },
  { label: defineMessage({ defaultMessage: '8' }), value: TimeoutHourEnum._8 },
  { label: defineMessage({ defaultMessage: '10' }), value: TimeoutHourEnum._10 },
  { label: defineMessage({ defaultMessage: '12' }), value: TimeoutHourEnum._12 },
  { label: defineMessage({ defaultMessage: '14' }), value: TimeoutHourEnum._14 },
  { label: defineMessage({ defaultMessage: '16' }), value: TimeoutHourEnum._16 },
  { label: defineMessage({ defaultMessage: '18' }), value: TimeoutHourEnum._18 },
  { label: defineMessage({ defaultMessage: '20' }), value: TimeoutHourEnum._20 },
  { label: defineMessage({ defaultMessage: '22' }), value: TimeoutHourEnum._22 },
  { label: defineMessage({ defaultMessage: '24' }), value: TimeoutHourEnum._24 }
]

const MinuteTypeOptions = [
  { label: defineMessage({ defaultMessage: '0' }), value: TimeoutMinuteEnum._0 },
  { label: defineMessage({ defaultMessage: '30' }), value: TimeoutMinuteEnum._30 }
]


export function RebootTimeout (props: VenueWifiConfigItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const [options, setOptions] = useState(MinuteTypeOptions)
  const [serverOptions, setServerOptions] = useState(MinuteTypeOptions)

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const form = Form.useFormInstance()

  const [updateVenueApRebootTimeout, { isLoading: isUpdatingVenueApRebootTimeout }] =
  useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueApRebootTimeoutMutation,
    useUpdateVenueTemplateApRebootTimeoutSettingsMutation
  )

  const venueApRebootTimeout = useVenueConfigTemplateQueryFnSwitcher<VenueApRebootTimeout>({
    useQueryFn: useGetVenueApRebootTimeoutQuery,
    useTemplateQueryFn: useGetVenueTemplateApRebootTimeoutSettingsQuery
  })

  const rebootTimeoutGwLossHourFieldName = [
    'rebootTimeout',
    'gatewayLossTimeout',
    'hour'
  ]

  const rebootTimeoutGwLossMinuteFieldName = [
    'rebootTimeout',
    'gatewayLossTimeout',
    'minute'
  ]

  const rebootTimeoutServerLossHourFieldName = [
    'rebootTimeout',
    'serverLossTimeout',
    'hour'
  ]

  const rebootTimeoutServerLossMinuteFieldName = [
    'rebootTimeout',
    'serverLossTimeout',
    'minute'
  ]

  const gatewayEnabled = useWatch<boolean>('gatewayEnabled')
  const serverEnabled = useWatch<boolean>('serverEnabled')

  useEffect(() => {
    const venueApRebootTimeoutData = venueApRebootTimeout.data
    if (venueApRebootTimeoutData) {
      // form.setFieldsValue({ rebootTimeout: venueApRebootTimeoutData })
      form.setFieldsValue({
        gatewayEnabled: venueApRebootTimeoutData.gatewayLossTimeout > 0,
        serverEnabled: venueApRebootTimeoutData.serverLossTimeout > 0,
        rebootTimeout: {
          gatewayLossTimeout: {
            hour: Math.floor(venueApRebootTimeoutData.gatewayLossTimeout / 3600),
            // eslint-disable-next-line max-len
            minute: venueApRebootTimeoutData.gatewayLossTimeout > 0 ? Math.floor((venueApRebootTimeoutData.gatewayLossTimeout % 3600) / 60) : 30
          },
          serverLossTimeout: {
            // eslint-disable-next-line max-len
            hour: venueApRebootTimeoutData.serverLossTimeout > 0 ? Math.floor(venueApRebootTimeoutData.serverLossTimeout / 3600) : 2,
            minute: Math.floor((venueApRebootTimeoutData.serverLossTimeout % 3600) / 60)
          }
        }
      })

      if (venueApRebootTimeoutData.gatewayLossTimeout === 0) {
        setOptions([MinuteTypeOptions[1]])
      } else if (venueApRebootTimeoutData.gatewayLossTimeout === 1800) {
        setOptions([MinuteTypeOptions[1]])
      } else if (venueApRebootTimeoutData.gatewayLossTimeout === 86400) {
        setOptions([MinuteTypeOptions[0]])
      } else {
        setOptions(MinuteTypeOptions)
      }

      if (venueApRebootTimeoutData.serverLossTimeout === 1800) {
        setServerOptions([MinuteTypeOptions[1]])
      } else {
        setServerOptions([MinuteTypeOptions[0]])
      }

      setReadyToScroll?.((r) => [...new Set(r.concat('Reboot-Timeout'))])
    }
  }, [form, venueApRebootTimeout, setReadyToScroll])

  const handleUpdateRebootTimeout = async () => {
    try {
      const formData =
        form.getFieldsValue().rebootTimeout
      const gatewayEnabled = form.getFieldsValue().gatewayEnabled
      const serverEnabled = form.getFieldsValue().serverEnabled
      let payload: VenueApRebootTimeout = {
        // eslint-disable-next-line max-len
        gatewayLossTimeout: gatewayEnabled ? formData.gatewayLossTimeout.hour * 60 * 60 + formData.gatewayLossTimeout.minute * 60 : 0,
        // eslint-disable-next-line max-len
        serverLossTimeout: serverEnabled ? formData.serverLossTimeout.hour * 60 * 60 + formData.serverLossTimeout.minute * 60 : 0
      }

      await updateVenueApRebootTimeout({
        params: { venueId },
        payload: payload
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleChanged = () => {
    setEditContextData &&
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'settings',
        tabTitle: $t({ defaultMessage: 'Advanced' }),
        isDirty: true
      })

    setEditAdvancedContextData &&
      setEditAdvancedContextData({
        ...editAdvancedContextData,
        updateRebootTimeout: handleUpdateRebootTimeout
      })
  }

  const handleGatewayHourChanged = (hour: string) => {
    if (hour === '24') {
      form.setFieldsValue({
        rebootTimeout: {
          gatewayLossTimeout: {
            minute: 0
          }
        }
      })
      setOptions([MinuteTypeOptions[0]])
      handleChanged()
      return
    }
    if (hour === '0') {
      form.setFieldsValue({
        rebootTimeout: {
          gatewayLossTimeout: {
            minute: 30
          }
        }
      })
      setOptions([MinuteTypeOptions[1]])
      handleChanged()
      return
    }
    setOptions(MinuteTypeOptions)
    handleChanged()
  }

  const handleServerHourChanged = (hour: string) => {
    if (hour === '0') {
      form.setFieldsValue({
        rebootTimeout: {
          serverLossTimeout: {
            minute: 30
          }
        }
      })
      setServerOptions([MinuteTypeOptions[1]])
      handleChanged()
      return
    }
    form.setFieldsValue({
      rebootTimeout: {
        serverLossTimeout: {
          minute: 0
        }
      }
    })
    setServerOptions([MinuteTypeOptions[0]])
    handleChanged()
  }

  return (
    <Loader
      states={[
        {
          isLoading: venueApRebootTimeout.isLoading,
          isFetching: isUpdatingVenueApRebootTimeout
        }
      ]}
    >
      <Row gutter={0}>
        <Col span={colSpan}>
          <FieldLabel width='200px'>
            <Space>
              {$t({ defaultMessage: 'Gateway Connection Monitor' })}
            </Space>
            <Form.Item
              name='gatewayEnabled'
              valuePropName={'checked'}
              initialValue={true}
              children={
                <Switch
                  data-testid='gateway-switch'
                  disabled={!isAllowEdit}
                  onChange={handleChanged}
                />
              }
            />
          </FieldLabel>
        </Col>
      </Row>
      {gatewayEnabled && (
        <Row>
          <Space size={40}>
            <Form.Item
              label={
                <>
                  {$t({ defaultMessage: 'Gateway Timeout before AP Reboot' })}
                  <Tooltip
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'Select how long AP will wait before rebooting if it cannot reach the gateway' })}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined/>
                  </Tooltip>
                </>
              }
            >
              <Space align='center'>
                <Form.Item
                  noStyle
                  name={rebootTimeoutGwLossHourFieldName}
                  initialValue={0}
                >
                  <Select
                    style={{ width: '60px' }}
                    disabled={!isAllowEdit}
                    onChange={handleGatewayHourChanged}>{HourTypeOptions.map(option => {
                      const { value, label } = option
                      return <Select.Option key={value} value={value}>{$t(label)}</Select.Option>
                    })}
                  </Select>
                </Form.Item>
                <div>{$t({ defaultMessage: 'hours' })}</div>
                <Form.Item
                  noStyle
                  name={rebootTimeoutGwLossMinuteFieldName}
                  initialValue={30}
                >
                  <Select
                    style={{ width: '60px' }}
                    disabled={!isAllowEdit}
                    onChange={handleChanged}>{options.map(option => {
                      const { value, label } = option
                      return <Select.Option key={value} value={value}>{$t(label)}</Select.Option>
                    })}
                  </Select>
                </Form.Item>
                <div>{$t({ defaultMessage: 'minutes' })}</div>
              </Space>
            </Form.Item>
          </Space>
        </Row>
      )}
      <Row gutter={0}>
        <Col span={colSpan}>
          <FieldLabel width='200px'>
            <Space>
              {$t({ defaultMessage: 'Controller Connection Monitor' })}
            </Space>
            <Form.Item
              name='serverEnabled'
              valuePropName={'checked'}
              initialValue={true}
              children={
                <Switch
                  data-testid='server-switch'
                  disabled={!isAllowEdit}
                  onChange={handleChanged}
                />
              }
            />
          </FieldLabel>
        </Col>
      </Row>
      {serverEnabled && (
        <Row>
          <Space size={40}>
            <Form.Item
              label={
                <>
                  {$t({ defaultMessage: 'Controller Timeout before AP Reboot' })}
                  <Tooltip
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'Select how long AP will wait before rebooting if it cannot reach the controller' })}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined/>
                  </Tooltip>
                </>
              }
            >
              <Space align='center'>
                <Form.Item
                  noStyle
                  name={rebootTimeoutServerLossHourFieldName}
                  initialValue={2}
                >
                  <Select
                    style={{ width: '60px' }}
                    disabled={!isAllowEdit}
                    onChange={handleServerHourChanged}>{ServerHourTypeOptions.map(option => {
                      const { value, label } = option
                      return <Select.Option key={value} value={value}>{$t(label)}</Select.Option>
                    })}
                  </Select>
                </Form.Item>
                <div>{$t({ defaultMessage: 'hours' })}</div>
                <Form.Item
                  noStyle
                  name={rebootTimeoutServerLossMinuteFieldName}
                  initialValue={0}
                >
                  <Select
                    style={{ width: '60px' }}
                    disabled={!isAllowEdit}
                    onChange={handleChanged}>{serverOptions.map(option => {
                      const { value, label } = option
                      return <Select.Option key={value} value={value}>{$t(label)}</Select.Option>
                    })}
                  </Select>
                </Form.Item>
                <div>{$t({ defaultMessage: 'minutes' })}</div>
              </Space>
            </Form.Item>
          </Space>
        </Row>
      )}
    </Loader>
  )
}
