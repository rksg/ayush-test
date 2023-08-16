import { useEffect, useState } from 'react'

import { Form, Col, Row, Input } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, Card, PasswordInput, showActionModal, Table, TableProps } from '@acx-ui/components'
import { CopyOutlined }                                                    from '@acx-ui/icons'
import {
  useDeleteTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation,
  administrationApi
} from '@acx-ui/rc/services'
import {
  TenantAuthentications,
  TenantAuthenticationType,
  ApplicationAuthenticationStatus,
  roleDisplayText
} from '@acx-ui/rc/utils'
import { store }     from '@acx-ui/store'
import { RolesEnum } from '@acx-ui/types'

import { AddApplicationDrawer } from './AddApplicationDrawer'

interface AppTokenFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

export const reloadAuthTable = (timeoutSec?: number) => {
  const milisec = timeoutSec ? timeoutSec*1000 : 1000
  setTimeout(() => {
    store.dispatch(
      administrationApi.util.invalidateTags([
        { type: 'Administration', id: 'AUTHENTICATION_LIST' }
      ]))
  }, milisec)
}

const AppTokenFormItem = (props: AppTokenFormItemProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [hasAppTokenConfigured, setAppToken] = useState(false)
  const [authenticationsData, setAuthenticationsData] = useState<TenantAuthentications>()

  const [deleteTenantAuthentications]
  = useDeleteTenantAuthenticationsMutation()

  const [updateTenantAuthentications]
  = useUpdateTenantAuthenticationsMutation()

  const onAddAppToken = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const appTokenData = tenantAuthenticationData?.filter(n =>
    n.authenticationType !== TenantAuthenticationType.saml)
  useEffect(() => {
    if (appTokenData && appTokenData.length > 0) {
      setAppToken(true)
    }
  }, [appTokenData])

  const AddAppLink = () => {
    return (
      <Col style={{ width: '800px' }}>
        <Card type='solid-bg'>
          <Form.Item
            children={
              <Button
                style={{ marginLeft: '290px', marginTop: '17px' }}
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
        align: 'center',
        key: 'clientID',
        width: 235,
        render: function (_, row) {
          return <div>
            <Input
              readOnly
              bordered={false}
              value={row.clientID}
              style={{ overflow: 'hidden', width: '190px' }}
            />
            <Button
              ghost
              data-testid={'copy'}
              icon={<CopyOutlined />}
              onClick={() =>
                navigator.clipboard.writeText(row.clientID ?? '')
              }
            />
          </div>
        }
      },
      {
        title: $t({ defaultMessage: 'Shared Secret' }),
        dataIndex: 'clientSecret',
        align: 'center',
        key: 'clientSecret',
        width: 235,
        render: function (_, row) {
          return <div onClick={(e)=> {e.stopPropagation()}}>
            <PasswordInput
              readOnly
              bordered={false}
              value={row.clientSecret}
            />
            <Button
              ghost
              data-testid={'copy'}
              icon={<CopyOutlined />}
              onClick={() =>
                navigator.clipboard.writeText(row.clientSecret ?? '')
              }
            />
          </div>
        }
      },
      {
        title: $t({ defaultMessage: 'Scope' }),
        dataIndex: 'scopes',
        key: 'scopes',
        render: function (_, row) {
          return roleDisplayText[row.scopes as RolesEnum]
            ? $t(roleDisplayText[row.scopes as RolesEnum]) : ''
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
        onClick: (rows) => {
          setAuthenticationsData(rows[0])
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
        onClick: (rows, clearSelection) => {
          const title = $t(
            { defaultMessage: 'Revoke application "{formattedName}"?' },
            { formattedName: rows[0].name }
          )
          showActionModal({
            type: 'confirm',
            title: title,
            content: $t({
              defaultMessage: `
              Revoke "{formattedName}" will suspend all its services,
                are you sure you want to proceed?
              `
            }, { formattedName: rows[0].name }),
            okText: $t({ defaultMessage: 'Revoke' }),
            onOk: () => {
              const payload: TenantAuthentications = {
                name: rows[0].name,
                authenticationType: rows[0].authenticationType,
                clientIDStatus: ApplicationAuthenticationStatus.REVOKED
              }
              updateTenantAuthentications({ params: { authenticationId: rows[0].id },
                payload: payload })
                .then(clearSelection)
              reloadAuthTable(2)
            }
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Activate' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].clientIDStatus !== ApplicationAuthenticationStatus.ACTIVE)) {
            return true
          }
          return false
        },
        onClick: (rows, clearSelection) => {
          const title = $t(
            { defaultMessage: 'Activate application "{formattedName}"?' },
            { formattedName: rows[0].name }
          )

          showActionModal({
            type: 'confirm',
            title: title,
            content: $t(
              { defaultMessage: 'Activate this application "{formattedName}"?' },
              { formattedName: rows[0].name }
            ),
            okText: $t({ defaultMessage: 'Activate' }),
            onOk: () => {
              const payload: TenantAuthentications = {
                name: rows[0].name,
                authenticationType: rows[0].authenticationType,
                clientIDStatus: ApplicationAuthenticationStatus.ACTIVE
              }
              updateTenantAuthentications({ params: { authenticationId: rows[0].id },
                payload: payload })
                .then(clearSelection)
              reloadAuthTable(2)
            }
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: (rows, clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Application' }),
              entityValue: rows[0].name
            },
            onOk: () => {
              deleteTenantAuthentications({ params: { authenticationId: rows[0].id } })
                .then(clearSelection)
              reloadAuthTable(2)
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
      <Col style={{ width: '1200px' }}>
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
      editData={authenticationsData as TenantAuthentications}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { AppTokenFormItem }