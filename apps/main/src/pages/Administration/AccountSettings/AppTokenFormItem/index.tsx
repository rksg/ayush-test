import { useEffect, useState } from 'react'

import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, Card, PasswordInput, showActionModal, Table, TableProps }                   from '@acx-ui/components'
import {  TenantAuthentications, TenantAuthenticationType, ApplicationAuthenticationStatus } from '@acx-ui/rc/utils'

import { AddApplicationDrawer } from './AddApplicationDrawer'

interface AppTokenFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

const AppTokenFormItem = (props: AppTokenFormItemProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [hasAppTokenConfigured, setAppToken] = useState(false)

  const onAddAppToken = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const appTokenData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.ldap)
  useEffect(() => {
    if (appTokenData && appTokenData.length > 0) {
      setAppToken(true)
    }
  }, [appTokenData])

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
                onClick={() => {onAddAppToken()}}>
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
        dataIndex: 'clientIDStatus',
        key: 'clientIDStatus'
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

    const actions: TableProps<TenantAuthentications>['actions'] = [
      {
        label: $t({ defaultMessage: 'Add Token' }),
        onClick: () => {onAddAppToken()
        }
      }
    ]

    const rowActions: TableProps<TenantAuthentications>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: () => {
          setEditMode(true)
          setDrawerVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Revoke' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].clientIDStatus === ApplicationAuthenticationStatus.ACTIVE )) {
            return true
          }
          return false
        },
        // onClick: ([{ name, id }], clearSelection) => {
        onClick: ([{ name }]) => {
          const title = $t(
            { defaultMessage: 'Revoke application "{formattedName}"?' },
            { formattedName: name }
          )
          showActionModal({
            type: 'confirm',
            title: title,
            content: $t({
              defaultMessage: `
              Revoke "{formattedName}" will suspend all its services,
                are you sure you want to proceed?
              `
            }, { formattedName: name }),
            okText: $t({ defaultMessage: 'Revoke' }),
            onOk: () => {
              // deactivateMspEc({ params: { mspEcTenantId: id } })
              // .then(clearSelection)
            }
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Activate' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].clientIDStatus === ApplicationAuthenticationStatus.REVOKE)) {
            return true
          }
          return false
        },
        // onClick: ([{ name, id }], clearSelection) => {
        onClick: ([{ name }]) => {
          const title = $t(
            { defaultMessage: 'Activate application "{formattedName}"?' },
            { formattedName: name }
          )

          showActionModal({
            type: 'confirm',
            title: title,
            content: $t(
              { defaultMessage: 'Activate this application "{formattedName}"?' },
              { formattedName: name }
            ),
            okText: $t({ defaultMessage: 'Activate' }),
            onOk: () => {
              // reactivateMspEc({ params: { mspEcTenantId: id } })
              // .then(clearSelection)
            }
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: (rows) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Application' }),
              entityValue: rows[0].name
            },
            onOk: () => {
              // deleteAdmin({ params: { ...params, adminId: rows[0].id } })
              //   .then(clearSelection) :
            }
          })

        }
      }
    ]

    return (
      <Table
        columns={columns}
        actions={actions}
        dataSource={appTokenData}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
      />
    )
  }

  return ( <>
    <Row gutter={24} style={{ marginBottom: '25px' }}>
      <Col span={10}>
        <Form.Item
          style={hasAppTokenConfigured ? { marginBottom: '-20px' } : { marginBottom: '10px' }}
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
      isEditMode={isEditMode}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { AppTokenFormItem }