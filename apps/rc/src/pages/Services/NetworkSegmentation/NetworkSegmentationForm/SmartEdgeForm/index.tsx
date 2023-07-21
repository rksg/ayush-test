import { useEffect, useState } from 'react'

import { Col, Form, InputNumber, Row, Select, Space } from 'antd'
import { FormattedMessage, useIntl }                  from 'react-intl'
import { useNavigate, useParams }                     from 'react-router-dom'

import { Alert, Button, StepsForm, Tooltip, useStepFormContext }                 from '@acx-ui/components'
import { useGetDhcpByEdgeIdQuery, useGetEdgeDhcpListQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { EdgeDhcpPool, ServiceOperation, ServiceType, getServiceDetailsLink }    from '@acx-ui/rc/utils'
import { useTenantLink }                                                         from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupFormData } from '..'
import { useWatch }                         from '../../useWatch'

import { DhcpPoolTable }        from './DhcpPoolTable'
import { DhcpServiceModal }     from './DhcpServiceModal'
import { SelectDhcpPoolDrawer } from './SelectDhcpPoolDrawer'

interface SmartEdgeFormProps {
  editMode?: boolean
}

const dhcpDefaultPayload = {
  page: 1,
  pageSize: 10000
}

export const SmartEdgeForm = (props: SmartEdgeFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const tenantBasePath = useTenantLink('')
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const venueId = useWatch('venueId', form)
  const edgeId = useWatch('edgeId', form)
  const dhcpId = useWatch('dhcpId', form)
  const poolId = useWatch('poolId', form)
  const dhcpRelay = useWatch('dhcpRelay', form)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [shouldDhcpDisabled, setShouldDhcpDisabled] = useState(true)

  const edgeOptionsDefaultPayload = {
    fields: ['name', 'serialNumber'],
    pageSize: 10000,
    sortField: 'name',
    filters: { venueId: [venueId] },
    sortOrder: 'ASC'
  }

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
  const {
    dhcpProfles,
    dhcpOptions,
    isLoading: isDhcpOptionsLoading,
    poolMap
  } = useGetEdgeDhcpListQuery(
    { params, payload: dhcpDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          dhcpProfles: data?.content,
          dhcpOptions: data?.content.map(item => ({ label: item.serviceName, value: item.id })),
          poolMap: data?.content.reduce((acc, item) =>
            ({ ...acc, [item.id]: item.dhcpPools }), {}) as { [key: string]: EdgeDhcpPool[] },
          isLoading
        }
      }
    })

  useEffect(() => {
    if(isGetDhcpByEdgeIdFetching) return
    if(!dhcpId) {
      if(!edgeId || isGetDhcpByEdgeIdFail) {
        form.setFieldValue('dhcpId', null)
        form.setFieldValue('dhcpName', null)
      } else {
        form.setFieldValue('dhcpId', currentEdgeDhcp?.id)
        form.setFieldValue('dhcpName', currentEdgeDhcp?.serviceName)
      }
    }
    form.setFieldValue('dhcpRelay', currentEdgeDhcp?.dhcpRelay)
    setShouldDhcpDisabled(!isGetDhcpByEdgeIdFail)

  }, [
    currentEdgeDhcp,
    isGetDhcpByEdgeIdFail,
    edgeId,
    isGetDhcpByEdgeIdFetching
  ])

  const poolName = !!poolMap &&
    (poolMap[dhcpId]?.find(item => item.id === poolId)?.poolName || poolId)

  useEffect(() => {
    if(poolName) {
      form.setFieldValue('poolName', poolName)
    }
  }, [poolName])

  const onEdgeChange = (value: string) => {
    const edgeItem = edgeOptions?.find(item => item.value === value)
    form.setFieldValue('edgeName', edgeItem?.label)
    form.setFieldValue('dhcpId', null)
    form.setFieldValue('poolId', null)
    form.setFieldValue('poolName', null)
    form.setFieldValue('dhcpRelay', false)
  }

  const onDhcpChange = (value: string) => {
    const dhcpPorilfe = dhcpProfles?.find(item => item.id === value)
    form.setFieldValue('poolId', null)
    form.setFieldValue('poolName', null)
    form.setFieldValue('dhcpName', dhcpPorilfe?.serviceName)
    form.setFieldValue('dhcpRelay', dhcpPorilfe?.dhcpRelay)
  }

  const openDrawer = () => {
    setDrawerVisible(true)
  }

  const selectPool = (poolId?: string, poolName?: string) => {
    form.setFieldValue('poolId', poolId)
    form.setFieldValue('poolName', poolName)
    form.validateFields(['poolId'])
  }

  const navigateToDetailPage = () => {
    navigate(
      {
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
          type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.DETAIL,
          serviceId: params.serviceId!
        })
      })
  }

  const warningMsg = <FormattedMessage
    defaultMessage={
      `Please note that additional configuration is required in the external DHCP server 
        for the pool & segment mgmt. and the available document will be exposed on 
        this {detailPage}.`
    }

    values={{
      detailPage: props.editMode ?
        <Button
          type='link'
          size='small'
          onClick={navigateToDetailPage}
        >
          {$t({ defaultMessage: 'service details page' })}
        </Button>
        : $t({ defaultMessage: 'service details page' })
    }}
  />

  return (
    <>
      <SelectDhcpPoolDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        selectPool={selectPool}
        dhcpId={dhcpId}
        pools={poolMap && poolMap[dhcpId]}
        data={poolId}
      />
      <Row gutter={20}>
        <Col span={8}>
          <StepsForm.Title>{$t({ defaultMessage: 'SmartEdge Settings' })}</StepsForm.Title>
          <Form.Item
            name='edgeId'
            label={
              <>
                {$t({ defaultMessage: 'SmartEdge' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: `To enable the property management for a venue,
                  please go to the Venue configuration/property management page to enable it.` })}
                  placement='bottom'
                />
              </>
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please enter SmartEdge' })
            }]}
            children={
              <Select
                loading={isEdgeOptionsLoading}
                onChange={onEdgeChange}
                options={[
                  { label: $t({ defaultMessage: 'Select...' }), value: '' },
                  ...(edgeOptions || [])
                ]}
              />
            }
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            name='segments'
            label={$t({ defaultMessage: 'Number of Segments' })}
            rules={[
              { required: true },
              { type: 'number' }
            ]}
            children={<InputNumber />}
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            name='devices'
            label={$t({ defaultMessage: 'Number of devices per Segment' })}
            rules={[
              { required: true },
              { type: 'number' }
            ]}
            children={<InputNumber />}
          />
        </Col>
      </Row>
      <Row gutter={20} align='middle'>
        <Col span={8}>
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
        </Col>
        {
          !shouldDhcpDisabled && (
            <Col ><DhcpServiceModal /></Col>
          )
        }
      </Row>
      <Row gutter={20}>
        <Col span={8}>
          {
            dhcpId &&
            <Form.Item
              label={$t({ defaultMessage: 'DHCP Pool ' })}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select a DHCP Pool' })
                }
              ]}
            >
              <Space size={20}>
                {poolId ? poolName : $t({ defaultMessage: 'No Pool selected' })}
                {
                  !props.editMode &&
                  <Button
                    type='link'
                    onClick={openDrawer}
                    children={
                      poolId ?
                        $t({ defaultMessage: 'Change Pool' }) :
                        $t({ defaultMessage: 'Select Pool' })
                    }
                  />
                }
              </Space>
              {
                poolId &&
                <DhcpPoolTable
                  data={poolMap && poolMap[dhcpId]?.find(item => item.id === poolId)}
                />
              }
            </Form.Item>
          }
        </Col>
      </Row>
      {
        dhcpRelay &&
        <Row gutter={20}>
          <Col span={8}>
            <Alert message={warningMsg} type='info' showIcon />
          </Col>
        </Row>
      }
    </>
  )
}
