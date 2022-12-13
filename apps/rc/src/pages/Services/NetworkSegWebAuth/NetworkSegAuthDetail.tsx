import React from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Card, PageHeader, Subtitle, Table } from '@acx-ui/components'
import { useWebAuthTemplateListQuery }               from '@acx-ui/rc/services'
import {
  ServiceType,
  WebAuthTemplate,
  getServiceDetailsLink,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'


export function NetworkSegAuthSummary ({ data }: { data: WebAuthTemplate }) {
  const { $t } = useIntl()
  return <Row gutter={[24, 16]}>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Name' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.name} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Header' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_top} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Title' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_title} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Password Label' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuth_password_label} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Tags' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.tag} />
    </Col>
    <Col span={6}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Button' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_login_button} />
    </Col>
    <Col span={12}>
      <Subtitle level={5}>{$t({ defaultMessage: 'Footer' })}</Subtitle>
      <Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_bottom} />
    </Col>
  </Row>
}

export default function NetworkSegAuthDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const payload = {
    searchString: '',
    filters: {
      id: [params.serviceId]
    },
    fields: [
      'name', 'id',
      'webAuth_password_label',
      'webAuth_custom_title',
      'webAuth_custom_top',
      'webAuth_custom_login_button',
      'webAuth_custom_bottom',
      'switches', 'tag'
    ]
  }

  const { data: tableResult } = useWebAuthTemplateListQuery({ params, payload })
  const data = tableResult?.data[0] as WebAuthTemplate

  const columns = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      sorter: true
    }, {
      key: 'as',
      title: $t({ defaultMessage: 'Access Switches' }),
      dataIndex: 'as',
      sorter: true
    }]
  }, [$t])

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <Button key='preview' disabled>
            {$t({ defaultMessage: 'Preview' })}
          </Button>,
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.WEBAUTH_SWITCH,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId as string
            })}
            key='edit'
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Card title={$t({ defaultMessage: 'Attributes' })}>
        <NetworkSegAuthSummary data={data} />
      </Card>
      <br /><br />

      <Card title={$t({ defaultMessage: 'Instances ({count})' }, { count: 0 })}>
        <Table
          columns={columns}
          dataSource={data?.switches}
          type='form'
          rowKey='id' />
      </Card>
    </>
  )
}
