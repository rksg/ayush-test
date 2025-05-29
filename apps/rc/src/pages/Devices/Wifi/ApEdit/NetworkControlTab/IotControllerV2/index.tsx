import { useEffect, useState, useContext, useRef } from 'react'

import { Button, Form, Row, Col, Space } from 'antd'
import { isEmpty }                       from 'lodash'
import { useIntl }                       from 'react-intl'

import {
  Loader,
  StepsForm,
  AnchorContext
} from '@acx-ui/components'
import {
  IotControllerDrawer
} from '@acx-ui/rc/components'
import {
  useGetApIotQuery,
  useLazyGetVenueIotQuery,
  useUpdateApIotV2Mutation
} from '@acx-ui/rc/services'
import { ApIot, VenueIot } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


export function IotControllerV2 (props: ApEditItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props

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
    useUpdateApIotV2Mutation()

  const [getVenueIot] = useLazyGetVenueIotQuery()

  const [form] = Form.useForm()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [initData, setInitData] = useState({} as ApIot)
  const [apIot, setApIot] = useState({} as ApIot)
  const [venueIot, setVenueIot] = useState(
    {} as VenueIot
  )
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [formInitializing, setFormInitializing] = useState(true)

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

        if (formInitializing) {
          setInitData(iotData)
          setFormInitializing(false)

          setReadyToScroll?.((r) => [...new Set(r.concat('IOT-CONTROLLER'))])
        } else {
          form.setFieldsValue(iotData)
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
      const currentData = form.getFieldsValue()
      setApIot({ ...currentData })

      if (venueIot) {
        const data = {
          ...venueIot,
          useVenueSettings: true
        }
        form.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apIot)) {
        form.setFieldsValue(apIot)
      }
    }

    updateEditContext(true)
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
    // form: StepsFormLegacyInstance,
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
    form.setFieldsValue(initData)
  }

  const iotMqttBrokerAddressFieldName = 'mqttBrokerAddress'

  const [drawerVisible, setDrawerVisible] = useState(false)

  const handleIotController = () => {
    setDrawerVisible(true)
  }

  const handleChanged = () => {
    // TODO update editContextData
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
      <StepsForm
        form={form}
        initialValues={initData}
      >
        <StepsForm.StepForm>
          <VenueSettingsHeader
            venue={venueData}
            disabled={!isAllowEdit}
            isUseVenueSettings={isUseVenueSettings}
            handleVenueSetting={handleVenueSetting}
          />
          {apIot?.mqttBrokerAddress?.length > 0 ? (
            <Row>
              <Col span={colSpan}>
                <Form.Item
                  name={iotMqttBrokerAddressFieldName}
                  style={{ display: 'inline-block', width: '230px' }}
                  label={$t({ defaultMessage: 'IoT Controller Name' })}
                  children={
                    <span>{apIot?.mqttBrokerAddress}</span>
                  }
                />
                <Form.Item
                  name={iotMqttBrokerAddressFieldName}
                  style={{ display: 'inline-block', width: '230px' }}
                  label={$t({ defaultMessage: 'FQDN / IP' })}
                  children={
                    <span>{apIot?.mqttBrokerAddress}</span>
                  }
                />
              </Col>
              {!isUseVenueSettings &&
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
            !isUseVenueSettings &&
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
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )

}
