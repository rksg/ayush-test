import { useEffect, useState } from 'react'

import { Col, Row, Typography } from 'antd'
import { Modal as AntModal }    from 'antd'
import moment                   from 'moment'
import { useIntl }              from 'react-intl'

import { Loader, TableProps, Table, Button, showActionModal }                                                                                                                                              from '@acx-ui/components'
import { DetailDrawer, MAX_CERTIFICATE_PER_TENANT, SimpleListTooltip, deleteDescription }                                                                                                                  from '@acx-ui/rc/components'
import { showAppliedInstanceMessage, useDeleteCertificateAuthorityMutation, useGetCertificateAuthoritiesQuery, useGetCertificateTemplatesQuery }                                                           from '@acx-ui/rc/services'
import { CertificateAuthority, CertificateCategoryType, CertificateUrls, EXPIRATION_DATE_FORMAT, PolicyOperation, PolicyType, filterByAccessForServicePolicyMutation, getScopeKeyByPolicy, useTableQuery } from '@acx-ui/rc/utils'
import { getOpsApi }                                                                                                                                                                                       from '@acx-ui/utils'

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

  const { networkUsedCAs, identityUsedCAs } = useGetCertificateTemplatesQuery({
    payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 }
  }, {
    selectFromResult: ({ data }) => ({
      networkUsedCAs: data?.data.filter((template) => (template.networkIds ?? []).length > 0)
        .map((template) => (template.onboard?.certificateAuthorityId)) || [],
      identityUsedCAs: data?.data.filter((template) => (template.certificateCount ?? 0) > 0)
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
      sorter: true,
      key: 'commonName'
    },
    {
      title: $t({ defaultMessage: 'SHA Fingerprint' }),
      dataIndex: 'publicKeyShaThumbprint',
      searchable: true,
      sorter: true,
      key: 'publicKeyShaThumbprint'
    },
    {
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expireDate',
      key: 'expireDate',
      sorter: true,
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
    if (networkUsedCAs.includes(selectedRow.id)) {
      showAppliedInstanceMessage($t(deleteDescription.CA_IN_USE,
        { instance: $t({ defaultMessage: 'network' }) }))
    } else if (identityUsedCAs.includes(selectedRow.id)) {
      showAppliedInstanceMessage($t(deleteDescription.CA_IN_USE,
        { instance: $t({ defaultMessage: 'identity' }) }))
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
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
      rbacOpsIds: [getOpsApi(CertificateUrls.editCA)],
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([selectedRow]) => {
        showEditModal(selectedRow)
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.DELETE),
      rbacOpsIds: [getOpsApi(CertificateUrls.deleteCA)],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => {
        showDeleteModal(selectedRow, clearSelection)
      }
    }
  ]
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<CertificateAuthority>
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
