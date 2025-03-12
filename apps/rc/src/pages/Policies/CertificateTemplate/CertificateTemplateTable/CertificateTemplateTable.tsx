import { useEffect, useState } from 'react'

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Loader, Table, TableProps, showActionModal }                                                                                                                                                                                                                             from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                                                                                                                                                         from '@acx-ui/feature-toggle'
import { MAX_CERTIFICATE_PER_TENANT, SimpleListTooltip, caTypeShortLabel, deleteDescription }                                                                                                                                                                                             from '@acx-ui/rc/components'
import { getDisabledActionMessage, showAppliedInstanceMessage, useDeleteCertificateTemplateMutation, useGetCertificateAuthoritiesQuery, useGetCertificateTemplatesQuery, useLazyGetAdaptivePolicySetQuery, useNetworkListQuery, useSearchPersonaGroupListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import { CertificateTemplate, CertificateUrls, Network, PolicyOperation, PolicyType, filterByAccessForServicePolicyMutation, getPolicyDetailsLink, getScopeKeyByPolicy, useTableQuery }                                                                                                   from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink }                                                                                                                                                                                                                                   from '@acx-ui/react-router-dom'
import { getOpsApi, noDataDisplay }                                                                                                                                                                                                                                                       from '@acx-ui/utils'


export default function CertificateTemplateTable () {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const { $t } = useIntl()
  const { Text } = Typography
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
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

  const getNetworkQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery
  const { networkMap } = getNetworkQuery({
    payload: {
      fields: ['name', 'id'],
      filters: { id: tableQuery?.data?.data.map((item) => item.networkIds).flat() }
    }
  }, {
    skip: !tableQuery.data?.data,
    selectFromResult: ({ data }) => {
      const resData = data?.data as Network[] | undefined
      return {
        networkMap: resData?.reduce((acc, item) => {
          acc[item.id] = item.name
          return acc
        }, {} as { [key: string]: string }) || {}
      }
    }
  })

  const { caFilterOptions } = useGetCertificateAuthoritiesQuery(
    {
      payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1,
        sortField: 'name', sortOrder: 'ASC' }
    },
    {
      selectFromResult: ({ data }) => ({
        caFilterOptions: data?.data.map((ca) => ({ key: ca.id, value: ca.name })) || []
      })
    })
  const { identityGroupIdNameMap } = useSearchPersonaGroupListQuery(
    { payload: { groupIds: tableQuery.data?.data?.map(d => d.identityGroupId) } },
    {
      selectFromResult: ({ data }) => ({
        identityGroupIdNameMap: data?.data?.map(d => ({ id: d.id, name: d.name }))
      })
    })

  useEffect(() => {
    const fetchPolicySets = async () => {
      if (!tableQuery.data?.data) return
      const policySetPromises = tableQuery.data.data.map(async (item) => {
        if (item.policySetId) {
          return queryPolicySet({ params: { policySetId: item.policySetId } })
        }
        return null
      })

      const policySetResponses = await Promise.all(policySetPromises)
      const policySetMap = new Map()
      policySetResponses.forEach((res) => {
        if (res && res.data?.name) {
          policySetMap.set(res.data.id, res.data.name)
        }
      })
      setPolicySetData(policySetMap)
    }
    fetchPolicySets()
  }, [tableQuery.data])

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
      sorter: true,
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
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networks',
      key: 'networks',
      render: function (_, row) {
        const displayText = row.networkIds?.length || 0
        const items = row.networkIds?.map((id) => networkMap[id] || id)
        return (
          row.networkIds?.length === 0 ? 0 :
            <SimpleListTooltip
              title={$t({ defaultMessage: 'Networks' })}
              displayText={displayText}
              items={items || []}
              maximum={26}
            />)
      }
    },
    {
      title: $t({ defaultMessage: 'Identity Group' }),
      dataIndex: 'identityGroupId',
      key: 'identityGroupId',
      render: function (_, row) {
        const item = identityGroupIdNameMap?.filter(data =>
          data.id===row.identityGroupId).map(data => data.name)[0]
        return item ?? noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Common Name' }),
      dataIndex: ['onboard', 'commonNamePattern'],
      key: 'certificateTemplateOnboard.commonNamePattern',
      sorter: true,
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
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
      rbacOpsIds: [getOpsApi(CertificateUrls.editCertificateTemplate)],
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
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.DELETE),
      rbacOpsIds: [getOpsApi(CertificateUrls.deleteCertificateTemplate)],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => showDeleteModal(selectedRow, clearSelection)
    }
  ]
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  const showDeleteModal = (selectedRow: CertificateTemplate, clearSelection: () => void) => {
    const disabledActionMessage =
      getDisabledActionMessage([selectedRow],
        [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'network' }) }],
        $t({ defaultMessage: 'delete' }))
    if (disabledActionMessage) {
      showAppliedInstanceMessage(disabledActionMessage)
    } else {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'template' }),
          entityValue: selectedRow.name,
          numOfEntities: 1,
          confirmationText: $t({ defaultMessage: 'Delete' }),
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
  }

  return (
    <Loader states={[tableQuery]}>
      <Table<CertificateTemplate>
        settingsId='certificate-template-table'
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={allowedRowActions}
        rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
        rowKey='id'
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}

