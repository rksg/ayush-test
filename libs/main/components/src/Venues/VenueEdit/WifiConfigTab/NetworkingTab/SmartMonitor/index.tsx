import { useContext, useEffect, useState } from 'react'

import { Col, Form, InputNumber, Row, Space, Switch } from 'antd'
import { useIntl }                                    from 'react-intl'
import { useParams }                                  from 'react-router-dom'

import { AnchorContext, Loader, Tooltip }                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                                  from '@acx-ui/icons'
import { ApCompatibilityDrawer, ApCompatibilityToolTip, ApCompatibilityType, InCompatibilityFeatures } from '@acx-ui/rc/components'
import {
  useGetVenueApSmartMonitorQuery,
  useUpdateVenueApSmartMonitorMutation,
  useGetVenueTemplateApSmartMonitorSettingsQuery,
  useUpdateVenueTemplateApSmartMonitorSettingsMutation
} from '@acx-ui/rc/services'
import { VenueApSmartMonitor, useConfigTemplate } from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { FieldLabel } from '../../styledComponents'

export function SmartMonitor (props: VenueWifiConfigItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const [smartMonitorEnabled, setSmartMonitorEnabled] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? enableTemplateRbac : isUseRbacApi
  // eslint-disable-next-line max-len
  const tooltipInfo = $t({ defaultMessage: 'Enabling this feature will automatically disable WLANs if the default gateway of the access point is unreachable' })
  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const form = Form.useFormInstance()

  const [updateVenueApSmartMonitor, { isLoading: isUpdatingVenueApSmartMonitor }] =
  useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueApSmartMonitorMutation,
    useUpdateVenueTemplateApSmartMonitorSettingsMutation
  )

  const venueApSmartMonitor = useVenueConfigTemplateQueryFnSwitcher<VenueApSmartMonitor>({
    useQueryFn: useGetVenueApSmartMonitorQuery,
    useTemplateQueryFn: useGetVenueTemplateApSmartMonitorSettingsQuery,
    enableRbac: isUseRbacApi
  })

  useEffect(() => {
    const venueApSmartMonitorData = venueApSmartMonitor.data
    if (venueApSmartMonitorData) {
      form.setFieldsValue({ smartMonitor: venueApSmartMonitorData })

      setSmartMonitorEnabled(venueApSmartMonitorData.enabled)

      setReadyToScroll?.((r) => [...new Set(r.concat('Smart-Monitor'))])
    }
  }, [form, venueApSmartMonitor, setReadyToScroll])

  const handleUpdateSmartMonitor = async () => {
    try {
      const formData =
        form.getFieldsValue().smartMonitor
      let payload: VenueApSmartMonitor = {
        enabled: formData.enabled,
        interval: formData.interval,
        threshold: formData.threshold
      }

      await updateVenueApSmartMonitor({
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
        updateSmartMonitor: handleUpdateSmartMonitor
      })
  }

  const toggleSmartMonitor = (checked: boolean) => {
    setSmartMonitorEnabled(checked)
  }

  const fieldDataKey = ['smartMonitor']

  const smartMonitorEnabledFieldName = [...fieldDataKey, 'enabled']
  const smartMonitorIntervalFieldName = [
    ...fieldDataKey,
    'interval'
  ]
  const smartMonitorThresholdFieldName = [
    ...fieldDataKey,
    'threshold'
  ]

  return (
    <Loader
      states={[
        {
          isLoading: venueApSmartMonitor.isLoading,
          isFetching: isUpdatingVenueApSmartMonitor
        }
      ]}
    >
      <Row gutter={0}>
        <Col span={colSpan}>
          <FieldLabel width='200px'>
            <Space>
              {$t({ defaultMessage: 'Smart Monitor' })}
              {!isR370UnsupportedFeatures && <Tooltip
                title={$t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'Enabling this feature will automatically disable WLANs if the default gateway of the access point is unreachable'
                })}
                placement='right'
              >
                <QuestionMarkCircleOutlined
                  style={{ height: '14px', marginBottom: -3 }}
                />
              </Tooltip>}
              {isR370UnsupportedFeatures && <ApCompatibilityToolTip
                title={tooltipInfo}
                showDetailButton
                placement='right'
                onClick={() => setDrawerVisible(true)}
              />}
              {isR370UnsupportedFeatures && <ApCompatibilityDrawer
                visible={drawerVisible}
                type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
                venueId={venueId}
                featureName={InCompatibilityFeatures.SMART_MONITOR}
                onClose={() => setDrawerVisible(false)}
              />}
            </Space>
            <Form.Item
              name={smartMonitorEnabledFieldName}
              valuePropName={'checked'}
              initialValue={false}
              children={
                <Switch
                  disabled={!isAllowEdit}
                  checked={smartMonitorEnabled}
                  onChange={handleChanged}
                  onClick={toggleSmartMonitor}
                />
              }
            />
          </FieldLabel>
        </Col>
      </Row>
      {smartMonitorEnabled && (
        <Space size={30}>
          <Form.Item
            required
            label={$t({ defaultMessage: 'Heartbeat Interval' })}
          >
            <Space align='center'>
              <Form.Item
                noStyle
                name={smartMonitorIntervalFieldName}
                initialValue={10}
                rules={[
                  {
                    required: true,
                    message: $t({
                      defaultMessage: 'Please enter a number between 5 and 60'
                    })
                  }
                ]}
                children={
                  <InputNumber
                    min={5}
                    max={60}
                    style={{ width: '75px' }}
                    disabled={!isAllowEdit}
                    onChange={handleChanged}
                  />
                }
              />
              <div>{$t({ defaultMessage: 'Seconds' })}</div>
            </Space>
          </Form.Item>
          <Form.Item required label={$t({ defaultMessage: 'Max Retries' })}>
            <Space align='center'>
              <Form.Item
                noStyle
                name={smartMonitorThresholdFieldName}
                initialValue={3}
                rules={[
                  {
                    required: true,
                    message: $t({
                      defaultMessage: 'Please enter a number between 1 and 10'
                    })
                  }
                ]}
                children={
                  <InputNumber
                    min={1}
                    max={10}
                    style={{ width: '75px' }}
                    disabled={!isAllowEdit}
                    onChange={handleChanged}
                  />
                }
              />
            </Space>
          </Form.Item>
        </Space>
      )}
    </Loader>
  )
}
