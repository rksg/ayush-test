import { useContext, useEffect, useState } from 'react'

import { Button, Col, Form, Row, Space } from 'antd'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import {
  AnchorContext,
  Loader
} from '@acx-ui/components'
import {
  IotControllerDrawer
} from '@acx-ui/rc/components'
import {
  useGetIotControllerListQuery,
  useUpdateVenueIotControllerMutation,
  useDeleteVenueIotControllerMutation
} from '@acx-ui/rc/services'
import {
  IotControllerStatus
} from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'


export function IotControllerV2 (props: VenueWifiConfigItemProps) {
  const colSpan = 8
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { isAllowEdit=true } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  // eslint-disable-next-line max-len
  const [initIotController, setInitIotController] = useState<IotControllerStatus | undefined>(undefined)
  const [iotController, setIotController] = useState<IotControllerStatus | undefined>(undefined)

  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const form = Form.useFormInstance()

  // eslint-disable-next-line max-len
  const [updateVenueIotController, { isLoading: isUpdatingVenueApIot }] = useUpdateVenueIotControllerMutation()
  // eslint-disable-next-line max-len
  const [deleteVenueIotController, { isLoading: isDeletingVenueApIot }] = useDeleteVenueIotControllerMutation()

  // eslint-disable-next-line max-len
  const { data: availableIotControllers, isLoading } = useGetIotControllerListQuery({
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
      filters: { tenantId: [tenantId], venueId: [venueId] }
    }
  })

  const venueApIot = availableIotControllers?.data?.[0]

  useEffect(() => {
    const venueApIotData = venueApIot
    if (venueApIotData) {
      setInitIotController(venueApIotData)
      setIotController(venueApIotData)

      setReadyToScroll?.((r) => [...new Set(r.concat('IoT-Controller'))])
    }
  }, [form, venueApIot, setReadyToScroll])

  const updateIotController = async (id: string | undefined) => {
    try {
      if (id) {
        await updateVenueIotController({
          params: { venueId, iotControllerId: id }
        }).unwrap()
      } else {
        await deleteVenueIotController({
          params: { venueId, iotControllerId: initIotController?.id }
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const discardIotController = async () => {
    if (initIotController) {
      setIotController(initIotController)
    }
  }

  const handleChanged = (id: string | undefined) => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: true
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateVenueIot: () => updateIotController(id),
      discardVenueIot: discardIotController
    })
  }

  const iotNameFieldName = ['iot', 'name']
  const iotInboundAddressFieldName = ['iot', 'inboundAddress']

  const handleIotController = () => {
    setDrawerVisible(true)
  }

  const handleRemoveIotController = () => {
    setIotController(undefined)
    handleChanged(undefined)
  }
  const handleApplyIotController = (value: IotControllerStatus) => {
    setIotController(value)
    handleChanged(value.id)
  }

  return (
    <Loader
      states={[
        {
          isLoading,
          isFetching: isUpdatingVenueApIot || isDeletingVenueApIot
        }
      ]}
    >
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
                onClick={handleRemoveIotController}
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
        applyIotController={handleApplyIotController}
      /> }
    </Loader>
  )
}
