import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Select, Space, Switch } from 'antd'
import { defineMessage, useIntl }                from 'react-intl'
import { useParams }                             from 'react-router-dom'

import {
  AnchorContext,
  Loader
} from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  useGetVenueApRebootTimeoutQuery,
  useUpdateVenueApRebootTimeoutMutation,
  useGetVenueTemplateApRebootTimeoutSettingsQuery,
  useUpdateVenueTemplateApRebootTimeoutSettingsMutation
} from '@acx-ui/rc/services'
import { VenueApRebootTimeout, useConfigTemplate } from '@acx-ui/rc/utils'
import {
  TimeoutHourEnum,
  TimeoutMinuteEnum
} from '@acx-ui/rc/utils'

import { VenueEditContext }               from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { FieldLabel } from '../../styledComponents'

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

const MinuteTypeOptions = [
  { label: defineMessage({ defaultMessage: '0' }), value: TimeoutMinuteEnum._0 },
  { label: defineMessage({ defaultMessage: '30' }), value: TimeoutMinuteEnum._30 }
]


export function RebootTimeout () {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const [rebootTimeoutGatewayEnabled, setRebootTimeoutGatewayEnabled] = useState(true)
  const [rebootTimeoutServerEnabled, setRebootTimeoutServerEnabled] = useState(true)

  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? enableTemplateRbac : isUseRbacApi

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
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
    useTemplateQueryFn: useGetVenueTemplateApRebootTimeoutSettingsQuery,
    enableRbac: isUseRbacApi
  })

  const toggleRebootTimeoutGateway = (checked: boolean) => {
    setRebootTimeoutGatewayEnabled(checked)
  }

  const toggleRebootTimeoutServer = (checked: boolean) => {
    setRebootTimeoutServerEnabled(checked)
  }
  const fieldDataKey = ['rebootTimeout']

  const rebootTimeoutGatewayEnabledFieldName = [...fieldDataKey, 'gateway', 'enabled']
  const rebootTimeoutServerEnabledFieldName = [...fieldDataKey, 'server', 'enabled']
  const rebootTimeoutGwLossHourFieldName = [
    ...fieldDataKey,
    'gwLossTimeout',
    'hour'
  ]

  const rebootTimeoutGwLossMinuteFieldName = [
    ...fieldDataKey,
    'gwLossTimeout',
    'minute'
  ]

  const rebootTimeoutServerLossHourFieldName = [
    ...fieldDataKey,
    'serverLossTimeout',
    'hour'
  ]

  const rebootTimeoutServerLossMinuteFieldName = [
    ...fieldDataKey,
    'serverLossTimeout',
    'minute'
  ]

  useEffect(() => {
    const venueApRebootTimeoutData = venueApRebootTimeout.data
    if (venueApRebootTimeoutData) {
      // form.setFieldsValue({ rebootTimeout: venueApRebootTimeoutData })
      form.setFieldsValue({
        rebootTimeout: {
          gateway: {
            enabled: venueApRebootTimeoutData.gwLossTimeout > 0
          },
          gwLossTimeout: {
            hour: Math.floor(venueApRebootTimeoutData.gwLossTimeout / 3600),
            minute: Math.floor((venueApRebootTimeoutData.gwLossTimeout % 3600) / 60)
          },
          server: {
            enabled: venueApRebootTimeoutData.serverLossTimeout > 0
          },
          serverLossTimeout: {
            hour: Math.floor(venueApRebootTimeoutData.serverLossTimeout / 3600),
            minute: Math.floor((venueApRebootTimeoutData.serverLossTimeout % 3600) / 60)
          }
        }
      })

      setReadyToScroll?.((r) => [...new Set(r.concat('Reboot-Timeout'))])
    }
  }, [form, venueApRebootTimeout, setReadyToScroll])

  const handleUpdateRebootTimeout = async () => {
    try {
      const formData =
        form.getFieldsValue().rebootTimeout
      let payload: VenueApRebootTimeout = {
        // eslint-disable-next-line max-len
        gwLossTimeout: formData.gateway.enabled ? formData.gwLossTimeout.hour * 60 * 60 + formData.gwLossTimeout.minute * 60 : 0,
        // eslint-disable-next-line max-len
        serverLossTimeout: formData.server.enabled ? formData.serverLossTimeout.hour * 60 * 60 + formData.serverLossTimeout.minute * 60 : 0
      }

      await updateVenueApRebootTimeout({
        params: { venueId },
        payload: payload,
        enableRbac: resolvedRbacEnabled
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleChanged = () => {
    setEditContextData &&
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        tabTitle: $t({ defaultMessage: 'Networking' }),
        isDirty: true
      })

    setEditNetworkingContextData &&
      setEditNetworkingContextData({
        ...editNetworkingContextData,
        updateRebootTimeout: handleUpdateRebootTimeout
      })
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
              {$t({ defaultMessage: 'Default gateway' })}
            </Space>
            <Form.Item
              name={rebootTimeoutGatewayEnabledFieldName}
              valuePropName={'checked'}
              initialValue={true}
              children={
                <Switch
                  data-testid='gateway-switch'
                  checked={rebootTimeoutGatewayEnabled}
                  onChange={handleChanged}
                  onClick={toggleRebootTimeoutGateway}
                />
              }
            />
          </FieldLabel>
        </Col>
      </Row>
      {rebootTimeoutGatewayEnabled && (
        <Row>
          <Space size={40}>
            <Form.Item
              // eslint-disable-next-line max-len
              label={$t({ defaultMessage: 'Reboot AP if it cannot reach default gateway after' })}
            >
              <Space align='center'>
                <Form.Item
                  noStyle
                  name={rebootTimeoutGwLossHourFieldName}
                  initialValue={0}
                >
                  <Select
                    style={{ width: '60px' }}
                    onChange={handleChanged}>{HourTypeOptions.map(option => {
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
                    onChange={handleChanged}>{MinuteTypeOptions.map(option => {
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
              {$t({ defaultMessage: 'The controller' })}
            </Space>
            <Form.Item
              name={rebootTimeoutServerEnabledFieldName}
              valuePropName={'checked'}
              initialValue={true}
              children={
                <Switch
                  data-testid='server-switch'
                  checked={rebootTimeoutServerEnabled}
                  onChange={handleChanged}
                  onClick={toggleRebootTimeoutServer}
                />
              }
            />
          </FieldLabel>
        </Col>
      </Row>
      {rebootTimeoutServerEnabled && (
        <Row>
          <Space size={40}>
            <Form.Item
              label={$t({ defaultMessage: 'Reboot AP if it cannot reach the controller after' })}
            >
              <Space align='center'>
                <Form.Item
                  noStyle
                  name={rebootTimeoutServerLossHourFieldName}
                  initialValue={2}
                >
                  <Select
                    style={{ width: '60px' }}
                    onChange={handleChanged}>{HourTypeOptions.map(option => {
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
                    onChange={handleChanged}>{MinuteTypeOptions.map(option => {
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
