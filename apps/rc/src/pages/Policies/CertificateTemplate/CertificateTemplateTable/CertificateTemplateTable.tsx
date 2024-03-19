import { ReactNode, useEffect, useState } from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Loader, Table, TableProps, showActionModal }                                                                                         from '@acx-ui/components'
import { MAX_CERTIFICATE_PER_TENANT, SimpleListTooltip }                                                                                              from '@acx-ui/rc/components'
import { useDeleteCertificateTemplateMutation, useGetCertificateAuthoritiesQuery, useGetCertificateTemplatesQuery, useLazyGetAdaptivePolicySetQuery } from '@acx-ui/rc/services'
import { CertificateTemplate, PolicyOperation, PolicyType, getPolicyDetailsLink, useTableQuery }                                                      from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink }                                                                                               from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                                                                                                  from '@acx-ui/user'
import { noDataDisplay }                                                                                                                              from '@acx-ui/utils'

import { caTypeShortLabel, deleteDescription } from '../contentsMap'


export default function CertificateTemplateTable () {
  const { $t } = useIntl()
  const { Text } = Typography
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [
    caFilterOptions,
    setCaFilterOptions
  ] = useState<{ key: string; value: string; label?: ReactNode; }[]>([])
  const [policySetData, setPolicySetData] = useState(new Map())
  const [queryPolicySet] = useLazyGetAdaptivePolicySetQuery()
  const [deleteCertificateTemplate] = useDeleteCertificateTemplateMutation()
  const tableQuery = useTableQuery({
    useQuery: useGetCertificateTemplatesQuery,
    defaultPayload: {},
    search: {
      searchTargetFields: ['name', 'commonNamePattern'],
      searchString: ''
    }
  })
  const caTableQuery = useTableQuery({
    useQuery: useGetCertificateAuthoritiesQuery,
    defaultPayload: {},
    pagination: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 }
  })

  useEffect(() => {
    const policySetMap = new Map()
    tableQuery.data?.data?.forEach((item) => {
      if (item.policySetId) {
        queryPolicySet({ params: { policySetId: item.policySetId } }).then((res) => {
          policySetMap.set(item.policySetId, res.data?.name)
        })
      }
    })
    setPolicySetData(policySetMap)
  }, [tableQuery.data])

  useEffect(() => {
    if (caTableQuery.data) {
      const options = caTableQuery.data.data.map((ca) => ({ key: ca.id, value: ca.name }))
      setCaFilterOptions(options)
    }
  }, [caTableQuery.data])

  const columns: TableProps<CertificateTemplate>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row) => {
        return (
          <Button type='link'
            onClick={() =>
              navigate(`${tenantBasePath.pathname}/` + getPolicyDetailsLink({
                type: PolicyType.CERTIFICATE_TEMPLATE,
                oper: PolicyOperation.DETAIL,
                policyId: row.id
              }))}>
            {row.name}
          </Button>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'CA Type' }),
      dataIndex: 'caType',
      key: 'caType',
      render: function (_, row) {
        return $t(caTypeShortLabel[row.caType as keyof typeof caTypeShortLabel])
      }
    },
    {
      title: $t({ defaultMessage: 'Certificates' }),
      dataIndex: 'numberOfCertificates',
      key: 'numberOfCertificates',
      render: function (_, row) {
        const displayText = row.certificateCount || 0
        const items = row.certificateNames || []
        return (
          row.certificateCount === 0 ? 0 :
            <SimpleListTooltip
              title={$t({ defaultMessage: 'Certificates' })}
              displayText={displayText}
              items={items}
              maximum={26}
            />)
      }
    },
    {
      title: $t({ defaultMessage: 'Common Name' }),
      dataIndex: ['onboard', 'commonNamePattern'],
      key: 'commonName',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Certificate Authority' }),
      dataIndex: 'caId',
      key: 'caId',
      filterable: caFilterOptions,
      render: function (_, row) {
        return row.onboard?.certificateAuthorityName || noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Adaptive Policy Set' }),
      dataIndex: 'policySet',
      key: 'policySet',
      render: function (_, row) {
        return row.policySetId ?
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ADAPTIVE_POLICY_SET,
              oper: PolicyOperation.DETAIL,
              policyId: row.policySetId
            })}>
            {policySetData.get(row.policySetId) || row.policySetId}
          </TenantLink>
          : noDataDisplay
      }
    }
  ]

  const rowActions: TableProps<CertificateTemplate>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.CERTIFICATE_TEMPLATE,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id
          })
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => showDeleteModal(selectedRow, clearSelection)
    }
  ]

  const showDeleteModal = (selectedRow: CertificateTemplate, clearSelection: () => void) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: 'template',
        entityValue: selectedRow.name,
        numOfEntities: 1,
        confirmationText: 'Delete',
        extraContent: <>
          <Row style={{ marginTop: 10 }}>
            <Col>
              <Text type='danger' strong> {$t({ defaultMessage: 'IMPORTANT' })}: </Text>
              <Text> {$t(deleteDescription.TEMPLATE_DETAIL)} </Text>
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
        deleteCertificateTemplate({
          params: { templateId: selectedRow.id }
        }).then(() => {
          clearSelection()
        })
      }
    })
  }

  return (
    <Loader states={[tableQuery]}>
      <Table<CertificateTemplate>
        settingsId='certificate-template-table'
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'radio' }}
        rowKey='id'
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}

