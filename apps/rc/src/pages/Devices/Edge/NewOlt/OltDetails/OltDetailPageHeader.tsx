import { useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import moment                     from 'moment-timezone'
import { useIntl }                from 'react-intl'

import {
  Dropdown,
  Button,
  CaretDownSolidIcon,
  PageHeader,
  RangePicker,
  Tooltip,
  getDefaultEarliestStart
} from '@acx-ui/components'
import { EdgeNokiaOltStatus }     from '@acx-ui/edge/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeNokiaOltData,
  EdgeNokiaOltStatusEnum,
  getOltStatusConfig
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { EdgeScopes } from '@acx-ui/types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { filterByAccess, hasAllowedOperations, hasPermission } from '@acx-ui/user'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getOpsApi, useDateFilter } from '@acx-ui/utils'

enum MoreActions {
  SYNC_DATA = 'SYNC_DATA',
  REBOOT_OLT = 'REBOOT_OLT',
  REBOOT_LINE_CARD = 'REBOOT_LINE_CARD',
  REBOOT_ONT_ONU = 'REBOOT_ONT_ONU',
  DELETE = 'DELETE'
}

export function OltDetailPageHeader (props: {
  oltDetails: EdgeNokiaOltData
}) {
  const { $t } = useIntl()
  const { oltDetails } = props
  const { oltId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/devices/optical/${oltId}/`)
  // const linkToOlt = useTenantLink('/devices/optical/')

  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)

  const [isSyncing, setIsSyncing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [syncDataEndTime, setSyncDataEndTime] = useState('')

  const isOnline = oltDetails?.status === EdgeNokiaOltStatusEnum.ONLINE

  const { startDate, endDate, setDateFilter, range } =
    useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch(e.key) {
      case MoreActions.SYNC_DATA:
        setIsSyncing(true)
        break
      case MoreActions.REBOOT_OLT:
        break
      case MoreActions.REBOOT_LINE_CARD:
        break
      case MoreActions.REBOOT_ONT_ONU:
        break
      case MoreActions.DELETE:
        break
    }
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE] })
  const hasDeletPermission = hasPermission({
    scopes: [EdgeScopes.DELETE]
    //rbacOpsIds: [getOpsApi(EdgeTnmServiceUrls.)]
  })
  const showDivider = hasUpdatePermission && isOnline && (hasDeletPermission) //TODO
  // hasAllowedOperations([
  //   getOpsApi(EdgeTnmServiceUrls.)
  // ])

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        ...(hasUpdatePermission &&
            // hasAllowedOperations([getOpsApi(EdgeTnmServiceUrls.syncData)]) ? [{
            true ? [{
            key: MoreActions.SYNC_DATA,
            disabled: isSyncing || !isOnline,
            label: <Tooltip placement='bottomRight' title={syncDataEndTime}>
              {$t({ defaultMessage: 'Sync Data' })}
            </Tooltip>
          }, {
            type: 'divider'
          }] : []),

        ...(isOnline && hasUpdatePermission &&
          // hasAllowedOperations([getOpsApi(EdgeTnmServiceUrls.reboot)]) ? [{
          true ? [{
            key: MoreActions.REBOOT_OLT,
            label: $t({ defaultMessage: 'Reboot OLT' })
          }, {
            key: MoreActions.REBOOT_LINE_CARD,
            label: $t({ defaultMessage: 'Reboot Line Card' })
          }, {
            key: MoreActions.REBOOT_ONT_ONU,
            label: $t({ defaultMessage: 'Reboot ONT/ONU' })
          }] : []),

        ...(showDivider ? [{
          type: 'divider'
        }] : [] ),

        ...(hasDeletPermission ? [{
          key: MoreActions.DELETE,
          label: <Tooltip placement='bottomRight' title={syncDataEndTime}>
            { $t({ defaultMessage: 'Delete OLT' }) }
          </Tooltip>
        }] : [])
      ] as ItemType[]
      }/>
  )

  return (
    <PageHeader
      title={oltDetails?.name || ''}
      titleExtra={
        <EdgeNokiaOltStatus //TODO
          config={getOltStatusConfig()}
          status={oltDetails?.status || EdgeNokiaOltStatusEnum.UNKNOWN}
          showText
        />
      }
      breadcrumb={[
        { text: 'Wired' },
        { text: 'Switches' },
        { text: 'Optical List', link: '/devices/optical' }
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
          isOnline ? <Dropdown overlay={menu}
            // rbacOpsIds={[
            //   getOpsApi(EdgeTnmServiceUrls.),
            // ]}
            scopeKey={[EdgeScopes.DELETE, EdgeScopes.UPDATE]}>{() =>
              <Button>
                <Space>
                  {$t({ defaultMessage: 'More Actions' })}
                  <CaretDownSolidIcon />
                </Space>
              </Button>
            }</Dropdown>: null,
          <Button
            type='primary'
            // rbacOpsIds={[getOpsApi(EdgeTnmServiceUrls.)]}
            scopeKey={[EdgeScopes.UPDATE]}
            onClick={() =>
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/edit`
              }, {
                state: {
                  from: location
                }
              })
            }
          >{$t({ defaultMessage: 'Configure' })}</Button>
        ])
      ]}
      // footer={<></>}
      // footer={<SwitchTabs switchDetail={switchDetailHeader as SwitchViewModel} />}
    />
  )
}

