import React from 'react'

import { useIntl } from 'react-intl'

import { Button, Card, PageHeader, SummaryCard, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import {
  useGetWebAuthTemplateQuery,
  useGetWebAuthTemplateSwitchesQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  WebAuthTemplate,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  isDefaultWebAuth
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useParams } from '@acx-ui/react-router-dom'


export function NetworkSegAuthSummary ({ data }: { data?: WebAuthTemplate }) {
  const { $t } = useIntl()

  const networkSegAuthInfo = [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      content: data?.name
    },
    {
      title: $t({ defaultMessage: 'Header' }),
      content: data?.webAuthCustomTop
    },
    {
      title: $t({ defaultMessage: 'Title' }),
      content: data?.webAuthCustomTitle
    },
    {
      title: $t({ defaultMessage: 'Password Label' }),
      content: data?.webAuthPasswordLabel
    },
    {
      title: $t({ defaultMessage: 'Tags' }),
      content: data?.tag,
      visible: false
    },
    {
      title: $t({ defaultMessage: 'Button' }),
      content: data?.webAuthCustomLoginButton
    },
    {
      title: $t({ defaultMessage: 'Footer' }),
      content: data?.webAuthCustomBottom
    }
  ]

  return <SummaryCard data={networkSegAuthInfo} colPerRow={4} />
}

type WebAuthSwitchType = {
  switchId: string,
  serialNumber: string,
  switchModel: string,
  switchName: string,
  venueId: string,
  venueName: string
}

export default function NetworkSegAuthDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const location = useLocation()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { data } = useGetWebAuthTemplateQuery({
    params, enableRbac: isSwitchRbacEnabled
  })
  const { data: switches } = useGetWebAuthTemplateSwitchesQuery({
    params, enableRbac: isSwitchRbacEnabled
  })

  const columns: TableProps<WebAuthSwitchType>['columns'] = React.useMemo(() => {
    return [{
      key: 'switchName',
      title: $t({ defaultMessage: 'Access Switches' }),
      dataIndex: 'switchName',
      sorter: true,
      width: 360,
      fixed: 'left',
      render: (data, row) => (
        <TenantLink
          to={`/devices/switch/${row.switchId}/${row.serialNumber}/details/overview`}>
          {data}
        </TenantLink>
      )
    }, {
      key: 'switchModel',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'switchModel',
      sorter: true
    }, {
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      sorter: true,
      render: (data, row) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      )
    }]
  }, [$t])

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'PIN Portal for Switch' }), link: getServiceRoutePath(
            { type: ServiceType.WEBAUTH_SWITCH, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink state={{ from: location }}
            to={getServiceDetailsLink({
              type: ServiceType.WEBAUTH_SWITCH,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId as string
            })}
            scopeKey={getScopeKeyByService(ServiceType.WEBAUTH_SWITCH, ServiceOperation.EDIT)}
            // eslint-disable-next-line max-len
            rbacOpsIds={getServiceAllowedOperation(ServiceType.WEBAUTH_SWITCH, ServiceOperation.EDIT)}
          >
            <Button key='configure'
              disabled={isDefaultWebAuth(params.serviceId as string)}
              type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <NetworkSegAuthSummary data={data} />
      <br /><br />

      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: switches?.length || 0 })}>
        <Table
          columns={columns}
          dataSource={switches as unknown as WebAuthSwitchType[]}
          type='form'
          rowKey='switchId' />
      </Card>
    </>
  )
}
