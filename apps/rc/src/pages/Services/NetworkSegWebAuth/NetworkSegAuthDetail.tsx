import React from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Card, PageHeader, Subtitle, Table } from '@acx-ui/components'
import { useGetWebAuthTemplateQuery }                from '@acx-ui/rc/services'
import {
  ServiceType,
  WebAuthTemplate,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                     from '@acx-ui/user'


export function NetworkSegAuthSummary ({ data }: { data?: WebAuthTemplate }) {
  const { $t } = useIntl()
  return <Row gutter={[24, 16]}>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Service Name' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.name} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Header' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuthCustomTop} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Title' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuthCustomTitle} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Password Label' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuthPasswordLabel} />
    </Col>
    {/* <Col span={6}> // TODO: Waiting for TAG feature support
      <Subtitle level={5}>{$t({ defaultMessage: 'Tags' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.tag} />
    </Col> */}
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Button' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuthCustomLoginButton} />
    </Col>
    <Col span={12}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Footer' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuthCustomBottom} />
    </Col>
  </Row>
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
      <Card>
        <NetworkSegAuthSummary data={data} />
      </Card>
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
