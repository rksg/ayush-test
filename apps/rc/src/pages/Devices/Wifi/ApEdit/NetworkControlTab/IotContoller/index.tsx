import { useEffect, useState, useContext, useRef } from 'react'

import { Button, Form, Switch, Row, Col, Space, Input } from 'antd'
import { isEmpty }                                      from 'lodash'
import { useIntl }                                      from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  AnchorContext
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import {
  IotControllerDrawer
} from '@acx-ui/rc/components'
import {
  useGetApIotQuery,
  useLazyGetVenueIotQuery,
  useUpdateApIotMutation
} from '@acx-ui/rc/services'
import {
  domainNameRegExp,
  transformDisplayOnOff
} from '@acx-ui/rc/utils'
import { ApIot, VenueIot } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { FieldLabel }                                    from '../../styledComponents'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


export function IotController (props: ApEditItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props
  const isIotV2Enabled = useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const {
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)

  const { venueData } = useContext(ApDataContext)
  const venueId = venueData?.id
  const { setReadyToScroll } = useContext(AnchorContext)

  const iot = useGetApIotQuery(
    {
      params: { venueId, serialNumber }
    },
    { skip: !venueId }
  )

  const [updateApIot, { isLoading: isUpdatingApIot }] =
    useUpdateApIotMutation()

  const [getVenueIot] = useLazyGetVenueIotQuery()

  const formRef = useRef<StepsFormLegacyInstance<ApIot>>()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [initData, setInitData] = useState({} as ApIot)
  const [apIot, setApIot] = useState({} as ApIot)
  const [venueIot, setVenueIot] = useState(
    {} as VenueIot
  )
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [formInitializing, setFormInitializing] = useState(true)

  const [iotEnabled, setIotEnabled] = useState(false)

  useEffect(() => {
    const iotData = iot?.data

    if (venueId && iotData) {
      const setIotData = async () => {
        const venueIotData = await getVenueIot(
          {
            params: { tenantId, venueId }
          },
          true
        ).unwrap()

        setVenueIot(venueIotData)
        setIsUseVenueSettings(iotData.useVenueSettings)
        isUseVenueSettingsRef.current = iotData.useVenueSettings
        setIotEnabled(iotData.enabled)

        if (formInitializing) {
          setInitData(iotData)
          setFormInitializing(false)

          setReadyToScroll?.((r) => [...new Set(r.concat('IOT-CONTROLLER'))])
        } else {
          formRef?.current?.setFieldsValue(iotData)
        }
      }

      setIotData()
    }
  }, [venueId, iot?.data])

  const handleVenueSetting = async () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApIot({ ...currentData })
      }

      if (venueIot) {
        const data = {
          ...venueIot,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)

        setIotEnabled(venueIot.enabled)
      }
    } else {
      if (!isEmpty(apIot)) {
        formRef?.current?.setFieldsValue(apIot)
        setIotEnabled(apIot.enabled)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const handleUpdateIot = async (values: ApIot) => {
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

      await updateApIot({
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
        unsavedTabKey: 'networkControl',
        tabTitle: $t({ defaultMessage: 'Network Control' }),
        isDirty: isDirty
      })

    setEditNetworkControlContextData &&
      setEditNetworkControlContextData({
        ...editNetworkControlContextData,
        updateApIot: () =>
          handleUpdateIot(form?.getFieldsValue()),
        discardApIotChanges: () => handleDiscard()
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

  const iotEnabledFieldName = 'enabled'
  const iotMqttBrokerAddressFieldName = 'mqttBrokerAddress'

  const toggleIot = (checked: boolean) => {
    setIotEnabled(checked)
  }

  const handleIotController = () => {
    setDrawerVisible(true)
  }

  return (
    <Loader
      states={[
        {
          isLoading: formInitializing,
          isFetching: isUpdatingApIot
        }
      ]}
    >
      { isIotV2Enabled ? (
        <StepsFormLegacy formRef={formRef} onFormChange={handleChange}>
          <StepsFormLegacy.StepForm initialValues={initData}>
            <VenueSettingsHeader
              venue={venueData}
              disabled={!isAllowEdit}
              isUseVenueSettings={isUseVenueSettings}
              handleVenueSetting={handleVenueSetting}
            />
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
            { drawerVisible && <IotControllerDrawer
              visible={drawerVisible}
              setVisible={setDrawerVisible}
            /> }
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      ) : (
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
                    {$t({ defaultMessage: 'Enable IoT Controller' })}
                  </Space>
                  <Form.Item
                    name={iotEnabledFieldName}
                    valuePropName={'checked'}
                    initialValue={false}
                    children={
                      isUseVenueSettings ? (
                        <span data-testid={'enabled-span'}>
                          {transformDisplayOnOff(venueIot?.enabled ?? false)}
                        </span>
                      ) : (
                        <Switch
                          disabled={!isAllowEdit}
                          checked={iotEnabled}
                          onChange={handleChange}
                          onClick={toggleIot}
                        />
                      )
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
                      isUseVenueSettings ? (
                        <span data-testid={'mqttBrokerAddress-span'}>
                          {formRef?.current?.getFieldValue(
                            iotMqttBrokerAddressFieldName
                          )}
                        </span>
                      ) : (
                        <Input disabled={!isAllowEdit}
                          onChange={handleChange}
                        />
                      )
                    }
                  />
                </Space>
              </Row>
            )}
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      )}
    </Loader>
  )

}
