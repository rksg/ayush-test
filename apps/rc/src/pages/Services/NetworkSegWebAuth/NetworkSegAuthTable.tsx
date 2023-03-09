import React from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, showActionModal, Table, TableProps, Loader } from '@acx-ui/components'
import { useDeleteWebAuthTemplateMutation, useWebAuthTemplateListQuery }  from '@acx-ui/rc/services'
import {
  ServiceType,
  WebAuthTemplate,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                         from '@acx-ui/user'

const getNetworkSegAuthPayload = {
  fields: [
    'id',
    'name',
    'tags'
  ],
  sortField: 'name',
  sortOrder: 'ASC'
}

export default function NetworkSegAuthTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const tableQuery = useTableQuery({
    useQuery: useWebAuthTemplateListQuery,
    defaultPayload: getNetworkSegAuthPayload
  })

  const [
    deleteWebAuthTemplate
  ] = useDeleteWebAuthTemplateMutation()


  const columns: TableProps<WebAuthTemplate>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.WEBAUTH_SWITCH,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    }, {
      title: $t({ defaultMessage: 'Access Switches' }),
      key: 'as',
      dataIndex: 'as'
    }, {
      title: $t({ defaultMessage: 'Venues' }),
      key: 'venues',
      dataIndex: 'venues'
    }, {
      title: $t({ defaultMessage: 'Update Available' }),
      key: 'updateAvailable',
      dataIndex: 'updateAvailable'
    }, {
      title: $t({ defaultMessage: 'Service Version' }),
      key: 'version',
      dataIndex: 'version'
    // }, {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags'
    }
  ]

  const rowActions: TableProps<WebAuthTemplate>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${getServiceDetailsLink({
            type: ServiceType.WEBAUTH_SWITCH,
            oper: ServiceOperation.EDIT,
            serviceId: selectedRows[0].id!
          })}`
        })
      }
    }, {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Network Segmentation Auth Page for Switch' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          okText: $t({ defaultMessage: 'Delete' }),
          onOk: () => {
            deleteWebAuthTemplate({ params: { serviceId: rows[0].id } })
              .then(clearSelection)
          }
        })
      }
    }, {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Service Update' }),
          content: $t({ defaultMessage:
            'Are you sure you want to update these services to the latest version immediately?' }),
          okText: $t({ defaultMessage: 'Update' }),
          onOk: () => {
            // TODO
            clearSelection()
          }
        })
      }
    }
  ]

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Network Segmentation Auth Page for Switch ({count})' },
        { count: tableQuery.data?.totalCount })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
      ]}
      extra={filterByAccess([
        <TenantLink to={getServiceRoutePath({
          type: ServiceType.WEBAUTH_SWITCH, oper: ServiceOperation.CREATE
        })}>
          <Button type='primary'>{$t({ defaultMessage: 'Add Auth Page' })}</Button>
        </TenantLink>
      ])} />
    <Loader states={[tableQuery]}>
      <Table
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'radio' }} />
    </Loader>
  </>)
}
