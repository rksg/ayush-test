import { useCallback, useContext, useEffect, useState } from 'react'

import { Col, Form, InputNumber, Row, Select, Space, Typography } from 'antd'
import { FormattedMessage, useIntl }                              from 'react-intl'
import { useNavigate, useParams }                                 from 'react-router-dom'

import { Alert, Button, StepsForm, useStepFormContext }     from '@acx-ui/components'
import { AddEdgeDhcpServiceModal }                          from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetEdgeDhcpServiceQuery } from '@acx-ui/rc/services'
import {
  MAX_SEGMENT_PER_VENUE,
  MAX_DEVICE_PER_SEGMENT,
  PersonalIdentityNetworkFormData,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { DhcpPoolTable }        from './DhcpPoolTable'
import { SelectDhcpPoolDrawer } from './SelectDhcpPoolDrawer'

export const SmartEdgeForm = () => {

  const { $t } = useIntl()

  const params = useParams()
  const navigate = useNavigate()
  const tenantBasePath = useTenantLink('')
  const { form, editMode } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    clusterOptions,
    isClusterOptionsLoading,
    dhcpList,
    dhcpOptions,
    isDhcpOptionsLoading
  } = useContext(PersonalIdentityNetworkFormContext)

  const edgeClusterId = Form.useWatch('edgeClusterId', form)
  const dhcpId = Form.useWatch('dhcpId', form) || form.getFieldValue('dhcpId')
  const poolId = form.getFieldValue('poolId')
  const dhcpRelay = form.getFieldValue('dhcpRelay')

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [shouldDhcpDisabled, setShouldDhcpDisabled] = useState(true)

  const {
    poolList,
    isPoolListFetching
  } = useGetEdgeDhcpServiceQuery({ params: { id: dhcpId } }, {
    skip: !dhcpId,
    selectFromResult: ({ data, isFetching }) => {
      return {
        poolList: data?.dhcpPools,
        isPoolListFetching: isFetching
      }
    }
  })

  const {
    currentEdgeDhcp,
    currentEdgeDhcpIsRelay,
    isGetDhcpByEdgeIdFail,
    isGetDhcpByEdgeIdFetching
  } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'id',
          'dhcpRelay'
        ],
        filters: { edgeClusterIds: [edgeClusterId] }
      }
    },
    {
      skip: !Boolean(edgeClusterId),
      selectFromResult: ({ data, isFetching }) => {
        return {
          currentEdgeDhcp: data?.data[0],
          currentEdgeDhcpIsRelay: data?.data[0]?.dhcpRelay === 'true',
          isGetDhcpByEdgeIdFail: (data?.totalCount ?? 0) < 1,
          isGetDhcpByEdgeIdFetching: isFetching
        }
      }
    }
  )

  useEffect(() => {
    if(isGetDhcpByEdgeIdFetching) return
    if(!dhcpId) {
      if(!edgeClusterId || isGetDhcpByEdgeIdFail) {
        form.setFieldValue('dhcpId', null)
      } else {
        form.setFieldValue('dhcpId', currentEdgeDhcp?.id)
      }
    }

    form.setFieldValue('dhcpRelay', dhcpRelay || currentEdgeDhcpIsRelay)
    setShouldDhcpDisabled(!isGetDhcpByEdgeIdFail)

  }, [
    currentEdgeDhcp,
    isGetDhcpByEdgeIdFail,
    edgeClusterId,
    isGetDhcpByEdgeIdFetching
  ])

  const getDhcpPoolName = useCallback(() => {
    return poolList?.find(item => item.id === poolId)?.poolName
  }, [poolList, poolId])

  useEffect(() => {
    form.setFieldValue('poolName', getDhcpPoolName())
  }, [getDhcpPoolName])

  const onEdgeChange = () => {
    form.setFieldsValue({
      dhcpId: undefined,
      poolId: undefined,
      dhcpRelay: false
    })
  }

  const onDhcpChange = (value: string) => {
    const dhcpProfile = dhcpList?.find(item => item.id === value)
    form.setFieldsValue({
      poolId: undefined,
      dhcpRelay: dhcpProfile?.dhcpRelay === 'true'
    })
  }

  const openDrawer = () => {
    setDrawerVisible(true)
  }

  const selectPool = (poolId?: string) => {
    form.setFieldsValue({ poolId, poolName: getDhcpPoolName() })
    form.validateFields(['poolId'])
  }

  const navigateToDetailPage = () => {
    navigate(
      {
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
          type: ServiceType.PIN,
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
      detailPage: editMode ?
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
        pools={poolList}
        data={poolId}
        isRelayOn={dhcpRelay}
        isLoading={isPoolListFetching}
      />
      <Row gutter={20}>
        <Col span={8}>
          <StepsForm.Title>{$t({ defaultMessage: 'RUCKUS Edge Settings' })}</StepsForm.Title>
          <Row>
            <Col span={24}>
              <Form.Item
                name='edgeClusterId'
                label={$t({ defaultMessage: 'Cluster' })}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select Cluster' })
                }]}
                children={
                  <Select
                    loading={isClusterOptionsLoading}
                    disabled={editMode}
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    onChange={onEdgeChange}
                    options={[
                      ...(clusterOptions || [])
                    ]}
                  />
                }
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={0} style={{ marginBottom: '10px' }}>
        <Col span={12}>
          <Form.Item
            name='segments'
            label={$t({ defaultMessage: 'Number of Segments' })}
            rules={[
              { required: true },
              { type: 'integer', transform: Number, min: 1, max: MAX_SEGMENT_PER_VENUE,
                message: $t({
                  defaultMessage: 'Number of Segments must be an integer between 1 and {max}'
                }, { max: MAX_SEGMENT_PER_VENUE }) }
            ]}
            children={<InputNumber />}
          />
        </Col>
        <Col span={24} style={{ fontSize: '12px', marginTop: '-10px' }}>
          <Typography.Text type='secondary'>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Please note that the maximum number of User Equipment (UE) supported per personal area network is {maxPanSize}.' },
                { maxPanSize: MAX_DEVICE_PER_SEGMENT })
            }
          </Typography.Text>
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
                    poolId
                      ? getDhcpPoolName()
                      : $t({ defaultMessage: 'No Pool selected' })
                  }
                  {
                    !editMode &&
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
                    data={poolList?.find(item => item.id === poolId)}
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