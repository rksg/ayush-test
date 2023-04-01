import React from 'react'

import { Form,Space, Typography } from 'antd'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, PageHeader }           from '@acx-ui/components'
import { useGetAdaptivePolicySetQuery, useGetPrioritizedPoliciesQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

// TODO: need to update after integrate with network
// export interface NetworkTable {
//   id: string,
//   name: string,
//   type: string,
//   venues: number
// }
//
// function useColumns () {
//   const { $t } = useIntl()
//   const columns: TableProps<NetworkTable>['columns'] = [
//     {
//       key: 'name',
//       title: $t({ defaultMessage: 'Network Name' }),
//       dataIndex: 'name',
//       defaultSortOrder: 'ascend'
//     },
//     {
//       title: $t({ defaultMessage: 'Type' }),
//       key: 'type',
//       dataIndex: 'type'
//     },
//     {
//       key: 'venues',
//       title: $t({ defaultMessage: 'Venues' }),
//       dataIndex: 'venues'
//     }
//   ]
//   return columns
// }

export function AdaptivePolicySetDetail () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { Paragraph } = Typography

  // eslint-disable-next-line max-len
  const { data: policySetData, isLoading: isGetAdaptivePolicySetLoading }= useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } })

  // eslint-disable-next-line max-len
  const { data: prioritizedPolicies } = useGetPrioritizedPoliciesQuery({ params: { policySetId: policyId } })

  return (
    <>
      <PageHeader
        title={policySetData?.name || ''}
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
          { text: $t({ defaultMessage: 'Adaptive Set Policy' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST }) }
        ]}
        extra={[
          <TenantLink
            key='edit'
            to={
              getPolicyDetailsLink({
                type: PolicyType.ADAPTIVE_POLICY_SET,
                oper: PolicyOperation.EDIT,
                policyId: policyId as string
              })
            }
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Space direction={'vertical'}>
        <Card>
          <Loader states={[
            { isLoading: isGetAdaptivePolicySetLoading }
          ]}>
            <Form layout={'vertical'}>
              <GridRow>
                <GridCol col={{ span: 6 }}>
                  <Form.Item label={$t({ defaultMessage: 'Policy Name' })}>
                    <Paragraph>{policySetData?.name}</Paragraph>
                  </Form.Item>
                </GridCol>
                <GridCol col={{ span: 6 }}>
                  <Form.Item label={$t({ defaultMessage: 'Members' })}>
                    <Paragraph>{prioritizedPolicies?.totalCount ?? 0}</Paragraph>
                  </Form.Item>
                </GridCol>
              </GridRow>
            </Form>
          </Loader>
        </Card>
        {/* TODO: need to update after integrate with network*/}
        {/*<Card title={$t({ defaultMessage: 'Instance ({size})' },*/}
        {/*  { size: 0 })}>*/}
        {/*  <div style={{ width: '100%' }}>*/}
        {/*    <Table*/}
        {/*      rowKey='id'*/}
        {/*      columns={useColumns()}*/}
        {/*      dataSource={[] as NetworkTable []}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</Card>*/}
      </Space>
    </>
  )
}
