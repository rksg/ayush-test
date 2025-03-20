import { useState } from 'react'

import { Buffer } from 'buffer'

import TextArea    from 'antd/lib/input/TextArea'
import { useIntl } from 'react-intl'

import { Button, Loader, Modal, Table, TableProps, showActionModal } from '@acx-ui/components'
import { useIsSplitOn, Features }                                    from '@acx-ui/feature-toggle'
import {  CodeDocument }                                             from '@acx-ui/icons'
import { CertificateToolTip, SimpleListTooltip }                     from '@acx-ui/rc/components'
import {
  useDeleteSamlIdpProfileMutation,
  useDownloadSamlServiceProviderMetadataMutation,
  useGetSamlIdpProfileViewDataListQuery,
  useGetServerCertificatesQuery,
  useLazyGetSamlIdpProfileByIdQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  SamlIdpProfileViewData,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  Network,
  KeyValue,
  ServerCertificate,
  CertificateStatusType,
  getPolicyRoutePath,
  transformDisplayOnOff
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const SamlIdpTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const defaultSamlIdpTablePayload = {}
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const emptyResult: KeyValue<string, string>[] = []
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const [idpMetadataModalVisible, setIdpMetadataModalVisible] = useState(false)
  const [idpMetadata, setIdpMetadata] = useState('')

  const [deleteSamlIdpProfile] = useDeleteSamlIdpProfileMutation()
  const [lazyGetSamlIdpProfile] = useLazyGetSamlIdpProfileByIdQuery()
  const [downloadSamlServiceProviderMetadata] = useDownloadSamlServiceProviderMetadataMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetSamlIdpProfileViewDataListQuery,
    defaultPayload: defaultSamlIdpTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'venue']
    }
  })

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery
  // eslint-disable-next-line max-len
  const { networkNameMap }: { networkNameMap: KeyValue<string, string>[] } = getNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }: { data?: { data: Network[] } }) => ({
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : emptyResult
    })
  })

  // eslint-disable-next-line max-len
  const { certificateNameMap } = useGetServerCertificatesQuery({
    payload: {
      fields: ['name', 'id', 'status'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }: { data?: { data: ServerCertificate[] } }) => ({
      certificateNameMap: data?.data
        ? data.data.map(cert => ({ key: cert.id, value: cert.name, status: cert.status }))
        : []
    })
  })

  const handleDisplayMetadata = async (id:string) => {
    const data = await lazyGetSamlIdpProfile({
      params: { id: id }
    }).unwrap()
    setIdpMetadata(Buffer.from(data?.metadata, 'base64').toString('ascii'))
    setIdpMetadataModalVisible(true)
  }

  const columns: TableProps<SamlIdpProfileViewData>['columns'] = [
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
            type: PolicyType.SAML_IDP,
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
      key: 'metadata',
      dataIndex: 'metadata',
      render: (_, row) => {
        return (
          <Button
            data-testid={'display-metadata-button-' + row.id}
            style={{ borderStyle: 'none' }}
            type='link'
            onClick={()=>{handleDisplayMetadata(row.id)}}
          >
            <CodeDocument />
          </Button>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Require SAML requests to be signed' }),
      key: 'signingCertificateEnabled',
      dataIndex: 'signingCertificateEnabled',
      render: (_, row) => transformDisplayOnOff(row.signingCertificateEnabled)
    },
    {
      title: $t({ defaultMessage: 'SAML Response Encryption' }),
      key: 'encryptionCertificateEnabled',
      dataIndex: 'encryptionCertificateEnabled',
      render: (_, row) => transformDisplayOnOff(row.encryptionCertificateEnabled)
    },
    {
      title: $t({ defaultMessage: 'Server sertificate' }),
      key: 'encryptionCertificateId',
      dataIndex: 'encryptionCertificateId',
      filterKey: 'encryptionCertificateId',
      filterable: certificateNameMap,
      sorter: false,
      render: (_, row) => {
        const serverCert = certificateNameMap.find(
          cert => cert.key === row.encryptionCertificateId)
        return (!row.encryptionCertificateId)
          ? ''
          : (<>
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.SERVER_CERTIFICATES,
                oper: PolicyOperation.LIST
              })}>
              {serverCert?.value || ''}
            </TenantLink>
            {serverCert?.status && !serverCert?.status.includes(CertificateStatusType.VALID) ?
              <CertificateToolTip
                placement='bottom'
                policyType={PolicyType.SERVER_CERTIFICATES}
                status={serverCert.status} /> : []}
          </>
          )
      }
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterKey: 'wifiNetworkIds',
      filterable: networkNameMap,
      sorter: false,
      render: (_, { wifiNetworkIds }) => {
        if (!wifiNetworkIds || wifiNetworkIds.length === 0) return 0

        return <SimpleListTooltip
          items={networkNameMap.filter(kv => wifiNetworkIds.includes(kv.key)).map(kv => kv.value)}
          displayText={wifiNetworkIds.length} />
      }
    }
  ]

  const rowActions: TableProps<SamlIdpProfileViewData>['rowActions'] = [{
    scopeKey: getScopeKeyByPolicy(PolicyType.SAML_IDP, PolicyOperation.EDIT),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.SAML_IDP, PolicyOperation.EDIT),
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.SAML_IDP,
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id
        })
      })
    }
  }, {
    // scopeKey: getScopeKeyByPolicy(PolicyType.SAML_IDP, PolicyOperation.EDIT),
    // rbacOpsIds: getPolicyAllowedOperation(PolicyType.SAML_IDP, PolicyOperation.EDIT),
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Download SAML Metadata' }),
    onClick: (selectedRows) => {
      downloadSamlServiceProviderMetadata({ params: { id: selectedRows[0].id } })
    }
  }, {
    scopeKey: getScopeKeyByPolicy(PolicyType.SAML_IDP, PolicyOperation.DELETE),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.SAML_IDP, PolicyOperation.DELETE),
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
          Promise.all(rows.map(row => deleteSamlIdpProfile({ params: { id: row.id } })))
            .then(clearSelection)
        }
      })
    }
  }]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey={(row: SamlIdpProfileViewData) => `${row.id}-${row.name}`}
        columns={columns}
        rowActions={allowedRowActions}
        rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
      <Modal
        title={$t({ defaultMessage: 'IdP Metadata' })}
        visible={idpMetadataModalVisible}
        // onCancel={handleCancel}
        width={800}
        footer={
          <Button
            type='primary'
            onClick={() => {
              setIdpMetadataModalVisible(false)
            }}
          >
            {$t({ defaultMessage: 'OK' })}
          </Button>
        }
      >
        <TextArea
          style={{ width: '100%', height: 500 }}
          value={idpMetadata}
        ></TextArea>
      </Modal>
    </Loader>
  )
}

export default SamlIdpTable
