import { useEffect, useState } from 'react'

import { Modal as AntModal, Badge } from 'antd'
import { RawIntlProvider, useIntl } from 'react-intl'

import { Loader, TableProps, Table, Button }                                                                                                                                                                                  from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                                                                                                                          from '@acx-ui/formatter'
import { certificateStatusTypeLabel, getCertificateStatus, issuedByLabel, RevokeForm, ServerCertificateDetailDrawer }                                                                                                         from '@acx-ui/rc/components'
import { useGetServerCertificatesQuery, useUpdateServerCertificateMutation }                                                                                                                                                  from '@acx-ui/rc/services'
import { CertificateCategoryType, CertificateStatusType, EnrollmentType, PolicyOperation, PolicyType, ServerCertificate, filterByAccessForServicePolicyMutation, getScopeKeyByPolicy, serverCertStatusColors, useTableQuery } from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay }                                                                                                                                                                                             from '@acx-ui/utils'


export default function ServerCertificatesTable () {
  const { $t } = useIntl()
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailData, setDetailData] = useState<ServerCertificate | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const settingsId = 'server-certificates-table'
  const tableQuery = useTableQuery({
    useQuery: useGetServerCertificatesQuery,
    defaultPayload: {
      filters: {}
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    },
    apiParams: {},
    pagination: { settingsId }
  })

  const [editCertificate] = useUpdateServerCertificateMutation()


  useEffect(() => {
    tableQuery.data?.data?.filter((item) => item.id === detailId).map((item) => setDetailData(item))
  }, [tableQuery.data?.data])

  const columns: TableProps<ServerCertificate>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <Button type='link'
            onClick={() => {
              setDetailId(row.id)
              setDetailData(row)
              setDetailDrawerOpen(true)
            }}>
            {row.name}
          </Button>)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => {
        return row.status[0] ?
          <span> <Badge color={`var(${serverCertStatusColors[row.status[0]]})`}
            text={$t(certificateStatusTypeLabel[row.status[0]])}></Badge></span>
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      searchable: true,
      sorter: true,
      key: 'description',
      render: (_, row) => {
        return row.description ? row.description : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Issued By' }),
      dataIndex: 'enrollmentType',
      key: 'enrollmentType',
      sorter: false,
      render: (_, row) => {
        return row.enrollmentType ?
          $t(issuedByLabel[EnrollmentType[row.enrollmentType]]) : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Valid to' }),
      dataIndex: 'notAfterDate',
      key: 'notAfterDate',
      sorter: true,
      render: (_, { notAfterDate }) => {
        return formatter(DateFormatEnum.DateFormat)(notAfterDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Extended Key Usage' }),
      dataIndex: 'extendedKeyUsages',
      sorter: false,
      key: 'extendedKeyUsages',
      render: (_, row) => {
        return row.extendedKeyUsages ? row.extendedKeyUsages : noDataDisplay
      }
    }
  ]

  const showRevokeModal = (entityValue: string,
    onFinish: (revocationReason: string) => Promise<void>) => {
    const modal = AntModal.confirm({})

    const content = <RevokeForm modal={modal} onFinish={onFinish} />

    modal.update({
      title: $t({ defaultMessage: 'Revoke "{entityValue}"?' }, { entityValue: entityValue }),
      okText: $t({ defaultMessage: 'OK' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      maskClosable: false,
      keyboard: false,
      content: <RawIntlProvider value={getIntl()} children={content} />,
      icon: <> </>
    })
  }


  const rowActions: TableProps<ServerCertificate>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Revoke' }),
      disabled: ([selectedRow]) =>
        getCertificateStatus(selectedRow) !== CertificateStatusType.VALID,
      onClick: ([selectedRow], clearSelection) => {
        showRevokeModal(selectedRow.commonName, async (revocationReason) => {
          editCertificate({
            params: {
              certId: selectedRow.id
            },
            payload: { revocationReason }
          }).then(clearSelection)
        })
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Unrevoke' }),
      disabled: ([selectedRow]) =>
        getCertificateStatus(selectedRow) !== CertificateStatusType.REVOKED,
      onClick: ([selectedRow], clearSelection) => {
        editCertificate({
          params: {
            certId: selectedRow.id
          },
          payload: { revocationReason: null }
        }).then(clearSelection)
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<ServerCertificate>
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
          rowKey='id'
          searchableWidth={430}
          enableApiFilter={true}
          onFilterChange={tableQuery.handleFilterChange}
        />
      </Loader>
      <ServerCertificateDetailDrawer
        open={detailDrawerOpen}
        setOpen={setDetailDrawerOpen}
        data={detailData}
        type={CertificateCategoryType.SERVER_CERTIFICATES}
      />
    </>
  )
}
