import React from 'react'

import { useIntl } from 'react-intl'

import { Button, Card, PageHeader, Table } from '@acx-ui/components'
import { ServiceInfo }                     from '@acx-ui/rc/components'
import { useGetWebAuthTemplateQuery }      from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  WebAuthTemplate,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath
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

  return <ServiceInfo data={networkSegAuthInfo} colPerRow={4} />
}

export default function NetworkSegAuthDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const location = useLocation()

  const { data } = useGetWebAuthTemplateQuery({ params })

  const columns = React.useMemo(() => {
    return [{
      key: 'as',
      title: $t({ defaultMessage: 'Access Switches' }),
      dataIndex: 'as',
      sorter: true,
      fixed: 'left' as const
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    }, {
      key: 'venue',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venue',
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
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <NetworkSegAuthSummary data={data} />
      <br /><br />

      <Card title={$t({ defaultMessage: 'Instances ({count})' }, { count: 0 })}>
        <Table
          columns={columns}
          dataSource={[]} // TODO
          type='form'
          rowKey='id' />
      </Card>
    </>
  )
}
