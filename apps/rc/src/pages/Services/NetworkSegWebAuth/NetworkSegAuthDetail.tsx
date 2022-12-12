import React from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Card, PageHeader, Subtitle, Table } from '@acx-ui/components'
import { useWebAuthTemplateListQuery }               from '@acx-ui/rc/services'
import {
  AccessSwitch,
  ServiceType,
  WebAuthTemplate,
  getServiceDetailsLink,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'


const mockData = {
  id: 'zxzz',
  name: 'Mock Template name',
  webAuth_password_label: 'DPSK Password',
  webAuth_custom_title: 'Enter your Password below and press the button',
  webAuth_custom_top: 'Welcome to Ruckus Networks Web Authentication Homepage',
  webAuth_custom_login_button: 'Login',
  webAuth_custom_bottom: `This network is restricted to authorized users only.
    Violators may be subjected to legal prosecution.
    Acitvity on this network is monitored and may be used as evidence in a court of law.
    Copyright 2022 Ruckus Networks`,
  switches: [] as AccessSwitch[],
  tag: 'abc, 123'
}

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
      id: [params.webAuthId]
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
  const data = tableResult?.data[0] || mockData

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
              serviceId: params.webAuthId as string
            })}
            key='edit'
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Card title={$t({ defaultMessage: 'Attributes' })}>
        <NetworkSegAuthSummary data={data} />
        {/*        <Form layout='vertical' wrapperCol={{ span: 14 }} labelCol={{ span: 14 }}>
          <GridRow>
            <GridCol col={{ span: 6 }}>
              <Form.Item label={$t({ defaultMessage: 'Header' })} >
                <Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_top} />
              </Form.Item>
            </GridCol>
            <GridCol col={{ span: 6 }}>
              <Form.Item
                label={$t({ defaultMessage: 'Title' })}
                children={<Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_title} />} />
            </GridCol>
            <GridCol col={{ span: 6 }}>
              <Form.Item
                label={$t({ defaultMessage: 'Password Label' })}
                children={<Typography.Paragraph ellipsis={true} children={data?.webAuth_password_label} />} />
            </GridCol>
            <GridCol col={{ span: 6 }}>
              <Form.Item
                label={$t({ defaultMessage: 'Tags' })}
                children={<Typography.Paragraph ellipsis={true} children={data?.tag} />} />
            </GridCol>
            <GridCol col={{ span: 6 }}>
              <Form.Item
                label={$t({ defaultMessage: 'Button' })}
                children={<Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_login_button} />} />
            </GridCol>
            <GridCol col={{ span: 18 }}>
              <Form.Item
                label={$t({ defaultMessage: 'Footer' })}
                children={<Typography.Paragraph ellipsis={true} children={data?.webAuth_custom_bottom} />} />
            </GridCol>
          </GridRow>
        </Form>*/}
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
