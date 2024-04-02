import { useEffect, useState } from 'react'

import { Modal as AntModal, Form }  from 'antd'
import moment                       from 'moment'
import { RawIntlProvider, useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps }                                                                                                  from '@acx-ui/components'
import { useEditCertificateMutation, useGenerateCertificateMutation, useGetCertificatesQuery, useGetSpecificTemplateCertificatesQuery }               from '@acx-ui/rc/services'
import { Certificate, CertificateCategoryType, CertificateStatusType, EXPIRATION_DATE_FORMAT, EXPIRATION_TIME_FORMAT, FILTER, SEARCH, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                                                                                  from '@acx-ui/user'
import { getIntl, noDataDisplay }                                                                                                                     from '@acx-ui/utils'

import CertificateSettings from '../CertificateForm/CertificateSettings'

import DetailDrawer                                            from './DetailDrawer'
import { getCertificateStatus, getDisplayedCertificateStatus } from './DetailDrawerHelper'
import RevokeForm                                              from './RevokeForm'


export default function CertificateTable ({ templateId, showGenerateCert = false }:
  { templateId?: string, showGenerateCert?: boolean }) {
  const { $t } = useIntl()
  const [certificateForm] = Form.useForm()
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [certificateDrawerOpen, setCertificateDrawerOpen] = useState(false)
  const [detailData, setDetailData] = useState<Certificate | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const settingsId = 'certificate-table'
  const tableQuery = useTableQuery({
    useQuery:
      templateId ? useGetSpecificTemplateCertificatesQuery : useGetCertificatesQuery,
    defaultPayload: {},
    apiParams: templateId ? { templateId } : {},
    pagination: { settingsId }
  })

  useEffect(() => {
    tableQuery.data?.data?.filter((item) => item.id === detailId).map((item) => setDetailData(item))
  }, [tableQuery])

  const [editCertificate] = useEditCertificateMutation()
  const [generateCertificate] = useGenerateCertificateMutation()

  const filterOptions = [
    { key: 'VALID', label: $t({ defaultMessage: 'Valid Certificates' }), value: 'VALID' },
    { key: 'REVOKED', label: $t({ defaultMessage: 'Revoked Certificates' }), value: 'REVOKED' },
    { key: 'EXPIRED', label: $t({ defaultMessage: 'Expired Certificates' }), value: 'EXPIRED' }
  ]

  const columns: TableProps<Certificate>['columns'] = [
    {
      title: $t({ defaultMessage: 'Common name' }),
      dataIndex: 'commonName',
      key: 'CommonName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row) => {
        return (
          <Button type='link'
            onClick={() => {
              setDetailId(row.id)
              setDetailData(row)
              setDetailDrawerOpen(true)
            }}>{row.commonName}
          </Button>)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      filterable: filterOptions,
      filterMultiple: false,
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => {
        return getDisplayedCertificateStatus(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      dataIndex: 'notAfterDate',
      key: 'notAfterDate',
      render: (_, row) => {
        return row.notAfterDate ?
          moment(row.notAfterDate).format(EXPIRATION_DATE_FORMAT)
          : noDataDisplay
      }
    },
    ...(!templateId ? [
      {
        title: $t({ defaultMessage: 'CA Name' }),
        dataIndex: 'certificateAuthoritiesName',
        key: 'certificateAuthoritiesName'
      },
      {
        title: $t({ defaultMessage: 'Template' }),
        dataIndex: 'certificateTemplateName',
        key: 'certificateTemplateName'
      }
    ] : []),
    {
      title: $t({ defaultMessage: 'Revocation Date' }),
      dataIndex: 'revocationDate',
      key: 'revocationDate',
      render: (_, row) => {
        return row.revocationDate
          ? moment(row.revocationDate).format(EXPIRATION_TIME_FORMAT)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Issued By' }),
      dataIndex: 'issuedBy',
      key: 'issuedBy'
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      key: 'email',
      show: false
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      show: false
    },
    {
      title: $t({ defaultMessage: 'Thumbprint' }),
      dataIndex: 'shaThumbprint',
      key: 'shaThumbprint',
      show: false
    },
    {
      title: $t({ defaultMessage: 'Timestamp' }),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (_, row) => {
        return moment(row.createDate).format(EXPIRATION_TIME_FORMAT)
      }
    }
  ]

  const showRevokeModal = (entityValue: string,
    onFinish: (revocationReason: string) => Promise<void>) => {
    const modal = AntModal.confirm({})
    const { $t } = getIntl()

    const getRevokeTitle = () => {
      return $t({ defaultMessage: 'Revoke "{entityValue}"?' }, { entityValue: entityValue })
    }

    const content = <RevokeForm modal={modal} onFinish={onFinish} />

    modal.update({
      title: getRevokeTitle(),
      okText: $t({ defaultMessage: 'OK' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      maskClosable: false,
      keyboard: false,
      content: <RawIntlProvider value={getIntl()} children={content} />,
      icon: <> </>
    })
  }

  const rowActions: TableProps<Certificate>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Revoke' }),
      disabled: ([selectedRow]) =>
        getCertificateStatus(selectedRow) !== CertificateStatusType.VALID,
      onClick: ([selectedRow], clearSelection) => {
        showRevokeModal(selectedRow.commonName, async (revocationReason) => {
          editCertificate({
            params: {
              templateId: selectedRow.certificateTemplateId,
              certificateId: selectedRow.id
            },
            payload: { revocationReason }
          }).then(clearSelection)
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Unrevoke' }),
      disabled: ([selectedRow]) =>
        getCertificateStatus(selectedRow) !== CertificateStatusType.REVOKED,
      onClick: ([selectedRow], clearSelection) => {
        editCertificate({
          params: { templateId: selectedRow.certificateTemplateId, certificateId: selectedRow.id },
          payload: { revocationReason: null }
        }).then(clearSelection)
      }
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      ...(Array.isArray(customFilters?.status) ?
        { filters: { status: customFilters.status[0] } } : { filters: {} }),
      ...customSearch,
      searchTargetFields: ['commonName']
    }

    tableQuery.setPayload(payload)
  }

  const actionButtons = [
    ...(templateId && showGenerateCert ? [{
      label: $t({ defaultMessage: 'Generate Certificate' }),
      onClick: () => {
        setCertificateDrawerOpen(true)
      }
    }] : [])
  ]

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<Certificate>
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowActions={filterByAccess(rowActions)}
          actions={filterByAccess(actionButtons)}
          rowSelection={hasAccess() && { type: 'radio' }}
          rowKey='id'
          onFilterChange={handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
      <DetailDrawer
        open={detailDrawerOpen}
        setOpen={setDetailDrawerOpen}
        data={detailData}
        type={CertificateCategoryType.CERTIFICATE}
      />
      <Drawer
        title={$t({ defaultMessage: 'Generate Certificate' })}
        visible={certificateDrawerOpen}
        onClose={() => setCertificateDrawerOpen(false)}
        width={550}
        destroyOnClose={true}
        footer={
          <Drawer.FormFooter
            onCancel={() => setCertificateDrawerOpen(false)}
            onSave={async () => {
              try {
                const { certificateTemplateId, csrType, ...rest } = certificateForm.getFieldsValue()
                await generateCertificate({
                  params: { templateId: templateId },
                  payload: { ...rest }
                })
                setCertificateDrawerOpen(false)
                certificateForm.resetFields()
              } catch { }
            }}
          />
        }
      >
        <Form layout='vertical' form={certificateForm}>
          <CertificateSettings specificTemplate={true} />
        </Form>
      </Drawer >
    </>
  )
}
