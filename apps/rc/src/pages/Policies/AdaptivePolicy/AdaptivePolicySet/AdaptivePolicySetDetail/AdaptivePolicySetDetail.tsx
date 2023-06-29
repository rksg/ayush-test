import { Form,Space, Typography } from 'antd'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }           from '@acx-ui/feature-toggle'
import {
  useGetAdaptivePolicySetQuery,
  useGetDpskListQuery,
  useGetPrioritizedPoliciesQuery,
  useSearchMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { NetworkTable } from './NetworkTable'

export default function AdaptivePolicySetDetail () {
  const { $t } = useIntl()
  const { policyId, tenantId } = useParams()
  const { Paragraph } = Typography
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST })

  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  // eslint-disable-next-line max-len
  const { data: policySetData, isLoading: isGetAdaptivePolicySetLoading }= useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } })

  // eslint-disable-next-line max-len
  const { data: prioritizedPolicies } = useGetPrioritizedPoliciesQuery({ params: { policySetId: policyId } })

  // eslint-disable-next-line max-len
  const { networkIdsInMacList } = useSearchMacRegListsQuery({ params: { tenantId, size: '100000', page: '1', sort: 'name,desc' },
    payload: {
      dataOption: 'all',
      searchCriteriaList: [
        { filterKey: 'policySetId', operation: 'eq', value: policyId }
      ]
    } }, {
    selectFromResult ({ data }) {
      return {
        networkIdsInMacList: data?.data.map(pool => pool.networkIds ?? []).flat() ?? []
      }
    } })

  // eslint-disable-next-line max-len
  const { networkIdsInDpsk } = useGetDpskListQuery({ params: { size: '100000', page: '0', sort: 'name,desc' } },
    {
      skip: !isCloudpathEnabled,
      selectFromResult ({ data }) {
        return {
          // eslint-disable-next-line max-len
          networkIdsInDpsk: data?.data.filter(pool => pool.policySetId === policyId).map(pool => pool.networkIds ?? []).flat() ?? []
        }
      } }
  )

  return (
    <>
      <PageHeader
        title={policySetData?.name || ''}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Adaptive Policy Sets' }),
            link: tablePath }
        ] : [
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Adaptive Set Policy' }),
            link: tablePath }
        ]}
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
        <NetworkTable networkIds={[...new Set([...networkIdsInMacList, ...networkIdsInDpsk])]}/>
      </Space>
    </>
  )
}
