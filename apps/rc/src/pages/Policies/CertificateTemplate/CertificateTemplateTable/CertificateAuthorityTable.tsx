import { useEffect, useState } from 'react'

import { Col, Row, Typography } from 'antd'
import { Modal as AntModal }    from 'antd'
import moment                   from 'moment'
import { useIntl }              from 'react-intl'

import { Loader, TableProps, Table, Button, showActionModal }                                                                                    from '@acx-ui/components'
import { MAX_CERTIFICATE_PER_TENANT, SimpleListTooltip }                                                                                         from '@acx-ui/rc/components'
import { showAppliedInstanceMessage, useDeleteCertificateAuthorityMutation, useGetCertificateAuthoritiesQuery, useGetCertificateTemplatesQuery } from '@acx-ui/rc/services'
import { CertificateAuthority, CertificateCategoryType, EXPIRATION_DATE_FORMAT, useTableQuery }                                                  from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                                                                             from '@acx-ui/user'

import { deleteDescription } from '../contentsMap'

import DetailDrawer                 from './DetailDrawer'
import EditCertificateAuthorityForm from './EditCertificateAuthorityForm'



export default function CertificateAuthorityTable () {
  const { $t } = useIntl()
  const { Text } = Typography
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailData, setDetailData] = useState<CertificateAuthority | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteCertificateAuthority] = useDeleteCertificateAuthorityMutation()
  const [modal, contextHolder] = AntModal.useModal()
  const settingsId = 'certificate-authority-table'
  const tableQuery = useTableQuery({
    useQuery: useGetCertificateAuthoritiesQuery,
    defaultPayload: {
      filters: {}
    },
    search: {
      searchTargetFields: ['name', 'commonName', 'publicKeyShaThumbprint'],
      searchString: ''
    },
    apiParams: {},
    pagination: { settingsId }
  })

  const { inUsedCAs } = useGetCertificateTemplatesQuery({
    payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 }
  }, {
    selectFromResult: ({ data }) => ({
      inUsedCAs: data?.data.filter((template) => (template.networkIds ?? []).length > 0)
        .map((template) => (template.onboard?.certificateAuthorityId)) || []
    })
  })

  useEffect(() => {
    tableQuery.data?.data?.filter((item) => item.id === detailId).map((item) => setDetailData(item))
  }, [tableQuery.data?.data])

  const columns: TableProps<CertificateAuthority>['columns'] = [
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
      title: $t({ defaultMessage: 'Templates' }),
      dataIndex: 'templateCount',
      key: 'templateCount',
      render: (_, row) => {
        const displayText = row.templateCount || 0
        const items = row.templateNames || []
        return (
          row.templateCount === 0 ? 0 :
            <SimpleListTooltip
              title={$t({ defaultMessage: 'Certificate Templates' })}
              displayText={displayText}
              items={items}
              maximum={26}
            />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Common Name' }),
      dataIndex: 'commonName',
      searchable: true,
      key: 'commonName'
    },
    {
      title: $t({ defaultMessage: 'SHA Fingerprint' }),
      dataIndex: 'publicKeyShaThumbprint',
      searchable: true,
      key: 'publicKeyShaThumbprint'
    },
    {
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expireDate',
      key: 'expireDate',
      render: (_, { expireDate }) => {
        return moment(expireDate).format(EXPIRATION_DATE_FORMAT)
      }
    }
  ]

  const showEditModal = (selectedRow: CertificateAuthority) => {
    const modalRef = modal.confirm({})
    const content = <EditCertificateAuthorityForm data={selectedRow} modal={modalRef} />
    modalRef.update({
      title: $t({ defaultMessage: 'Edit Certificate Authority' }),
      okText: $t({ defaultMessage: 'Apply' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      maskClosable: false,
      keyboard: false,
      content,
      icon: <> </>
    })
  }

  const showDeleteModal = (selectedRow: CertificateAuthority, clearSelection: () => void) => {
    if (inUsedCAs.includes(selectedRow.id)) {
      showAppliedInstanceMessage($t(deleteDescription.CA_IN_USE))
    } else {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'CA' }),
          entityValue: selectedRow.name,
          numOfEntities: 1,
          confirmationText: $t({ defaultMessage: 'Delete' }),
          extraContent: <>
            <Row style={{ marginTop: 10 }}>
              <Col>
                <Text type='danger' strong> {$t({ defaultMessage: 'IMPORTANT' })}: </Text>
                <Text> {$t(deleteDescription.CA_DETAIL)} </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text type='danger' strong> {$t({ defaultMessage: 'IMPORTANT' })}: </Text>
                <Text> {$t(deleteDescription.UNDONE)} </Text>
              </Col>
            </Row>
          </>
        },
        onOk: () => {
          deleteCertificateAuthority({
            params: { caId: selectedRow.id }
          }).then(() => {
            clearSelection()
            setDetailDrawerOpen(false)
          })
        }
      })
    }
  }

  const rowActions: TableProps<CertificateAuthority>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([selectedRow]) => {
        showEditModal(selectedRow)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => {
        showDeleteModal(selectedRow, clearSelection)
      }
    }
  ]

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<CertificateAuthority>
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          rowKey='id'
          searchableWidth={430}
          enableApiFilter={true}
          onFilterChange={tableQuery.handleFilterChange}
        />
      </Loader>
      <DetailDrawer
        open={detailDrawerOpen}
        setOpen={setDetailDrawerOpen}
        data={detailData}
        type={CertificateCategoryType.CERTIFICATE_AUTHORITY}
      />
      {contextHolder}
    </>
  )
}
