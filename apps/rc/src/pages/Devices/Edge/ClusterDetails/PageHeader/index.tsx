import { useContext } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { EdgePermissions }                                          from '@acx-ui/edge/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes }     from '@acx-ui/types'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

export const EdgeClusterDetailsPageHeader = () => {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)

  const { $t } = useIntl()
  const { clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const {
    startDate, endDate,
    setDateFilter,
    range } = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
  const { clusterInfo } = useContext(EdgeClusterDetailsDataContext)

  return (
    <PageHeader
      title={clusterInfo?.name || ''}
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
          <Button
            scopeKey={[EdgeScopes.UPDATE]}
            rbacOpsIds={EdgePermissions.editEdgeCluster}
            type='primary'
            onClick={() =>
              navigate({
                ...basePath,
                // eslint-disable-next-line max-len
                pathname: `${basePath.pathname}/devices/edge/cluster/${clusterId}/edit/cluster-details`
              })
            }
          >{$t({ defaultMessage: 'Configure' })}</Button>
        ])
      ]}
      // TODO: will be added back once we have cluster level service or other cluster perspective detail page
      // footer={<EdgeClusterDetailsTabs />}
    />
  )
}
