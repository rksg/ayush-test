import React from 'react'

import { useIntl } from 'react-intl'

import { Button, Card, PageHeader, SummaryCard, Table, TableProps } from '@acx-ui/components'
import {
  useGetWebAuthTemplateQuery,
  useGetWebAuthTemplateSwitchesQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  WebAuthTemplate,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  isDefaultWebAuth
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                     from '@acx-ui/user'


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

export default function NetworkSegAuthDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const location = useLocation()

  const { data } = useGetWebAuthTemplateQuery({ params })
  const { data: switches } = useGetWebAuthTemplateSwitchesQuery({ params })

  const columns: TableProps<{}>['columns'] = React.useMemo(() => {
    return [{
      key: 'switchName',
      title: $t({ defaultMessage: 'Access Switches' }),
      dataIndex: 'switchName',
      sorter: true,
      width: 360,
      fixed: 'left'
    }, {
      key: 'switchModel',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'switchModel',
      sorter: true
    }, {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true
    }]
  }, [$t])

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Network Segmentation Auth Page for Switch' }),
            link: getServiceRoutePath({
              type: ServiceType.WEBAUTH_SWITCH,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          <Button disabled>
            {$t({ defaultMessage: 'Preview' })}
          </Button>,
          <TenantLink state={{ from: location }}
            to={getServiceDetailsLink({
              type: ServiceType.WEBAUTH_SWITCH,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId as string
            })}>
            <Button key='configure'
              disabled={isDefaultWebAuth(params.serviceId as string)}
              type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <NetworkSegAuthSummary data={data} />
      <br /><br />

      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: switches?.switchVenueInfos?.length || 0 })}>
        <Table
          columns={columns}
          dataSource={switches?.switchVenueInfos}
          type='form'
          rowKey='switchId' />
      </Card>
    </>
  )
}
