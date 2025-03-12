import { useContext, useEffect, useState } from 'react'

import { Col, Form, Input, Row, Space, Switch } from 'antd'
import { useIntl }                              from 'react-intl'
import { useParams }                            from 'react-router-dom'

import { Tooltip } from '@acx-ui/components'
import {
  AnchorContext,
  Loader
} from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import {
  useGetVenueIotQuery,
  useUpdateVenueIotMutation,
  useGetVenueTemplateApIotSettingsQuery,
  useUpdateVenueTemplateApIotSettingsMutation
} from '@acx-ui/rc/services'
import { domainNameRegExp, VenueIot } from '@acx-ui/rc/utils'
import { validationMessages }         from '@acx-ui/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { FieldLabel } from '../../styledComponents'


export function IotController (props: VenueWifiConfigItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const [iotEnabled, setIotEnabled] = useState(false)

  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const form = Form.useFormInstance()

  const [updateVenueApIot, { isLoading: isUpdatingVenueApIot }] =
  useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueIotMutation,
    useUpdateVenueTemplateApIotSettingsMutation
  )

  const venueApIot = useVenueConfigTemplateQueryFnSwitcher<VenueIot>({
    useQueryFn: useGetVenueIotQuery,
    useTemplateQueryFn: useGetVenueTemplateApIotSettingsQuery
  })

  useEffect(() => {
    const venueApIotData = venueApIot.data
    if (venueApIotData) {
      form.setFieldsValue({ iot: venueApIotData })

      setIotEnabled(venueApIotData.enabled)

      setReadyToScroll?.((r) => [...new Set(r.concat('IoT-Controller'))])
    }
  }, [form, venueApIot, setReadyToScroll])

  const updateIotController = async () => {
    try {
      const formData =
        form.getFieldsValue().iot
      let payload: VenueIot = {
        enabled: formData.enabled,
        mqttBrokerAddress: formData.mqttBrokerAddress
      }

      await updateVenueApIot({
        params: { venueId },
        payload: payload
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const discardIotController = async () => {
    const venueApIotData = venueApIot.data
    if (venueApIotData) {
      form.setFieldsValue({ iot: venueApIotData })
      setIotEnabled(venueApIotData.enabled)
    }
  }

  const handleChanged = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: true
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateVenueIot: updateIotController,
      discardVenueIot: discardIotController
    })
  }

  const toggleIot = (checked: boolean) => {
    setIotEnabled(checked)
  }

  const iotEnabledFieldName = ['iot', 'enabled']
  const iotMqttBrokerAddressFieldName = ['iot', 'mqttBrokerAddress']


  return (
    <Loader
      states={[
        {
          isLoading: venueApIot.isLoading,
          isFetching: isUpdatingVenueApIot
        }
      ]}
    >
      <Row gutter={0}>
        <Col span={colSpan}>
          <FieldLabel width='200px'>
            <Space>
              {$t({ defaultMessage: 'Enable IoT Controller' })}
            </Space>
            <Form.Item
              name={iotEnabledFieldName}
              valuePropName={'checked'}
              initialValue={false}
              children={
                <Switch
                  data-testid='iot-switch'
                  disabled={!isAllowEdit}
                  onChange={handleChanged}
                  onClick={toggleIot}
                />
              }
            />
          </FieldLabel>
        </Col>
      </Row>
      {iotEnabled && (
        <Row>
          <Space size={40}>
            <Form.Item
              name={iotMqttBrokerAddressFieldName}
              style={{ display: 'inline-block', width: '230px' }}
              // noStyle
              rules={[
                { required: true,
                  // eslint-disable-next-line max-len
                  message: $t({ defaultMessage: 'Please enter the MQTT address of the VRIoT Controller' })
                },
                { validator: (_, value) => domainNameRegExp(value),
                  message: $t(validationMessages.validDomain)
                }
              ]}
              label={
                <>
                  {$t({ defaultMessage: 'VRIoT  IP Address/FQDN' })}
                  <Tooltip
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'This is the MQTT address of the VRIoT Controller' })}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined/>
                  </Tooltip>
                </>
              }
              initialValue={''}
              children={
                <Input
                  disabled={!isAllowEdit}
                  onChange={handleChanged}
                />
              }
            />
          </Space>
        </Row>
      )}
    </Loader>
  )
}
