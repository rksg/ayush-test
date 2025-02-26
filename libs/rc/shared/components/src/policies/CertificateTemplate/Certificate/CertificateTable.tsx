import { useEffect, useState } from 'react'

import { Modal as AntModal, Form }  from 'antd'
import moment                       from 'moment'
import { RawIntlProvider, useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import {
  useEditCertificateMutation,
  useGenerateCertificateToIdentityMutation, useGetCertificateAuthorityQuery,
  useSearchPersonaListQuery
} from '@acx-ui/rc/services'
import {
  TableQuery,
  Certificate,
  CertificateCategoryType,
  CertificateStatusType,
  CertificateTemplate,
  EXPIRATION_DATE_FORMAT,
  EXPIRATION_TIME_FORMAT,
  EnrollmentType,
  FILTER,
  PolicyOperation,
  PolicyType,
  SEARCH,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  IdentityDetailsLink
} from '@acx-ui/rc/utils'
import { RequestPayload }         from '@acx-ui/types'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { issuedByLabel } from '../contentsMap'

import CertificateSettings                                     from './CertificateForm/CertificateSettings'
import { DetailDrawer }                                        from './DetailDrawer'
import { getCertificateStatus, getDisplayedCertificateStatus } from './DetailDrawerHelper'
import { RevokeForm }                                          from './RevokeForm'


export function CertificateTable (
  { templateData, showGenerateCert = false, tableQuery, specificIdentity }: {
    templateData?: CertificateTemplate, showGenerateCert?: boolean,
    tableQuery: TableQuery<Certificate, RequestPayload, unknown>,
    specificIdentity?: string
}) {
  const { $t } = useIntl()
  const [certificateForm] = Form.useForm()
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [certificateDrawerOpen, setCertificateDrawerOpen] = useState(false)
  const [detailData, setDetailData] = useState<Certificate | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: identityList } = useSearchPersonaListQuery(
    { payload: { pageSize: 1000,
      ids: [...new Set(tableQuery.data?.data?.map(d => d.identityId))] } },
    { skip: !tableQuery.data })

  const { privateKeyBase64 } = useGetCertificateAuthorityQuery(
    { params: { caId: templateData?.onboard?.certificateAuthorityId } },
    {
      skip: !templateData?.onboard?.certificateAuthorityId,
      selectFromResult: ({ data }) => ({
        privateKeyBase64: data?.privateKeyBase64
      })
    })

  useEffect(() => {
    tableQuery.data?.data?.filter((item) =>
      item.id === detailId).map((item) => {
      const identity = identityList?.data.filter(d=>d.id===item.identityId)[0]
      setDetailData({ ...item,
        identityName: identity?.name,
        identityGroupId: identity?.groupId
      })})
  }, [tableQuery.data])

  const [editCertificate] = useEditCertificateMutation()
  const [generateCertificate] = useGenerateCertificateToIdentityMutation()

  const filterOptions = [
    { key: 'INVALID', label: $t({ defaultMessage: 'Invalid Certificates' }), value: 'INVALID' },
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
              const identity = identityList?.data?.filter(d=>d.id===row.identityId)[0]
              setDetailData({ ...row,
                identityName: identity?.name,
                identityGroupId: identity?.groupId
              })
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
      sorter: true,
      render: (_, row) => {
        return row.notAfterDate ?
          moment(row.notAfterDate).format(EXPIRATION_DATE_FORMAT)
          : noDataDisplay
      }
    },
    ...(!templateData ? [
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
      sorter: true,
      render: (_, row) => {
        return row.revocationDate
          ? moment(row.revocationDate).format(EXPIRATION_TIME_FORMAT)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Identity' }),
      dataIndex: 'identityId',
      key: 'identityId',
      render: function (_, row) {
        const item = identityList?.data?.filter(data => data.id===row.identityId)[0]
        return (item ? <IdentityDetailsLink
          name={item.name}
          personaId={item.id}
          personaGroupId={item.groupId}
          revoked={item.revoked}
        /> : noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Issued By' }),
      dataIndex: 'enrollmentType',
      key: 'enrollmentType',
      sorter: true,
      render: (_, row) => {
        return row.enrollmentType ?
          $t(issuedByLabel[EnrollmentType[row.enrollmentType]]) : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      show: false
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      sorter: true,
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
      dataIndex: 'createDate',
      key: 'createDate',
      sorter: true,
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
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
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
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
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
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

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
    ...(templateData && showGenerateCert && templateData.identityGroupId && !!privateKeyBase64 ? [{
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.CREATE),
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
          settingsId={'certificate-table'}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowActions={allowedRowActions}
          actions={filterByAccessForServicePolicyMutation(actionButtons)}
          rowSelection={
            allowedRowActions.length > 0 && { type: 'radio' }}
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
        onClose={() => {
          setCertificateDrawerOpen(false)
          certificateForm.resetFields()
        }}
        width={550}
        destroyOnClose={true}
        footer={
          <Drawer.FormFooter
            onCancel={() => {
              setCertificateDrawerOpen(false)
              certificateForm.resetFields()
            }}
            onSave={async () => {
              try {
                await certificateForm.validateFields()
                const { identityId, certificateTemplateId, csrType,
                  csrString, description, ...variables } = certificateForm.getFieldsValue()
                await generateCertificate({
                  // eslint-disable-next-line max-len
                  params: { templateId: templateData?.id, personaId: specificIdentity ?? identityId },
                  payload: { csrString, description, variableValues: { ...variables } }
                })
                setCertificateDrawerOpen(false)
                certificateForm.resetFields()
              } catch { }
            }}
          />
        }
      >
        <Form layout='vertical' form={certificateForm}>
          <CertificateSettings templateData={templateData} specificIdentity={specificIdentity} />
        </Form>
      </Drawer >
    </>
  )
}
