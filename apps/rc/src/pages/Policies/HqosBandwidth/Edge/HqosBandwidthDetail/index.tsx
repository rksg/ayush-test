import { Card, Col, Row, Space, Typography } from 'antd'
import { useIntl }                           from 'react-intl'

import { Button, Loader, PageHeader, SummaryCard, Tooltip, cssStr }                                                                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                     from '@acx-ui/feature-toggle'
import { TrafficClassSettingsTable, ToolTipTableStyle }                                                                                               from '@acx-ui/rc/components'
import { useGetEdgeHqosProfileViewDataListQuery }                                                                                                     from '@acx-ui/rc/services'
import { EdgeHqosViewData, PolicyOperation, PolicyType, getPolicyAllowedOperation, getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                                                      from '@acx-ui/react-router-dom'
import { EdgeScopes }                                                                                                                                 from '@acx-ui/types'
import { filterByAccess }                                                                                                                             from '@acx-ui/user'

import * as UI from '../styledComponents'

import { CompatibilityCheck } from './CompatibilityCheck'
import { EdgeClusterTable }   from './EdgeClusterTable'

const EdgeHqosBandwidthDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const { qosViewData, isLoading } = useGetEdgeHqosProfileViewDataListQuery(
    { payload: {
      filters: { id: [params.policyId] }
    } },
    {
      selectFromResult: ({ data, isLoading }) => ({
        qosViewData: data?.data?.[0] || {} as EdgeHqosViewData,
        isLoading
      })
    }
  )

  const qosInfo = [
    {
      title: $t({ defaultMessage: 'Description' }),
      content: () => (qosViewData.description)
    },
    {
      title: $t({ defaultMessage: 'HQoS Bandwidth Control' }),
      content: () => {
        return <Tooltip title={
          <TrafficClassSettingsTable
            trafficClassSettings={qosViewData.trafficClassSettings || []}
          />
        }
        placement='bottom'
        overlayClassName={ToolTipTableStyle.toolTipClassName}
        overlayInnerStyle={{ width: 415 }}
        dottedUnderline={true}>
          <UI.EyeOpenSolidCustom
            height={12}
            width={24}
            color={cssStr('--acx-accents-blue-60')}/>
        </Tooltip>
      }
    }
  ]

  return (
    <><PageHeader
      title={qosViewData && qosViewData?.name}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        { text: $t({ defaultMessage: 'Policies & Profiles' })
          , link: getPolicyListRoutePath(true) },
        {
          text: $t({ defaultMessage: 'HQoS Bandwidth' }),
          link: getPolicyRoutePath({
            type: PolicyType.HQOS_BANDWIDTH,
            oper: PolicyOperation.LIST
          })
        }
      ]}
      extra={filterByAccess([
        // eslint-disable-next-line max-len
        <TenantLink
          scopeKey={[EdgeScopes.UPDATE]}
          rbacOpsIds={getPolicyAllowedOperation(PolicyType.HQOS_BANDWIDTH, PolicyOperation.EDIT)}
          to={getPolicyDetailsLink({
            type: PolicyType.HQOS_BANDWIDTH,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId!
          })}>
          <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
    />
    <Loader states={[
      {
        isFetching: isLoading,
        isLoading: false
      }
    ]}>
      {
        (isEdgeCompatibilityEnabled && !!params.policyId) &&
          <Row>
            <Col span={24}>
              <CompatibilityCheck policyId={params.policyId} />
            </Col>
          </Row>
      }
      <ToolTipTableStyle.ToolTipStyle/>
      <Space direction='vertical' size={30}>
        <SummaryCard data={qosInfo} colPerRow={6} />
        <Card>
          <UI.InstancesMargin>
            <Typography.Title level={2}>
              {$t(
                { defaultMessage: 'Instances ({count})' },
                { count: qosViewData.edgeClusterIds?.length || 0 }
              )}
            </Typography.Title>
          </UI.InstancesMargin>
          <EdgeClusterTable edgeClusterIds={qosViewData.edgeClusterIds || []} />
        </Card>
      </Space>
    </Loader>
    </>
  )

}

export default EdgeHqosBandwidthDetail
