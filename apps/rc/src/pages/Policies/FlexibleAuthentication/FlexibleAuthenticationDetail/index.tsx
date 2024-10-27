import { Card, Space, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { Button, Loader, PageHeader, SummaryCard, Table, TableProps } from '@acx-ui/components'
import {
  authenticationTypeLabel,
  authFailActionTypeLabel,
  authTimeoutActionTypeLabel,
  portControlTypeLabel
} from '@acx-ui/rc/components'
import {
  useGetFlexAuthenticationProfilesQuery,
  useGetFlexAuthenticationProfileAppliedTargetsQuery
}                      from '@acx-ui/rc/services'
import {
  FlexibleAuthentication,
  FlexibleAuthenticationAppliedTargets,
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { SwitchScopes }          from '@acx-ui/types'
import { filterByAccess }        from '@acx-ui/user'
import { noDataDisplay }         from '@acx-ui/utils'

const FlexibleAuthenticationDetail = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { profileDetail } = useGetFlexAuthenticationProfilesQuery(
    { payload: {
      filters: { id: [params.policyId] }
    } }, {
      selectFromResult: ( { data, isLoading, isFetching } ) => {
        return {
          profileDetail: data?.data?.[0],
          isLoading,
          isFetching
        }
      }
    }
  )

  const tableQuery = useTableQuery({
    useQuery: useGetFlexAuthenticationProfileAppliedTargetsQuery,
    apiParams: { profileId: params.policyId ?? '' },
    defaultPayload: {
      filters: { id: [params.policyId] }
    },
    sorter: {
      sortField: 'profileName',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['profileName']
    },
    option: {
      skip: !params.policyId
    }
  })

  const getContent = (field: keyof FlexibleAuthentication) => {
    return profileDetail?.[field] ?? noDataDisplay
  }

  const profileInfo = [
    {
      title: $t({ defaultMessage: 'Type' }),
      content: () => {
        const type = profileDetail?.['authenticationType']
        return $t(authenticationTypeLabel[type as keyof typeof authenticationTypeLabel])
      }
    },
    {
      title: $t({ defaultMessage: 'Change Authentication Order' }),
      content: () => {
        const changeAuthOrder = profileDetail?.['changeAuthOrder']
        return changeAuthOrder ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
      }
    },
    {
      title: $t({ defaultMessage: '802.1x Port Control' }),
      content: () => {
        const dot1xPortControl = profileDetail?.['dot1xPortControl']
        return $t(portControlTypeLabel[dot1xPortControl as keyof typeof portControlTypeLabel])
      }
    },
    {
      title: $t({ defaultMessage: 'Auth Default VLAN' }),
      content: () => (getContent('authDefaultVlan'))
    },
    {
      title: $t({ defaultMessage: 'Fail Action' }),
      content: () => {
        const authFailAction = profileDetail?.['authFailAction']
        return $t(authFailActionTypeLabel[authFailAction as keyof typeof authFailActionTypeLabel])
      }
    },
    {
      title: $t({ defaultMessage: 'Restricted VLAN' }),
      content: () => (getContent('restrictedVlan'))
    },
    {
      title: $t({ defaultMessage: 'Timeout Action' }),
      content: () => {
        const authTimeoutAction = profileDetail?.['authTimeoutAction']
        return $t(
          authTimeoutActionTypeLabel[authTimeoutAction as keyof typeof authTimeoutActionTypeLabel]
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Critical VLAN' }),
      content: () => (getContent('criticalVlan'))
    }
  ]

  const columns: TableProps<FlexibleAuthenticationAppliedTargets>['columns'] = [{
    title: $t({ defaultMessage: 'Switch' }),
    key: 'switchName',
    dataIndex: 'switchName',
    sorter: true,
    defaultSortOrder: 'ascend',
    searchable: true
  },
  {
    title: $t({ defaultMessage: 'Model' }),
    key: 'switchModel',
    dataIndex: 'switchModel',
    sorter: true
  },
  {
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    key: 'venueName',
    filterable: true,
    dataIndex: 'venueName'
  },
  {
    title: $t({ defaultMessage: 'Port' }),
    key: 'port',
    dataIndex: 'ports' //TODO
  }]

  return (<>
    <PageHeader
      title={profileDetail?.profileName}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        { text: $t({ defaultMessage: 'Policies & Profiles' })
          , link: getPolicyListRoutePath(true) },
        {
          text: $t({ defaultMessage: 'Flexible Authentication' }),
          link: getPolicyRoutePath({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.LIST
          })
        }
      ]}
      extra={filterByAccess([
        <TenantLink scopeKey={[SwitchScopes.UPDATE]}
          to={getPolicyDetailsLink({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId!
          })}>
          <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
    />
    <Loader states={[tableQuery]}>
      <Space direction='vertical' size={30}>
        <SummaryCard data={profileInfo} colPerRow={6} />
        <Card>
          <div>
            <Typography.Title level={2}>
              {$t(
                { defaultMessage: 'Instances ({count})' },
                { count: 0 }
              )}
            </Typography.Title>
          </div>
          <Table
            rowKey={'id'}
            columns={columns}
            dataSource={tableQuery?.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            onFilterChange={tableQuery.handleFilterChange}
          />
        </Card>
      </Space>
    </Loader>
  </>)
}

export default FlexibleAuthenticationDetail
