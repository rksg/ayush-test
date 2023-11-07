import { useEffect } from 'react'

import { Col, Form, Input, Row, Select } from 'antd'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { StepsForm, useStepFormContext }                                                                        from '@acx-ui/components'
import { SpaceWrapper, TunnelProfileAddModal }                                                                  from '@acx-ui/rc/components'
import { useGetEdgeListQuery, useGetPortConfigQuery, useGetTunnelProfileViewDataListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { EdgeCentralizedForwardingSetting, EdgeStatusEnum, isDefaultTunnelProfile }                             from '@acx-ui/rc/utils'

import { CorePortFormItem } from './CorePortFormItem'

const tunnelProfileDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const SettingsForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { form, editMode } = useStepFormContext<EdgeCentralizedForwardingSetting>()

  const venueId = Form.useWatch('venueId', form)
  const edgeId = Form.useWatch('edgeId', form)

  const {
    venueOptions,
    isLoading: isVenueOptionsLoading
  } = useVenuesListQuery({
    params,
    payload: {
      fields: ['name', 'id', 'edges'],
      ...(editMode && { filters: { venueId: [venueId] } })
    } }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data
          .filter(i => (i.edges ?? 0) > 0)
          .map(item => ({
            label: item.name,
            value: item.id })),
        isLoading
      }
    } })

  const {
    edgeOptions,
    isLoading: isEdgeOptionsLoading
  } = useGetEdgeListQuery({
    params,
    payload: {
      fields: [
        'name',
        'serialNumber',
        'venueId'
      ],
      filters: {
        venueId: [venueId],
        deviceStatus: Object.values(EdgeStatusEnum)
          .filter(v => v !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD)
      } } },
  {
    skip: !venueId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        edgeOptions: data?.data.map(item => ({
          label: item.name,
          value: item.serialNumber,
          venueId: item.venueId
        })),
        isLoading
      }
    }
  })

  // get corePort by portsConfig API
  const { portsConfig } = useGetPortConfigQuery({
    params: { serialNumber: edgeId }
  }, {
    skip: !edgeId,
    selectFromResult: ({ data }) => {
      return {
        portsConfig: data?.ports ?? []
      }
    }
  })

  const {
    tunnelProfileOptions,
    isTunnelOptionsLoading
  } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelProfileOptions: data?.data
          .filter(t => isDefaultTunnelProfile(t, params.tenantId!) === false)
          .map(item => ({
            label: item.name, value: item.id
          })),
        isTunnelOptionsLoading: isLoading
      }
    }
  })

  // prepare venue info
  useEffect(() => {
    form.setFieldValue('venueName', venueOptions?.filter(i => i.value === venueId)[0]?.label)
  }, [venueId, venueOptions])

  // prepare corePort info
  useEffect(() => {
    if (portsConfig) {
    // find corePort
      const corePort = portsConfig?.find(port => port.corePortEnabled)
      form.setFieldValue('corePortMac', corePort?.mac)
      form.setFieldValue('corePortName', corePort?.name)
    }
  }, [portsConfig])

  const onVenueChange = () => {
    form.setFieldValue('edgeId', undefined)
  }

  const onEdgeChange = (val: string) => {
    const edgeData = edgeOptions?.filter(i => i.value === val)[0]
    form.setFieldValue('edgeName', edgeData?.label)
  }

  const onTunnelChange = (val: string) => {
    form.setFieldValue('tunnelProfileName',
      tunnelProfileOptions?.filter(i => i.value === val)[0]?.label)
  }

  return (
    <SpaceWrapper full direction='vertical' size={30}>
      <Row>
        <Col span={24}>
          <StepsForm.Title>
            {$t({ defaultMessage: 'Settings' })}
          </StepsForm.Title>
          <Row>
            <Col span={8}>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Service Name' })}
                rules={[
                  { required: true },
                  { min: 2, max: 32 }
                ]}
                children={<Input />}
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item
                name='venueId'
                label={$t({ defaultMessage: 'Venue' })}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select a Venue' })
                }]}
              >
                <Select
                  loading={isVenueOptionsLoading}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={venueOptions}
                  disabled={editMode}
                  onChange={onVenueChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item
                name='edgeId'
                label={$t({ defaultMessage: 'SmartEdge' })}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select a SmartEdge' })
                }]}
              >
                <Select
                  loading={isEdgeOptionsLoading}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={edgeOptions}
                  disabled={editMode}
                  onChange={onEdgeChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.corePortMac !== currentValues.corePortMac
                }
              >
                {({ getFieldValue }) => {
                  const corePort = getFieldValue('corePortMac')
                  const corePortName = getFieldValue('corePortName')
                  const edgeName = getFieldValue('edgeName')

                  return <Form.Item
                    name='corePortMac'
                    noStyle
                    rules={[{
                      required: true
                    }]}
                  >
                    <CorePortFormItem
                      data={corePort}
                      name={corePortName}
                      edgeId={edgeId}
                      edgeName={edgeName}
                      portsData={portsConfig}
                    />
                  </Form.Item>
                }}
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <StepsForm.Title>
            {$t({ defaultMessage: 'Tunnel Settings' })}
          </StepsForm.Title>
          <Row align='middle' gutter={9}>
            <Col span={8}>
              <Form.Item
                name='tunnelProfileId'
                label={$t({ defaultMessage: 'Tunnel Profile' })}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select a Tunnel Profile' })
                }]}
              >
                <Select
                  loading={isTunnelOptionsLoading}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={tunnelProfileOptions}
                  onChange={onTunnelChange}
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <TunnelProfileAddModal />
            </Col>
          </Row>
        </Col>
      </Row>
    </SpaceWrapper>
  )
}
