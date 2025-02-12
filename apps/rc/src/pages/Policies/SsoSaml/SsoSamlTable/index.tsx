/* eslint-disable max-len */

import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Table, TableProps, showActionModal } from '@acx-ui/components'
import {
  useDeleteIdentityProviderProfileMutation,
  useGetIdentityProviderProfileViewDataListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  IdentityProviderProfileViewData,
  PolicyOperation,
  PolicyType,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

interface SsoSamlTableProps {
  setTableTotalCount?: (totalCount: number) => void;
}

const SsoSamlTable = (props: SsoSamlTableProps) => {
  const { $t } = useIntl()
  //   const params = useParams()
  const { setTableTotalCount } = props
  const defaultSsoSamlTablePayload = {}
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()

  const tableQuery = useTableQuery({
    useQuery: useGetIdentityProviderProfileViewDataListQuery,
    defaultPayload: defaultSsoSamlTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'venue']
    }
  })

  //   const { radiusNameMap = [] } = useGetAAAPolicyViewModelListQuery({
  //     params: { tenantId: params.tenantId },
  //     payload: {
  //       fields: ['name', 'id'],
  //       sortField: 'name',
  //       sortOrder: 'ASC',
  //       page: 1,
  //       pageSize: 10000
  //     },
  //     enableRbac: enableServicePolicyRbac
  //   }, {
  //     selectFromResult: ({ data }: { data?: { data: AAAViewModalType[] } }) => ({
  //       radiusNameMap: data?.data?.map(radius => ({ key: radius.id!, value: radius.name }))
  //     })
  //   })

  //   const { venueNameMap =[] } = useGetVenuesQuery({
  //     params: { tenantId: params.tenantId },
  //     payload: {
  //       fields: ['name', 'id'],
  //       sortField: 'name',
  //       sortOrder: 'ASC',
  //       page: 1,
  //       pageSize: 2048
  //     }
  //   }, {
  //     selectFromResult: ({ data }) => ({
  //       venueNameMap: data?.data?.map(venue => ({ key: venue.id, value: venue.name }))
  //     })
  //   })

  const [deleteIdentityProviderProfile] = useDeleteIdentityProviderProfileMutation()

  useEffect(() => {
    if(tableQuery.data?.totalCount && setTableTotalCount){
      setTableTotalCount(tableQuery.data?.totalCount)
    }
  }, [tableQuery.data?.totalCount])

  const columns: TableProps<IdentityProviderProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.SSO_SAML,
            oper: PolicyOperation.DETAIL,
            policyId: row.id
          })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Idp Metadata' }),
      key: 'id',
      dataIndex: 'id',
      render: (_, row) => {
        return (
          <Button style={{ borderStyle: 'none' }}>
            {row.id}
          </Button>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Require SAML requests to be signed' }),
      key: 'authnRequestSignedEnabled',
      dataIndex: 'authnRequestSignedEnabled'
    },
    {
      title: $t({ defaultMessage: 'SAML Response Encryption' }),
      key: 'responseEncryptionEnabled',
      dataIndex: 'responseEncryptionEnabled'
    },
    {
      title: $t({ defaultMessage: 'Server sertificate' }),
      key: 'serverCertificateId',
      dataIndex: 'serverCertificateId'
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'wifiNetworkIds',
      dataIndex: 'wifiNetworkIds'
    }
  ]

  /*
  responseEncryptionEnabled: boolean
    serverCertificateId: string
    wifiNetworkIds: string
  */

  const rowActions: TableProps<IdentityProviderProfileViewData>['rowActions'] = [{
    scopeKey: getScopeKeyByPolicy(PolicyType.SSO_SAML, PolicyOperation.EDIT),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.SSO_SAML, PolicyOperation.EDIT),
    // Default Ethernet Port Profile cannot Edit
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.SSO_SAML,
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id
        })
      })
    }
  }, {
    scopeKey: getScopeKeyByPolicy(PolicyType.SSO_SAML, PolicyOperation.DELETE),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.SSO_SAML, PolicyOperation.DELETE),
    // Default Ethernet Port Profile cannot Delete
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Profile' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
          numOfEntities: rows.length
        },
        onOk: () => {
          Promise.all(rows.map(row => deleteIdentityProviderProfile({ params: { id: row.id } })))
            .then(clearSelection)
        }
      })
    }
  }]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey={(row: IdentityProviderProfileViewData) => `${row.id}-${row.name}`}
        columns={columns}
        rowActions={allowedRowActions}
        rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}

export default SsoSamlTable