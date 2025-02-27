import { useEffect, useState } from 'react'

import { Form,Space, Typography } from 'antd'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { MAX_CERTIFICATE_PER_TENANT }                                            from '@acx-ui/rc/components'
import {
  useGetAdaptivePolicySetQuery,
  useGetPrioritizedPoliciesQuery, useLazyGetCertificateTemplatesQuery, useLazyGetDpskListQuery,
  useLazySearchMacRegListsQuery, useLazySearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import {
  CertTemplateLink, DpskPoolLink,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink, getScopeKeyByPolicy, IdentityGroupLink, MacRegistrationPoolLink,
  PolicyOperation,
  PolicyType, RadiusAttributeGroupUrlsInfo,
  useAdaptivePolicyBreadcrumb
} from '@acx-ui/rc/utils';
import { TenantLink } from '@acx-ui/react-router-dom'

import { NetworkTable } from './NetworkTable'
import { getOpsApi } from '@acx-ui/utils';

interface AssociatedService {
  id: string | undefined
  name: string
  type: string
  networkCount: number
}

export default function AdaptivePolicySetDetail () {
  const { $t } = useIntl()
  const { policyId, tenantId } = useParams()
  const { Paragraph } = Typography
  const isIdentityGroupIntegration = useIsSplitOn(Features.POLICY_IDENTITY_TOGGLE)
  const [networkIdsInMacList, setNetworkIdsInMacList] = useState([] as string [])
  const [networkIdsInDpskList, setNetworkIdsInDpskList] = useState([] as string [])
  const [serviceList, setServiceList] = useState<AssociatedService[]>([])
  const [isServiceListLoading, setIsServiceLoading] = useState(false)
  // eslint-disable-next-line max-len
  const { data: policySetData, isLoading: isGetAdaptivePolicySetLoading }= useGetAdaptivePolicySetQuery({ params: { policySetId: policyId } })

  // eslint-disable-next-line max-len
  const { data: prioritizedPolicies } = useGetPrioritizedPoliciesQuery({ params: { policySetId: policyId } })

  const [ macRegList ] = useLazySearchMacRegListsQuery()

  const [ dpskList ] = useLazyGetDpskListQuery()

  const [ queryIdentityGroup ] = useLazySearchPersonaGroupListQuery()

  const [ queryCertificateTemplate ] = useLazyGetCertificateTemplatesQuery()

  const breadcrumb = useAdaptivePolicyBreadcrumb(PolicyType.ADAPTIVE_POLICY_SET)
  const columns: TableProps<AssociatedService>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (text, record) => {
        switch (record.type) {
          case 'cert':
            return <CertTemplateLink name={record.name} id={record.id} />
          case 'dpsk':
            return <DpskPoolLink name={record.name} dpskPoolId={record.id} />
          case 'mac':
            // eslint-disable-next-line max-len
            return <MacRegistrationPoolLink name={record.name} macRegistrationPoolId={record.id} />
          case 'identity':
            // eslint-disable-next-line max-len
            return <IdentityGroupLink name={record.name} personaGroupId={record.id} />
          default:
            return text
        }
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      filterMultiple: false,
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (text, record) => {
        switch (record.type) {
          case 'cert':
            return $t({ defaultMessage: 'Certificate Template' })
          case 'dpsk':
            return $t({ defaultMessage: 'DPSK Service' })
          case 'mac':
            return $t({ defaultMessage: 'MAC Registration List' })
          case 'identity':
            return $t({ defaultMessage: 'Identity Group' })
          default:
            return text
        }
      }
    },
    {
      title: $t({ defaultMessage: 'Network Count' }),
      dataIndex: 'networkCount',
      key: 'networkCount'
    }
  ]

  useEffect(() => {
    if (isGetAdaptivePolicySetLoading) return

    setIsServiceLoading(true)

    const mapPoolToService = (pool: {
      id?: string,
      name?: string,
      networkCount?: number
    }, type: string) => ({
      id: pool.id,
      name: pool.name ?? '',
      type: type,
      networkCount: pool.networkCount ?? 0
    })

    const fetchMacRegList = async () =>
      macRegList({
        params: { tenantId, size: '100000', page: '1', sort: 'name,desc' },
        payload: {
          dataOption: 'all',
          searchCriteriaList: [{ filterKey: 'policySetId', operation: 'eq', value: policyId }]
        }
      }).then((result) => {
        if (result.data) {
          if (isIdentityGroupIntegration) {
            return result.data.data.map((pool) => mapPoolToService(pool, 'mac'))
          } else {
            setNetworkIdsInMacList(
              result.data?.data.map((pool) => pool.networkIds ?? []).flat() ?? []
            )
          }
        }
        return []
      })

    const fetchDpskList = async () =>
      dpskList({ params: { size: '100000', page: '0', sort: 'name,desc' } }).then((result) => {
        if (result.data) {
          if (isIdentityGroupIntegration) {
            return result.data.data
              .filter((pool) => pool.policySetId === policyId)
              .map((pool) => mapPoolToService(pool, 'dpsk'))
          } else {
            setNetworkIdsInDpskList(
              result.data?.data.filter((pool) => pool.policySetId === policyId)
                .map((pool) => pool.networkIds ?? []).flat() ?? []
            )
          }
        }
        return []
      })

    const fetchCertificateTemplate = async () =>
      queryCertificateTemplate({
        payload: { page: 1, pageSize: MAX_CERTIFICATE_PER_TENANT }
      }).then((result) => {
        if (result.data) {
          return result.data.data
            .filter((pool) => pool.policySetId === policyId)
            .map((pool) => mapPoolToService(pool, 'cert'))
        }
        return []
      })

    const fetchIdentityGroup = async () => {
      const identityGroupIds = policySetData?.externalAssignments
        .filter((assignment) => assignment.identityName === 'IdentityGroup')
        .flatMap((assignment) => assignment.identityId) || []

      if (!isIdentityGroupIntegration || identityGroupIds.length === 0) {
        return Promise.resolve([])
      }
      return queryIdentityGroup({
        payload: { pageSize: `${identityGroupIds.length}`, page: '1', groupIds: identityGroupIds }
      }).then((result) => {
        if (result.data) {
          return result.data.data
            .filter((pool) => pool.policySetId === policyId)
            .map((pool) => mapPoolToService(pool, 'identity'))
        }
        return []
      })
    }

    // eslint-disable-next-line max-len
    Promise.all([fetchMacRegList(), fetchDpskList(), fetchCertificateTemplate(), fetchIdentityGroup()])
      .then((results) => {
        setServiceList(results.flat())
        setIsServiceLoading(false)
      })
  }, [isGetAdaptivePolicySetLoading, policySetData])

  return (
    <>
      <PageHeader
        title={policySetData?.name || ''}
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={
              getPolicyDetailsLink({
                type: PolicyType.ADAPTIVE_POLICY_SET,
                oper: PolicyOperation.EDIT,
                policyId: policyId as string
              })}
            scopeKey={getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.EDIT)}
            rbacOpsIds={[getOpsApi(RadiusAttributeGroupUrlsInfo.updatePolicySet)]}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Space direction={'vertical'}>
        <Card>
          <Loader states={[
            { isLoading: isGetAdaptivePolicySetLoading }
          ]}>
            <Form layout={'vertical'}>
              <GridRow>
                <GridCol col={{ span: 6 }}>
                  <Form.Item label={$t({ defaultMessage: 'Policy Set Name' })}>
                    <Paragraph>{policySetData?.name}</Paragraph>
                  </Form.Item>
                </GridCol>
                <GridCol col={{ span: 6 }}>
                  <Form.Item label={$t({ defaultMessage: 'Members' })}>
                    <Paragraph>{prioritizedPolicies?.totalCount ?? 0}</Paragraph>
                  </Form.Item>
                </GridCol>
              </GridRow>
            </Form>
          </Loader>
        </Card>
        {isIdentityGroupIntegration ? (
          <Loader states={[{ isLoading: isServiceListLoading }]}>
            <Card
              title={$t(
                { defaultMessage: 'Associated Services ({size})' },
                { size: serviceList.length }
              )}
            >
              <div style={{ width: '100%' }}>
                <Table
                  rowKey='id'
                  columns={columns}
                  dataSource={serviceList}
                />
              </div>
            </Card>
          </Loader>
        ) : (
          // eslint-disable-next-line max-len
          <NetworkTable
            networkIds={[
              ...new Set([...networkIdsInMacList, ...networkIdsInDpskList])
            ]}
          />
        )}
      </Space>
    </>
  )
}
