import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, InputNumber, Row, Space, Switch, Tooltip } from 'antd'
import { isEmpty }                                             from 'lodash'
import { defineMessage, useIntl }                              from 'react-intl'
import { useParams }                                           from 'react-router-dom'

import {
  AnchorContext,
  Loader,
  StepsForm,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useGetApSmartMonitorQuery,
  useLazyGetVenueApSmartMonitorQuery,
  useUpdateApSmartMonitorMutation
} from '@acx-ui/rc/services'
import {
  ApSmartMonitor,
  VenueApSmartMonitor
} from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext } from '../..'
import { FieldLabel }                   from '../../styledComponents'
import { VenueSettingsHeader }          from '../../VenueSettingsHeader'
const { useWatch } = Form
export function SmartMonitor () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

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
      params: { venueId, serialNumber },
      enableRbac: isUseRbacApi
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

  const smartMonitorSettings = [
    {
      key: 'smartMonitorEnable',
      label: defineMessage({ defaultMessage: 'Smart Monitor' }),
      fieldName: 'smartMonitorEnable'
    },
    {
      key: 'smartMonitorInterval',
      label: defineMessage({ defaultMessage: 'Interval' }),
      fieldName: 'smartMonitorInterval'
    },
    {
      key: 'smartMonitorThreshold',
      label: defineMessage({ defaultMessage: 'Max Retries' }),
      fieldName: 'smartMonitorThreshold'
    }
  ]

  useEffect(() => {
    const smartMonitorData = smartMonitor?.data

    if (venueId && smartMonitorData) {
      const setData = async () => {
        const venueApSmartMonitorData = await getVenueApSmartMonitor(
          {
            params: { tenantId, venueId },
            enableRbac: isUseRbacApi
          },
          true
        ).unwrap()

        setVenueApSmartMonitor(venueApSmartMonitorData)
        setIsUseVenueSettings(smartMonitorData.useVenueSettings)
        isUseVenueSettingsRef.current = smartMonitorData.useVenueSettings

        if (formInitializing) {
          setInitData(smartMonitorData)
          setFormInitializing(false)

          setReadyToScroll?.((r) => [...new Set(r.concat('Smart-Monitor'))])
        } else {
          formRef?.current?.setFieldsValue(smartMonitorData)
        }
      }

      setData()
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
      }
    } else {
      if (!isEmpty(apSmartMonitor)) {
        formRef?.current?.setFieldsValue(apSmartMonitor)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const handleUpdateSmartMonitor = async (values: any) => {
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
        payload,
        enableRbac: isUseRbacApi
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
          handleUpdateSmartMonitor(form?.getFieldsValue().smartMonitor),
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

  const handleChanged = () => {
    handleUpdateSmartMonitor
  }

  const [smartMonitorEnabled, setSmartMonitorEnabled] = useState(false)
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
            isUseVenueSettings={isUseVenueSettings}
            handleVenueSetting={handleVenueSetting}
          />

          <StepsForm.FieldLabel width={'280px'}>
            <>
              {$t({ defaultMessage: 'Smart Monitor' })}
              <Tooltip
                title={$t({
                  defaultMessage:
                    'Enabling this feature will automatically disable WLANs if the default gateway of the access point is unreachable'
                })}
                placement='top'
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            </>
            <Form.Item
              name={smartMonitorEnabledFieldName}
              valuePropName={'checked'}
              initialValue={false}
              children={<Switch
                onChange={handleChanged}
                onClick={toggleSmartMonitor} />}
            />
          </StepsForm.FieldLabel>
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
                      <InputNumber
                        min={5}
                        max={60}
                        style={{ width: '75px' }}
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
                          defaultMessage:
                            'Please enter a number between 1 and 10'
                        })
                      }
                    ]}
                    children={
                      <InputNumber
                        min={1}
                        max={10}
                        style={{ width: '75px' }}
                        onChange={handleChanged}
                      />
                    }
                  />
                  <div>{$t({ defaultMessage: 'Retries' })}</div>
                </Space>
              </Form.Item>
            </Space>
          )}
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
