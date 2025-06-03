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
  useGetApIotV2Query,
  useLazyGetIotControllerListQuery,
  useUpdateApIotV2Mutation,
  useUpdateApIotControllerMutation,
  useDeleteApIotControllerMutation
} from '@acx-ui/rc/services'
import { ApIotController, IotControllerStatus } from '@acx-ui/rc/utils'
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

  const iot = useGetApIotV2Query(
    {
      params: { venueId, serialNumber }
    },
    { skip: !venueId }
  )

  const [updateApIot, { isLoading: isUpdatingApIot }] =
    useUpdateApIotV2Mutation()

  const [getVenueIot] = useLazyGetIotControllerListQuery()

  const [form] = Form.useForm()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [initData, setInitData] = useState({} as ApIotController)
  const [apIot, setApIot] = useState({} as ApIotController)
  const [venueIot, setVenueIot] = useState(
    {} as IotControllerStatus
  )
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [formInitializing, setFormInitializing] = useState(true)

  const [drawerVisible, setDrawerVisible] = useState(false)
  // eslint-disable-next-line max-len
  const [initIotController, setInitIotController] = useState<IotControllerStatus | undefined>(undefined)
  const [iotController, setIotController] = useState<IotControllerStatus | undefined>(undefined)

  // eslint-disable-next-line max-len
  const [updateApIotController, { isLoading: isUpdatingApIotController }] = useUpdateApIotControllerMutation()
  // eslint-disable-next-line max-len
  const [deleteApIotController, { isLoading: isDeletingApIotController }] = useDeleteApIotControllerMutation()

  useEffect(() => {
    const iotData = iot?.data

    if (venueId && serialNumber && iotData) {
      const setIotData = async () => {
        const venueIotData = await getVenueIot(
          {
            payload: {
              fields: [
                'id',
                'name',
                'inboundAddress',
                'serialNumber',
                'publicAddress',
                'publicPort',
                'apiToken',
                'tenantId',
                'status',
                'venueId',
                'assocVenueId',
                'assocApId',
                'assocApVenueId'
              ],
              pageSize: 10,
              sortField: 'name',
              sortOrder: 'ASC',
              filters: { tenantId: [tenantId] }
            }
          },
          true
        ).unwrap()

        // eslint-disable-next-line max-len
        setVenueIot(venueIotData?.data.find((i) => i.assocApVenueId === venueId) as IotControllerStatus)
        // use venue settings or custom
        // eslint-disable-next-line max-len
        setInitIotController(venueIotData?.data.find((i) => i.assocApId === serialNumber) as IotControllerStatus)

        if (iotData.useVenueSettings) {
          // eslint-disable-next-line max-len
          setIotController(venueIotData?.data.find((i) => i.assocApVenueId === venueId) as IotControllerStatus)
        } else {
          // eslint-disable-next-line max-len
          setIotController(venueIotData?.data.find((i) => i.assocApId === serialNumber) as IotControllerStatus)
        }

        // for test
        // eslint-disable-next-line max-len
        // setIotController(venueIotData?.data[0] as IotControllerStatus)
        // setInitIotController(venueIotData?.data[0] as IotControllerStatus)
        // setVenueIot(venueIotData?.data[0] as IotControllerStatus)

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
  }, [venueId, serialNumber, iot?.data])

  const handleVenueSetting = async () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      const currentData = form.getFieldsValue()
      setApIot({ ...currentData })

      setIotController(venueIot)
      const data = {
        useVenueSettings: true
      }
      form.setFieldsValue(data)
    } else {
      if (!isEmpty(apIot)) {
        form.setFieldsValue(apIot)
      }
    }

    updateEditContext(true, undefined)
  }

  const handleUpdateIot = async (id: string | undefined) => {
    try {
      setEditContextData &&
        setEditContextData({
          ...editContextData,
          isDirty: false,
          hasError: false
        })

      const isUseVenue = isUseVenueSettingsRef.current
      const payload = {
        useVenueSettings: isUseVenue
      }

      if (isUseVenue) {
        await updateApIot({
          params: { venueId, serialNumber },
          payload
        }).unwrap()
        return
      }

      if (id) {
        await updateApIotController({
          params: { venueId, serialNumber, iotControllerId: id },
          payload
        }).unwrap()
      } else {
        await deleteApIotController({
          params: { venueId, serialNumber, iotControllerId: initIotController?.id },
          payload
        }).unwrap()
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateEditContext = (
    isDirty: boolean,
    id: string | undefined
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
          handleUpdateIot(id),
        discardApIotChanges: () => handleDiscard()
      })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings)
    isUseVenueSettingsRef.current = initData.useVenueSettings
    form.setFieldsValue(initData)
    setIotController(initIotController)
  }

  const iotNameFieldName = 'name'
  const iotInboundAddressFieldName = 'inboundAddress'


  const handleIotController = () => {
    setDrawerVisible(true)
  }

  const handleRemoveIotController = () => {
    setIotController(undefined)
    updateEditContext(true, undefined)
  }

  const handleApplyIotController = (value: IotControllerStatus) => {
    setIotController(value)
    updateEditContext(true, value.id)
  }

  return (
    <Loader
      states={[
        {
          isLoading: formInitializing,
          isFetching: isUpdatingApIot || isUpdatingApIotController || isDeletingApIotController
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
          {iotController?.name ? (
            <Row>
              <Col span={colSpan}>
                <Form.Item
                  name={iotNameFieldName}
                  style={{ display: 'inline-block', width: '230px' }}
                  label={$t({ defaultMessage: 'IoT Controller Name' })}
                  children={
                    <span>{iotController?.name}</span>
                  }
                />
                <Form.Item
                  name={iotInboundAddressFieldName}
                  style={{ display: 'inline-block', width: '230px' }}
                  label={$t({ defaultMessage: 'FQDN / IP' })}
                  children={
                    <span>{iotController?.inboundAddress}</span>
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
                    onClick={handleRemoveIotController}
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
            applyIotController={handleApplyIotController}
          /> }
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )

}
