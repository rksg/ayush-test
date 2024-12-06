
import { Col, Row, Space, Switch } from 'antd'
import { useIntl }                 from 'react-intl'

import { StepsForm, Table, TableProps, Tooltip, useStepFormContext }                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { CompatibilityWarningTriangleIcon }                                            from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery, useGetEdgeFeatureSetsQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import {
  EdgeClusterStatus,
  IncompatibilityFeatures,
  EdgeHqosViewData,
  EdgeStatus,
  defaultSort,
  sortProp,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }      from '@acx-ui/react-router-dom'
import { compareVersions } from '@acx-ui/utils'

import * as UI from '../styledComponents'

export const ScopeForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeHqosViewData>()
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeClusterListQuery,
    defaultPayload: {
      fields: [
        'name',
        'clusterId',
        'venueId',
        'venueName',
        'activeAps',
        'edgeList'
      ]
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const edgeClusterList = tableQuery.data?.data
  const clusterIds = edgeClusterList?.map(item => item.clusterId)
  const { clusterNodesMap = {} } = useGetEdgeListQuery({
    payload: {
      fields: [
        'serialNumber',
        'firmwareVersion',
        'clusterId'
      ],
      filters: { clusterId: clusterIds }
    } }, {
    skip: !clusterIds?.length || !isEdgeCompatibilityEnabled,
    selectFromResult: ({ data }) => {
      return { clusterNodesMap: clusterIds?.reduce((acc, curr = '') => {
        return {
          ...acc, [curr]: data?.data?.filter(item => item.clusterId === curr) || []
        }
      }, {}) as { [clusterId: string]: EdgeStatus[] } }
    }
  })

  const { requiredFw } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: ['HQoS']
      }
    } }, {
    skip: !isEdgeCompatibilityEnabled,
    selectFromResult: ({ data }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.HQOS)?.requiredFw
      }
    }
  })

  const showHqosReadOnlyToolTipMessage = (hqosReadOnly : boolean) => {
    if (hqosReadOnly === true) {
      return $t({ defaultMessage:
        'Insufficient CPU cores have been detected on this cluster' })
    }
    return ''
  }

  const columns: TableProps<EdgeClusterStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row) => {
        // eslint-disable-next-line max-len
        const edgesData = clusterNodesMap[row.clusterId as keyof typeof clusterNodesMap]?.sort((n1, n2) =>
          compareVersions(n1.firmwareVersion, n2.firmwareVersion))
        const minNodeVersion = edgesData?.[0]?.firmwareVersion
        const isLower = !!minNodeVersion && compareVersions(minNodeVersion, requiredFw) < 0
        return <Space size='small'>
          {row.name}
          {isLower && <Tooltip
            title={
              <>
                {$t({ defaultMessage: `HQoS feature requires your RUCKUS Edge cluster
                running firmware version <b>{requiredFw}</b> or higher. You may upgrade your
                <venueSingular></venueSingular> firmware from {targetLink}` },
                {
                  b: (txt) => <b>{txt}</b>,
                  requiredFw,
                  targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
                    {/* eslint-disable-next-line max-len*/}
                    {$t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' })}
                  </TenantLink>
                })}
              </>
            }>
            <CompatibilityWarningTriangleIcon />
          </Tooltip>
          }
        </Space>
      }
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      key: 'activeAps',
      dataIndex: 'activeAps',
      fixed: 'left',
      width: 50
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      align: 'center',
      render: (_, row) => {
        const hqosReadOnly =
          row.edgeList?.find(e => e.cpuCores === undefined || e.cpuCores < 4) ? true : false
        return <Tooltip title={showHqosReadOnlyToolTipMessage(hqosReadOnly)}>
          <>
            <UI.StyledFormItem
              name={['activateChangedClusters', row.clusterId??'']}
              valuePropName='checked'
              children={
                <Switch disabled={hqosReadOnly}
                  onChange={() =>
                  // eslint-disable-next-line max-len
                    setActivateChangedClustersInfo(row.clusterId??'', row.name??'', row.venueId??'')}/>
              }
            />
          </>
        </Tooltip>
      }
    }
  ]

  const setActivateChangedClustersInfo = (clusterId:string, clusterName:string, venueId:string) => {
    form.setFieldValue('activateChangedClustersInfo', {
      ...form.getFieldValue('activateChangedClustersInfo'),
      [clusterId]: { venueId: venueId, clusterName: clusterName }
    })

  }

  return (
    <Row>
      <Col span={13}>
        <StepsForm.Title>{$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
      </Col>
      <Col span={15}>
        <UI.FieldText>
          {
            $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'Activate clusters that the HQoS bandwidth profile will be applied:'
            })
          }
        </UI.FieldText>
        <Table
          columns={columns}
          dataSource={edgeClusterList}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='clusterId'
        />
      </Col>
    </Row>


  )
}
