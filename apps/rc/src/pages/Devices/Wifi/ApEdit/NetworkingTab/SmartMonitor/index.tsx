import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, InputNumber, Row, Space, Switch, Tooltip } from 'antd'
import { isEmpty }                                             from 'lodash'
import { useIntl }                                             from 'react-intl'
import { useParams }                                           from 'react-router-dom'

import {
  AnchorContext,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useGetApSmartMonitorQuery,
  useLazyGetVenueApSmartMonitorQuery,
  useUpdateApSmartMonitorMutation
} from '@acx-ui/rc/services'
import { ApSmartMonitor, VenueApSmartMonitor } from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { FieldLabel }                                    from '../../styledComponents'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'

export function SmartMonitor (props: ApEditItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const { venueData } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const venueId = venueData?.id

  const smartMonitor = useGetApSmartMonitorQuery(
    {
      params: { venueId, serialNumber }
    },
    { skip: !venueId }
  )

  const [updateApSmartMonitor, { isLoading: isUpdatingApSmartMonitor }] =
    useUpdateApSmartMonitorMutation()

  const [getVenueApSmartMonitor] = useLazyGetVenueApSmartMonitorQuery()

  const formRef = useRef<StepsFormLegacyInstance<ApSmartMonitor>>()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [initData, setInitData] = useState({} as ApSmartMonitor)
  const [apSmartMonitor, setApSmartMonitor] = useState({} as ApSmartMonitor)
  const [venueApSmartMonitor, setVenueApSmartMonitor] = useState(
    {} as VenueApSmartMonitor
  )
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [formInitializing, setFormInitializing] = useState(true)

  const [smartMonitorEnabled, setSmartMonitorEnabled] = useState(false)

  useEffect(() => {
    const smartMonitorData = smartMonitor?.data

    if (venueId && smartMonitorData) {
      const setSmartMonitorData = async () => {
        const venueApSmartMonitorData = await getVenueApSmartMonitor(
          {
            params: { tenantId, venueId }
          },
          true
        ).unwrap()

        setVenueApSmartMonitor(venueApSmartMonitorData)
        setIsUseVenueSettings(smartMonitorData.useVenueSettings)
        isUseVenueSettingsRef.current = smartMonitorData.useVenueSettings
        setSmartMonitorEnabled(smartMonitorData.enabled)

        if (formInitializing) {
          setInitData(smartMonitorData)
          setFormInitializing(false)

          setReadyToScroll?.((r) => [...new Set(r.concat('Smart-Monitor'))])
        } else {
          formRef?.current?.setFieldsValue(smartMonitorData)
        }
      }

      setSmartMonitorData()
    }
  }, [venueId, smartMonitor?.data])

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApSmartMonitor({ ...currentData })
      }

      if (venueApSmartMonitor) {
        const data = {
          ...venueApSmartMonitor,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)

        setSmartMonitorEnabled(venueApSmartMonitor.enabled)
      }
    } else {
      if (!isEmpty(apSmartMonitor)) {
        formRef?.current?.setFieldsValue(apSmartMonitor)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const handleUpdateSmartMonitor = async (values: ApSmartMonitor) => {
    try {
      setEditContextData &&
        setEditContextData({
          ...editContextData,
          isDirty: false,
          hasError: false
        })

      const isUseVenue = isUseVenueSettingsRef.current
      const payload = {
        ...values,
        useVenueSettings: isUseVenue
      }

      await updateApSmartMonitor({
        params: { venueId, serialNumber },
        payload
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateEditContext = (
    form: StepsFormLegacyInstance,
    isDirty: boolean
  ) => {
    setEditContextData &&
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        tabTitle: $t({ defaultMessage: 'Networking' }),
        isDirty: isDirty
      })

    setEditNetworkingContextData &&
      setEditNetworkingContextData({
        ...editNetworkingContextData,
        updateSmartMonitor: () =>
          handleUpdateSmartMonitor(form?.getFieldsValue()),
        discardSmartMonitorChanges: () => handleDiscard()
      })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings)
    isUseVenueSettingsRef.current = initData.useVenueSettings
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const smartMonitorEnabledFieldName = 'enabled'
  const smartMonitorIntervalFieldName = 'interval'
  const smartMonitorThresholdFieldName = 'threshold'

  const toggleSmartMonitor = (checked: boolean) => {
    setSmartMonitorEnabled(checked)
  }

  return (
    <Loader
      states={[
        {
          isLoading: formInitializing,
          isFetching: isUpdatingApSmartMonitor
        }
      ]}
    >
      <StepsFormLegacy formRef={formRef} onFormChange={handleChange}>
        <StepsFormLegacy.StepForm initialValues={initData}>
          <VenueSettingsHeader
            venue={venueData}
            disabled={!isAllowEdit}
            isUseVenueSettings={isUseVenueSettings}
            handleVenueSetting={handleVenueSetting}
          />

          <Row gutter={0}>
            <Col span={colSpan}>
              <FieldLabel width='200px'>
                <Space>
                  {$t({ defaultMessage: 'Smart Monitor' })}
                  <Tooltip
                    title={$t({
                      // eslint-disable-next-line max-len
                      defaultMessage: 'Enabling this feature will automatically disable WLANs if the default gateway of the access point is unreachable'
                    })}
                    placement='right'
                  >
                    <QuestionMarkCircleOutlined
                      style={{ height: '14px', marginBottom: -3 }}
                    />
                  </Tooltip>
                </Space>
                <Form.Item
                  name={smartMonitorEnabledFieldName}
                  valuePropName={'checked'}
                  initialValue={false}
                  children={
                    isUseVenueSettings ? (
                      <span data-testid={'enabled-span'}>
                        {formRef?.current?.getFieldValue(
                          smartMonitorEnabledFieldName
                        )
                          ? $t({ defaultMessage: 'On' })
                          : $t({ defaultMessage: 'Off' })}
                      </span>
                    ) : (
                      <Switch
                        disabled={!isAllowEdit}
                        checked={smartMonitorEnabled}
                        onChange={handleChange}
                        onClick={toggleSmartMonitor}
                      />
                    )
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
                          defaultMessage:
                            'Please enter a number between 5 and 60'
                        })
                      }
                    ]}
                    children={
                      isUseVenueSettings ? (
                        <span data-testid={'interval-span'}>
                          {formRef?.current?.getFieldValue(
                            smartMonitorIntervalFieldName
                          )}
                        </span>
                      ) : (
                        <InputNumber
                          min={5}
                          max={60}
                          style={{ width: '75px' }}
                          disabled={!isAllowEdit}
                          onChange={handleChange}
                        />
                      )
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
                          defaultMessage:
                            'Please enter a number between 1 and 10'
                        })
                      }
                    ]}
                    children={
                      isUseVenueSettings ? (
                        <span data-testid={'threshold-span'}>
                          {formRef?.current?.getFieldValue(
                            smartMonitorThresholdFieldName
                          )}
                        </span>
                      ) : (
                        <InputNumber
                          min={1}
                          max={10}
                          style={{ width: '75px' }}
                          disabled={!isAllowEdit}
                          onChange={handleChange}
                        />
                      )
                    }
                  />
                </Space>
              </Form.Item>
            </Space>
          )}
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
