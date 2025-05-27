import { useContext, useEffect, useState } from 'react'

import { Button,Col, Form, Row, Space } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams }                    from 'react-router-dom'

import {
  AnchorContext,
  Loader
} from '@acx-ui/components'
import {
  IotControllerDrawer
} from '@acx-ui/rc/components'
import {
  useGetVenueIotQuery,
  useUpdateVenueIotMutation,
  useGetVenueTemplateApIotSettingsQuery,
  useUpdateVenueTemplateApIotSettingsMutation
} from '@acx-ui/rc/services'
import { VenueIot } from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'


export function IotControllerV2 (props: VenueWifiConfigItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const [drawerVisible, setDrawerVisible] = useState(false)

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

  const iotMqttBrokerAddressFieldName = ['iot', 'mqttBrokerAddress']

  const handleIotController = () => {
    setDrawerVisible(true)
  }

  return (
    <Loader
      states={[
        {
          isLoading: venueApIot.isLoading,
          isFetching: isUpdatingVenueApIot
        }
      ]}
    >
      {venueApIot?.data?.enabled ? (
        <Row>
          <Col span={colSpan}>
            <Form.Item
              name={iotMqttBrokerAddressFieldName}
              style={{ display: 'inline-block', width: '230px' }}
              label={$t({ defaultMessage: 'IoT Controller Name' })}
              children={
                <span>{venueApIot?.data?.enabled}</span>
              }
            />
            <Form.Item
              name={iotMqttBrokerAddressFieldName}
              style={{ display: 'inline-block', width: '230px' }}
              label={$t({ defaultMessage: 'FQDN / IP' })}
              children={
                <span>{venueApIot?.data?.mqttBrokerAddress}</span>
              }
            />
          </Col>
          { isAllowEdit &&
          <Col span={colSpan}>
            <Space>
              <Button
                type='link'
                style={{ marginLeft: '20px' }}
                onClick={handleIotController}
              >
                {$t({ defaultMessage: 'Change' })}
              </Button>
              <Button
                type='link'
                style={{ marginLeft: '20px' }}
                onClick={handleIotController}
              >
                {$t({ defaultMessage: 'Remove' })}
              </Button>
            </Space>
          </Col>
          }
        </Row>
      ) : (
        isAllowEdit &&
        <Row>
          <Col span={colSpan}>
            <Space>
              <Button
                type='link'
                style={{ marginLeft: '20px' }}
                onClick={handleIotController}
              >
                {$t({ defaultMessage: 'Associate IoT Controller' })}
              </Button>
            </Space>
          </Col>
        </Row>
      )}
      { drawerVisible && <IotControllerDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        applyIotController={handleChanged}
      /> }
    </Loader>
  )
}
