import { useContext, useEffect, useState } from 'react'

import { Col, Form, InputNumber, Row, Select, Space } from 'antd'
import { FormattedMessage, useIntl }                  from 'react-intl'
import { useNavigate, useParams }                     from 'react-router-dom'

import { Alert, Button, StepsForm, useStepFormContext }         from '@acx-ui/components'
import { AddEdgeDhcpServiceModal }                              from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery }                                 from '@acx-ui/rc/services'
import { ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { useTenantLink }                                        from '@acx-ui/react-router-dom'

import { PersonalIdentityNetworkFormData }    from '..'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { DhcpPoolTable }        from './DhcpPoolTable'
import { SelectDhcpPoolDrawer } from './SelectDhcpPoolDrawer'

interface SmartEdgeFormProps {
  editMode?: boolean
}

export const SmartEdgeForm = (props: SmartEdgeFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const tenantBasePath = useTenantLink('')
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    edgeOptions,
    isEdgeOptionsLoading,
    dhcpProfles,
    dhcpOptions,
    isDhcpOptionsLoading,
    poolMap,
    getDhcpPoolName
  } = useContext(PersonalIdentityNetworkFormContext)
  const edgeId = Form.useWatch('edgeId', form)
  const dhcpId = Form.useWatch('dhcpId', form) || form.getFieldValue('dhcpId')
  const poolId = form.getFieldValue('poolId')
  const dhcpRelay = form.getFieldValue('dhcpRelay')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [shouldDhcpDisabled, setShouldDhcpDisabled] = useState(true)
  const {
    currentEdgeDhcp,
    isGetDhcpByEdgeIdFail,
    isGetDhcpByEdgeIdFetching
  } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'id',
          'dhcpRelay'
        ],
        filters: { edgeClusterIds: [edgeId] }
      }
    },
    {
      skip: !Boolean(edgeId),
      selectFromResult: ({ data, isFetching }) => {
        return {
          currentEdgeDhcp: data?.data[0],
          isGetDhcpByEdgeIdFail: (data?.totalCount ?? 0) < 1,
          isGetDhcpByEdgeIdFetching: isFetching
        }
      }
    }
  )

  useEffect(() => {
    if(isGetDhcpByEdgeIdFetching) return
    if(!dhcpId) {
      if(!edgeId || isGetDhcpByEdgeIdFail) {
        form.setFieldValue('dhcpId', null)
      } else {
        form.setFieldValue('dhcpId', currentEdgeDhcp?.id)
      }
    }
    form.setFieldValue('dhcpRelay', dhcpRelay || currentEdgeDhcp?.dhcpRelay)
    setShouldDhcpDisabled(!isGetDhcpByEdgeIdFail)

  }, [
    currentEdgeDhcp,
    isGetDhcpByEdgeIdFail,
    edgeId,
    isGetDhcpByEdgeIdFetching
  ])

  const onEdgeChange = () => {
    form.setFieldsValue({
      dhcpId: undefined,
      poolId: undefined,
      dhcpRelay: false
    })
  }

  const onDhcpChange = (value: string) => {
    const dhcpPorilfe = dhcpProfles?.find(item => item.id === value)
    form.setFieldsValue({
      poolId: undefined,
      dhcpRelay: dhcpPorilfe?.dhcpRelay
    })
  }

  const openDrawer = () => {
    setDrawerVisible(true)
  }

  const selectPool = (poolId?: string) => {
    form.setFieldsValue({
      poolId
    })
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
        isRelayOn={dhcpRelay}
      />
      <Row gutter={20}>
        <Col span={8}>
          <StepsForm.Title>{$t({ defaultMessage: 'SmartEdge Settings' })}</StepsForm.Title>
          <Form.Item
            name='edgeId'
            label={$t({ defaultMessage: 'SmartEdge' })}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please enter SmartEdge' })
            }]}
            children={
              <Select
                loading={isEdgeOptionsLoading}
                placeholder={$t({ defaultMessage: 'Select...' })}
                onChange={onEdgeChange}
                options={[
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
                placeholder={$t({ defaultMessage: 'Select...' })}
                onChange={onDhcpChange}
                options={[
                  ...(dhcpOptions || [])
                ]}
                disabled={shouldDhcpDisabled}
              />
            }
          />
        </Col>
        {
          !shouldDhcpDisabled && (
            <Col ><AddEdgeDhcpServiceModal /></Col>
          )
        }
      </Row>
      <Row gutter={20}>
        <Col span={8}>
          {
            dhcpId &&
            <Form.Item
              name='poolId'
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select a DHCP Pool' })
                }
              ]}
              label={$t({ defaultMessage: 'DHCP Pool ' })}
            >
              <Space direction='vertical'>
                <Space size={20}>
                  {
                    poolId ?
                      getDhcpPoolName(dhcpId, poolId) :
                      $t({ defaultMessage: 'No Pool selected' })
                  }
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
              </Space>
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
