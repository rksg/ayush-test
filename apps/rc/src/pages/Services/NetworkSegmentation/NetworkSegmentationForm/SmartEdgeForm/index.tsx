import { useEffect, useState } from 'react'

import { Col, Form, InputNumber, Row, Select, Space } from 'antd'
import { useIntl }                                    from 'react-intl'
import { useParams }                                  from 'react-router-dom'

import { Button, StepsForm, useStepFormContext }                                 from '@acx-ui/components'
import { useGetDhcpByEdgeIdQuery, useGetEdgeDhcpListQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { EdgeDhcpPool }                                                          from '@acx-ui/rc/utils'

import { NetworkSegmentationGroupForm } from '..'

import { SelectDhcpPoolDrawer } from './SelectDhcpPoolDrawer'

const edgeOptionsDefaultPayload = {
  fields: ['name', 'serialNumber'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const dhcpDefaultPayload = {
  page: 1,
  pageSize: 10000
}

export const SmartEdgeForm = () => {

  const { $t } = useIntl()
  const params = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()
  const edgeId = Form.useWatch('edgeId', form)
  const dhcpId = Form.useWatch('dhcpId', form)
  const poolName = Form.useWatch('poolName', form)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [shouldDhcpDisabled, setShouldDhcpDisabled] = useState(true)
  const { edgeOptions, isLoading: isEdgeOptionsLoading } = useGetEdgeListQuery(
    { params, payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          edgeOptions: data?.data.map(item => ({ label: item.name, value: item.serialNumber })),
          isLoading
        }
      }
    })
  const {
    data: currentEdgeDhcp,
    isError: isGetDhcpByEdgeIdFail,
    isFetching: isGetDhcpByEdgeIdFetching
  } = useGetDhcpByEdgeIdQuery(
    { params: { ...params, edgeId: edgeId } },
    { skip: !!!edgeId }
  )
  const { dhcpOptions, isLoading: isDhcpOptionsLoading, poolMap } = useGetEdgeDhcpListQuery(
    { params, payload: dhcpDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          dhcpOptions: data?.content.map(item => ({ label: item.serviceName, value: item.id })),
          poolMap: data?.content.reduce((acc, item) =>
            ({ ...acc, [item.id]: item.dhcpPools }), {}) as { [key: string]: EdgeDhcpPool[] },
          isLoading
        }
      }
    })

  useEffect(() => {
    if(!isGetDhcpByEdgeIdFetching) {
      form.setFieldValue('dhcpId', (!!!edgeId || isGetDhcpByEdgeIdFail) ?
        null :
        currentEdgeDhcp?.id)
      setShouldDhcpDisabled(!isGetDhcpByEdgeIdFail)
    }
  }, [
    currentEdgeDhcp,
    isGetDhcpByEdgeIdFail,
    edgeId,
    isGetDhcpByEdgeIdFetching
  ])

  const onEdgeChange = (value: string) => {
    const edgeItem = edgeOptions?.find(item => item.value === value)
    form.setFieldValue('edgeName', edgeItem?.label)
  }

  const onDhcpChange = (value: string) => {
    const dhcpItem = dhcpOptions?.find(item => item.value === value)
    form.setFieldValue('poolId', null)
    form.setFieldValue('poolName', null)
    form.setFieldValue('dhcpName', dhcpItem?.label)
  }

  const openDrawer = () => {
    setDrawerVisible(true)
  }

  const selectPool = (poolId?: string, poolName?: string) => {
    form.setFieldValue('poolId', poolId)
    form.setFieldValue('poolName', poolName)
    form.validateFields(['poolId'])
  }

  return (
    <Row gutter={20}>
      <Col span={8}>
        <SelectDhcpPoolDrawer
          visible={drawerVisible}
          setVisible={setDrawerVisible}
          selectPool={selectPool}
          data={poolMap && poolMap[dhcpId]}
        />
        <StepsForm.Title>{$t({ defaultMessage: 'SmartEdge Settings' })}</StepsForm.Title>
        <Form.Item
          name='edgeId'
          label={$t({ defaultMessage: 'SmartEdge' })}
          rules={[{ required: true }]}
          children={
            <Select
              loading={isEdgeOptionsLoading}
              onChange={onEdgeChange}
              options={[
                { label: $t({ defaultMessage: 'Select...' }), value: null },
                ...(edgeOptions || [])
              ]}
            />
          }
        />
        <Form.Item
          name='segments'
          label={$t({ defaultMessage: 'Number of Segments' })}
          rules={[
            { required: true },
            { type: 'number' }
          ]}
          children={<InputNumber />}
        />
        <Form.Item
          name='devices'
          label={$t({ defaultMessage: 'Number of devices per Segment' })}
          rules={[
            { required: true },
            { type: 'number' }
          ]}
          children={<InputNumber />}
        />
        <Form.Item
          name='dhcpId'
          label={$t({ defaultMessage: 'DHCP Service ' })}
          rules={[{ required: true }]}
          children={
            <Select
              loading={isDhcpOptionsLoading}
              onChange={onDhcpChange}
              options={[
                { label: $t({ defaultMessage: 'Select...' }), value: null },
                ...(dhcpOptions || [])
              ]}
              disabled={shouldDhcpDisabled}
            />
          }
        />
        {
          dhcpId &&
            <Form.Item
              name='poolId'
              label={$t({ defaultMessage: 'DHCP Pool ' })}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select a DHCP Pool' })
                }
              ]}
            >
              <Space size={20}>
                {poolName ? poolName : $t({ defaultMessage: 'No Pool selected' })}
                <Button
                  type='link'
                  onClick={openDrawer}
                  children={
                    poolName ?
                      $t({ defaultMessage: 'Change Pool' }) :
                      $t({ defaultMessage: 'Select Pool' })
                  }
                />
              </Space>
            </Form.Item>
        }
      </Col>
    </Row>
  )
}
