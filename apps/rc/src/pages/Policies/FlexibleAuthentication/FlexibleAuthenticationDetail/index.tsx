import { Card, Space, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  SummaryCard,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import {
  authenticationTypeLabel,
  authFailActionTypeLabel,
  authTimeoutActionTypeLabel,
  portControlTypeLabel,
  PortControl
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
  usePolicyListBreadcrumb,
  getPolicyAllowedOperation,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }                    from '@acx-ui/react-router-dom'
import { SwitchScopes }                             from '@acx-ui/types'
import { filterByAccess, hasCrossVenuesPermission } from '@acx-ui/user'
import { noDataDisplay }                            from '@acx-ui/utils'

import { getItemTooltip } from '../FlexibleAuthenticationTable'

const FlexibleAuthenticationDetail = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { profileDetail, isLoading: isProfileDetailLoading }
  = useGetFlexAuthenticationProfilesQuery({
    payload: {
      filters: { id: [params.policyId] }
    }
  }, {
    selectFromResult: ( { data, isLoading } ) => {
      return {
        profileDetail: data?.data?.[0],
        isLoading
      }
    }
  }
  )

  const tableQuery = useTableQuery({
    useQuery: useGetFlexAuthenticationProfileAppliedTargetsQuery,
    apiParams: { profileId: params.policyId ?? '' },
    defaultPayload: {},
    sorter: {
      sortField: 'switchName',
      sortOrder: 'ASC'
    },
    option: {
      skip: !params.policyId
    }
  })

  const getContent = (field: keyof FlexibleAuthentication) => {
    return profileDetail?.[field] ?? noDataDisplay
  }

  const profileInfo = [{
    title: $t({ defaultMessage: 'Type' }),
    content: () => {
      const type = profileDetail?.['authenticationType']
      return type
        ? $t(authenticationTypeLabel[type as keyof typeof authenticationTypeLabel])
        : noDataDisplay
    }
  }, {
    title: $t({ defaultMessage: 'Change Authentication Order' }),
    content: () => {
      const changeAuthOrder = profileDetail?.['changeAuthOrder']
      return changeAuthOrder ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
    }
  }, {
    title: $t({ defaultMessage: '802.1x Port Control' }),
    content: () => {
      const dot1xPortControl = profileDetail?.['dot1xPortControl']
      return dot1xPortControl
        ? $t(portControlTypeLabel[dot1xPortControl as keyof typeof portControlTypeLabel])
        : $t(portControlTypeLabel[PortControl.NONE])
    }
  }, {
    title: $t({ defaultMessage: 'Auth Default VLAN' }),
    content: () => getContent('authDefaultVlan')
  }, {
    title: $t({ defaultMessage: 'Fail Action' }),
    content: () => {
      const authFailAction = profileDetail?.['authFailAction']
      return authFailAction
        // eslint-disable-next-line max-len
        ? $t(authFailActionTypeLabel[authFailAction as keyof typeof authFailActionTypeLabel])
        : noDataDisplay
    }
  }, {
    title: $t({ defaultMessage: 'Restricted VLAN' }),
    content: () => getContent('restrictedVlan')
  }, {
    title: $t({ defaultMessage: 'Timeout Action' }),
    content: () => {
      const authTimeoutAction = profileDetail?.['authTimeoutAction']
      return authTimeoutAction
        // eslint-disable-next-line max-len
        ? $t(authTimeoutActionTypeLabel[authTimeoutAction as keyof typeof authTimeoutActionTypeLabel])
        : noDataDisplay
    }
  }, {
    title: $t({ defaultMessage: 'Critical VLAN' }),
    content: () => getContent('criticalVlan')
  }, {
    title: $t({ defaultMessage: 'Guest VLAN' }),
    content: () => getContent('guestVlan')
  }] as {
    title: string;
    content: () => string | number | boolean
  }[]

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
    dataIndex: 'ports',
    render: (_, { ports }) => {
      const portList = ports?.[0].split(',')?.sort()
      return portList?.length
        ? <Tooltip dottedUnderline title={getItemTooltip(portList)}>{ portList?.length }</Tooltip>
        : noDataDisplay
    }
  }]

  return (<>
    <PageHeader
      title={profileDetail?.profileName}
      breadcrumb={usePolicyListBreadcrumb(PolicyType.FLEX_AUTH)}
      extra={hasCrossVenuesPermission() && filterByAccess([
        <TenantLink
          scopeKey={[SwitchScopes.UPDATE]}
          rbacOpsIds={getPolicyAllowedOperation(PolicyType.FLEX_AUTH, PolicyOperation.EDIT)}
          to={getPolicyDetailsLink({
            type: PolicyType.FLEX_AUTH,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId!
          })}>
          <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
    />
    <Loader states={[{ isLoading: isProfileDetailLoading || tableQuery.isLoading }]}>
      <Space direction='vertical' size={30}>
        <SummaryCard data={!isProfileDetailLoading ? profileInfo : []} colPerRow={6} />
        <Card>
          <div>
            <Typography.Title level={2}>
              {$t(
                { defaultMessage: 'Instances ({count})' },
                { count: tableQuery?.data?.data?.length ?? 0 }
              )}
            </Typography.Title>
          </div>
          <Table
            rowKey={'switchId'}
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
