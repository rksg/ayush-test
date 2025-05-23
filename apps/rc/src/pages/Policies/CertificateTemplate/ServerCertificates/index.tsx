import { useEffect, useState } from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader, TableProps, Table }                                                                         from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                         from '@acx-ui/formatter'
import { certificateStatusTypeLabel, ExtendedKeyUsagesLabels, issuedByLabel, ServerCertificateDetailDrawer } from '@acx-ui/rc/components'
import { doProfileDelete, useDeleteServerCertificateMutation, useGetServerCertificatesQuery }                from '@acx-ui/rc/services'
import {
  CertificateStatusType,
  EnrollmentType,
  ExtendedKeyUsages,
  FILTER,
  PolicyOperation,
  PolicyType,
  SEARCH,
  ServerCertificate,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  serverCertStatusColors,
  useTableQuery,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'


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
  const [deleteServerCert] = useDeleteServerCertificateMutation()

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
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      filterable: Object.entries(CertificateStatusType)
        .map(([key, value])=>({ key, value: $t(certificateStatusTypeLabel[value]) })),
      dataIndex: 'status',
      filterMultiple: false,
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
      filterable: Object.entries(ExtendedKeyUsages)
        .map(([key, value])=>({ key, value: $t(ExtendedKeyUsagesLabels[value]) })),
      key: 'extendedKeyUsages',
      render: (_, row) => {
        return row.extendedKeyUsages?.length ?
          row.extendedKeyUsages
            .map((extendeKey) => ExtendedKeyUsagesLabels[extendeKey]
            && $t(ExtendedKeyUsagesLabels[extendeKey])).join(', ')
          : noDataDisplay
      }
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    let _customFilters = {}
    _customFilters = {
      ...customFilters,
      ...(customFilters?.status ? { status: customFilters.status[0] } : {})
    }
    tableQuery.handleFilterChange(_customFilters, customSearch)
  }

  const rowActions: TableProps<ServerCertificate>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.SERVER_CERTIFICATES, PolicyOperation.DETAIL),
      scopeKey: getScopeKeyByPolicy(PolicyType.SERVER_CERTIFICATES, PolicyOperation.DETAIL),
      label: $t({ defaultMessage: 'Download' }),
      onClick: ([selectedRow]) => {
        setDetailId(selectedRow.id)
        setDetailData(selectedRow)
        setDetailDrawerOpen(true)
      }
    },
    {
      // eslint-disable-next-line max-len
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.SERVER_CERTIFICATES, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.SERVER_CERTIFICATES, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => {
        doProfileDelete(
          [selectedRow],
          $t({ defaultMessage: 'certificate' }),
          selectedRow.name,
          [],
          async () => deleteServerCert({
            params: { certId: selectedRow.id }
          }).then(clearSelection)
        )
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
          rowSelection={allowedRowActions.length > 0 && { type: 'radio', onSelect: () => {
            setDetailId(null)
            setDetailData(null)
            setDetailDrawerOpen(false)
          } }}
          rowKey='id'
          searchableWidth={430}
          enableApiFilter={true}
          onFilterChange={handleFilterChange}
        />
      </Loader>
      <ServerCertificateDetailDrawer
        open={detailDrawerOpen}
        setOpen={setDetailDrawerOpen}
        data={detailData}
      />
    </>
  )
}
