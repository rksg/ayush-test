import { useContext } from 'react'

import {
  Col,
  Menu,
  MenuProps,
  Row,
  Space
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, CaretDownSolidIcon, Dropdown, PageHeader, RangePicker }       from '@acx-ui/components'
import { Features }                                                            from '@acx-ui/feature-toggle'
import { EdgeStatusLight, useEdgeActions, useIsEdgeFeatureReady }              from '@acx-ui/rc/components'
import {
  EdgeStatusEnum, rebootShutdownEdgeStatusWhiteList, resettabaleEdgeStatuses
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, OpsIds, ScopeKeys } from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { useDateFilter }                 from '@acx-ui/utils'

import { HaStatusBadge }          from '../../HaStatusBadge'
import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import EdgeDetailsTabs from './EdgeDetailsTabs'

export const EdgeDetailsPageHeader = () => {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const params = useParams()
  const { serialNumber } = params
  const { currentEdgeStatus: currentEdge, currentCluster } = useContext(EdgeDetailsDataContext)

  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const { reboot, shutdown, factoryReset, deleteEdges } = useEdgeActions()

  const status = currentEdge?.deviceStatus as EdgeStatusEnum
  const currentEdgeOperational = status === EdgeStatusEnum.OPERATIONAL
  const isGracefulShutdownReady = useIsEdgeFeatureReady(Features.EDGE_GRACEFUL_SHUTDOWN_TOGGLE)

  const menuConfig = [
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      label: $t({ defaultMessage: 'Reboot' }),
      key: 'reboot',
      showupstatus: rebootShutdownEdgeStatusWhiteList
    },
    ...(isGracefulShutdownReady ? [{
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      label: $t({ defaultMessage: 'Shutdown' }),
      key: 'shutdown',
      showupstatus: rebootShutdownEdgeStatusWhiteList
    }] : []),
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      label: $t({ defaultMessage: 'Reset & Recover' }),
      key: 'factoryReset',
      showupstatus: resettabaleEdgeStatuses
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      label: $t({ defaultMessage: 'Delete RUCKUS Edge' }),
      key: 'delete',
      showupstatus: [...Object.values(EdgeStatusEnum)]
    }
  ] as {
    scopeKey: ScopeKeys,
    label: string,
    key: string,
    showupstatus?: EdgeStatusEnum[],
    rbacOpsId?: OpsIds
  } []

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (!currentEdge) return
    switch(e.key) {
      case 'reboot':
        reboot(currentEdge)
        break
      case 'shutdown':
        shutdown(currentEdge)
        break
      case 'factoryReset':
        factoryReset(currentEdge)
        break
      case 'delete':
        deleteEdges(
          [currentEdge],
          () => navigate(`${basePath.pathname}/devices/edge`)
        )
        break
      default:
        return
    }
  }
  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={
        menuConfig.filter(item =>
          item.showupstatus?.includes(status) && hasPermission({
            scopes: item.scopeKey,
            rbacOpsIds: item.rbacOpsId
          })
        ).map(({ showupstatus, scopeKey, ...itemFields }) => {
          return { ...itemFields }
        })
      }
    />
  )

  return (
    <PageHeader
      title={currentEdge?.name || ''}
      titleExtra={
        <Row gutter={[5,0]}>
          <Col>
            <EdgeStatusLight data={status} showText={!currentEdgeOperational}/>
          </Col>
          <Col>
            {
              (currentCluster?.smartEdges.length ?? 0) > 1 &&
              <HaStatusBadge
                haStatus={currentEdge?.haStatus}
                needPostFix
              />
            }
          </Col>
        </Row>
      }
      breadcrumb={[
        { text: $t({ defaultMessage: 'RUCKUS Edges' }), link: '/devices/edge' }
      ]}
      extra={[
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        ...filterByAccess([
          <Dropdown
            // scopeKey={[EdgeScopes.DELETE, EdgeScopes.UPDATE]}
            overlay={menu}>{()=>
              <Button>
                <Space>
                  {$t({ defaultMessage: 'More Actions' })}
                  <CaretDownSolidIcon />
                </Space>
              </Button>
            }</Dropdown>,
          <Button
            scopeKey={[EdgeScopes.UPDATE]}
            type='primary'
            onClick={() =>
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/devices/edge/${serialNumber}/edit/general-settings`
              })
            }
          >{$t({ defaultMessage: 'Configure' })}</Button>
        ])
      ]}
      footer={<EdgeDetailsTabs isOperational={currentEdgeOperational} />}
    />
  )
}
