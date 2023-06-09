import { useState } from 'react'

import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, Card, PasswordInput, Table, TableProps }   from '@acx-ui/components'
import {  TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'

import { AddApplicationDrawer } from './AddApplicationDrawer'

interface AppTokenFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

const AppTokenFormItem = (props: AppTokenFormItemProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)

  const onAddAppToekn = () => {
    setDrawerVisible(true)
  }

  const appTokenData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.ldap)
  const hasAppTokenConfigured = appTokenData && appTokenData.length > 0

  const AddAppLink = () => {
    return (
      <Col span={24}>
        <Card type='solid-bg'>
          <Form.Item
            children={
              <Button
                style={{ marginLeft: '300px', marginTop: '17px' }}
                type='link'
                key='viewxml'
                onClick={() => {onAddAppToekn() }}>
                {$t({ defaultMessage: 'Add Application Token' })}
              </Button>
            }
          />
        </Card>
      </Col>
    )
  }

  const AppTokenTable = () => {
    const columns: TableProps<TenantAuthentications>['columns'] = [
      {
        title: $t({ defaultMessage: 'Token Name' }),
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'updatedDate',
        key: 'updatedDate'
      },
      {
        title: $t({ defaultMessage: 'Client ID' }),
        dataIndex: 'clientID',
        key: 'clientID'
      },
      {
        title: $t({ defaultMessage: 'Share Secret' }),
        dataIndex: 'clientSecret',
        key: 'clientSecret',
        render: function (data, row) {
          return <div onClick={(e)=> {e.stopPropagation()}}>
            <PasswordInput
              readOnly
              bordered={false}
              value={row.clientSecret}
            />
          </div>
        }
      }
    ]

    const rowActions: TableProps<TenantAuthentications>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: () => {
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: () => {
        }
      }
    ]

    return (
      <Table
        settingsId='msp-subscription-table'
        columns={columns}
        dataSource={appTokenData}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
      />
    )
  }

  return ( <>
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          colon={false}
          label={<>
            {$t({ defaultMessage: 'Application Tokens' })}
          </>}
        />
        {hasAppTokenConfigured ? <AppTokenTable /> : <AddAppLink />}
      </Col>
    </Row>

    {drawerVisible && <AddApplicationDrawer
      visible={drawerVisible}
      isEditMode={false}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { AppTokenFormItem }