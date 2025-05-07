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

import { Button, CaretDownSolidIcon, Dropdown, getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { EdgePermissions }                                                                        from '@acx-ui/edge/components'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { EdgeStatusLight, useEdgeActions, useIsEdgeFeatureReady }                                 from '@acx-ui/rc/components'
import {
  EdgeStatusEnum, EdgeUrlsInfo, rebootShutdownEdgeStatusWhiteList, resettableEdgeStatuses
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, RbacOpsIds, ScopeKeys } from '@acx-ui/types'
import { filterByAccess, hasPermission }     from '@acx-ui/user'
import { getOpsApi, useDateFilter }          from '@acx-ui/utils'

import { HaStatusBadge }          from '../../HaStatusBadge'
import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import EdgeDetailsTabs from './EdgeDetailsTabs'

export const EdgeDetailsPageHeader = () => {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } =
    useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
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
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.reboot)],
      label: $t({ defaultMessage: 'Reboot' }),
      key: 'reboot',
      showupstatus: rebootShutdownEdgeStatusWhiteList
    },
    ...(isGracefulShutdownReady ? [{
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.shutdown)],
      label: $t({ defaultMessage: 'Shutdown' }),
      key: 'shutdown',
      showupstatus: rebootShutdownEdgeStatusWhiteList
    }] : []),
    {
      scopeKey: [EdgeScopes.CREATE, EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.factoryReset)],
      label: $t({ defaultMessage: 'Reset & Recover' }),
      key: 'factoryReset',
      showupstatus: resettableEdgeStatuses
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.deleteEdge)],
      label: $t({ defaultMessage: 'Delete RUCKUS Edge' }),
      key: 'delete',
      showupstatus: [...Object.values(EdgeStatusEnum)]
    }
  ] as {
    scopeKey: ScopeKeys,
    label: string,
    key: string,
    showupstatus?: EdgeStatusEnum[],
    rbacOpsIds?: RbacOpsIds
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
            rbacOpsIds: item.rbacOpsIds
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
          maxMonthRange={isDateRangeLimit ? 1 : 3}
        />,
        ...filterByAccess([
          <Dropdown
            overlay={menu}
            scopeKey={[EdgeScopes.CREATE, EdgeScopes.UPDATE, EdgeScopes.DELETE]}
            rbacOpsIds={[
              getOpsApi(EdgeUrlsInfo.reboot),
              getOpsApi(EdgeUrlsInfo.shutdown),
              getOpsApi(EdgeUrlsInfo.factoryReset),
              getOpsApi(EdgeUrlsInfo.deleteEdge)
            ]}
          >{()=>
              <Button>
                <Space>
                  {$t({ defaultMessage: 'More Actions' })}
                  <CaretDownSolidIcon />
                </Space>
              </Button>
            }</Dropdown>,
          <Button
            scopeKey={[EdgeScopes.UPDATE]}
            rbacOpsIds={EdgePermissions.editEdgeNode}
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
