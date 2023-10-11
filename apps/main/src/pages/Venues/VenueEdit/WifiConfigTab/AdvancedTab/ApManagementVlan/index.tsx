import { useContext, useEffect, useState } from 'react'

import { Col, InputNumber, Form, Radio, Row, Slider, Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Loader, StepsFormLegacy }                                                  from '@acx-ui/components'
import { useGetVenueApManagementVlanQuery, useUpdateVenueApManagementVlanMutation } from '@acx-ui/rc/services'
import { ApMgmtVlan }                                                               from '@acx-ui/rc/utils'

import { VenueEditContext } from '../../../index'

export function ApManagementVlan () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)

  const [enableApManagementVlan, setEnableApManagementVlan] = useState(false)
  const getVenueApManagementVlan = useGetVenueApManagementVlanQuery({ params: { venueId } })
  const [updateVenueApManagementVlan, { isLoading: isUpdatingVenueManagementVlan }] =
    useUpdateVenueApManagementVlanMutation()

  useEffect(() => {
    const { data } = getVenueApManagementVlan
    if (!getVenueApManagementVlan?.isLoading) {
      setEnableApManagementVlan(data?.vlanOverrideEnabled ?? false)
    }
  }, [getVenueApManagementVlan])

  const handleChanged = (checked: boolean, vlanId: number) => {
    const newData = { vlanOverrideEnabled: checked, vlanId: vlanId }
    setEnableApManagementVlan(newData.vlanOverrideEnabled)
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: true
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateApManagementVlan: () => updateApManagementVlan(newData)
    })
  }

  const updateApManagementVlan = async (newData: ApMgmtVlan) => {
    try {
      await updateVenueApManagementVlan({
        params: { tenantId, venueId },
        payload: newData
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[{
      isLoading: getVenueApManagementVlan.isLoading,
      isFetching: isUpdatingVenueManagementVlan
    }]}>
      <Row>
        <Col span={colSpan}>
          <Form.Item
            name='steeringMode'
            label={$t({ defaultMessage: 'Steering Mode' })}
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio
                  defaultChecked>
                  {$t({ defaultMessage: 'Use AP’s settings' })}
                </Radio>
                <Radio>
                  {$t({ defaultMessage: 'VLAN ID' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </Loader>
  )

}