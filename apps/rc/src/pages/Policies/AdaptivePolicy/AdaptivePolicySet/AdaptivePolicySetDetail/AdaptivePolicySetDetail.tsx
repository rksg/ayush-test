import { useEffect, useState } from 'react'

import { Form,Space, Typography } from 'antd'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { Features, useIsTierAllowed }                         from '@acx-ui/feature-toggle'
import {
  useGetAdaptivePolicySetQuery,
  useGetPrioritizedPoliciesQuery, useLazyGetDpskListQuery,
  useLazySearchMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType,
  useAdaptivePolicyBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { NetworkTable } from './NetworkTable'

export default function AdaptivePolicySetDetail () {
  const { $t } = useIntl()
  const { policyId, tenantId } = useParams()
  const { Paragraph } = Typography
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const [networkIdsInMacList, setNetworkIdsInMacList] = useState([] as string [])
  const [networkIdsInDpskList, setNetworkIdsInDpskList] = useState([] as string [])

  // eslint-disable-next-line max-len
  const { data: policySetData, isLoading: isGetAdaptivePolicySetLoading }= useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } })

  // eslint-disable-next-line max-len
  const { data: prioritizedPolicies } = useGetPrioritizedPoliciesQuery({ params: { policySetId: policyId } })

  const [ macRegList ] = useLazySearchMacRegListsQuery()

  const [ dpskList ] = useLazyGetDpskListQuery()

  const breadcrumb = useAdaptivePolicyBreadcrumb(PolicyType.ADAPTIVE_POLICY_SET)

  useEffect(() => {
    if(isGetAdaptivePolicySetLoading) return
    // eslint-disable-next-line max-len
    macRegList({ params: { tenantId, size: '100000', page: '1', sort: 'name,desc' }, payload: {
      dataOption: 'all',
      searchCriteriaList: [
        { filterKey: 'policySetId', operation: 'eq', value: policyId }
      ]
    } }).then(result => {
      if (result.data) {
        // eslint-disable-next-line max-len
        setNetworkIdsInMacList(result.data?.data.map(pool => pool.networkIds ?? []).flat() ?? [])
      }
    })
    if(isCloudpathEnabled) {
      // eslint-disable-next-line max-len
      dpskList({ params: { size: '100000', page: '0', sort: 'name,desc' } }).then(result => {
        if (result.data) {
          // eslint-disable-next-line max-len
          setNetworkIdsInDpskList(result.data?.data.filter(pool => pool.policySetId === policyId).map(pool => pool.networkIds ?? []).flat() ?? [])
        }
      })
    }
  }, [isGetAdaptivePolicySetLoading])

  return (
    <>
      <PageHeader
        title={policySetData?.name || ''}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <TenantLink
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
        ])}
      />
      <Space direction={'vertical'}>
        <Card>
          <Loader states={[
            { isLoading: isGetAdaptivePolicySetLoading }
          ]}>
            <Form layout={'vertical'}>
              <GridRow>
                <GridCol col={{ span: 6 }}>
                  <Form.Item label={$t({ defaultMessage: 'Policy Set Name' })}>
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
        <NetworkTable networkIds={[...new Set([...networkIdsInMacList, ...networkIdsInDpskList])]}/>
      </Space>
    </>
  )
}
