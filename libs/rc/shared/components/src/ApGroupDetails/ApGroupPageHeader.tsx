
import moment                       from 'moment-timezone'
import { useIntl }                  from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, getDefaultEarliestStart, PageHeader, RangePicker }           from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { LocationOutlined }                                                   from '@acx-ui/icons'
import { ApGroupDetailHeader, useConfigTemplateBreadcrumb, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { WifiScopes }                                                         from '@acx-ui/types'
import { filterByAccess }                                                     from '@acx-ui/user'
import { getOpsApi, useDateFilter }                                           from '@acx-ui/utils'

import { usePathBasedOnConfigTemplate } from '../configTemplates'

import { useApGroupContext }     from './ApGroupContextProvider'
import ApGroupTabs               from './ApGroupTabs'
import { ApGroupDetailSubTitle } from './styledComponents'


function ApGroupPageHeader () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { $t } = useIntl()

  const { apGroupId, activeTab, name, venueName, members, networks } = useApGroupContext()
  const { startDate, endDate, setDateFilter, range } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })

  const apgHeaderData = {
    title: name || '',
    headers: {
      members: members?.count || 0,
      networks: networks?.count || 0
    }
  }

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = usePathBasedOnConfigTemplate(`/devices/apgroups/${apGroupId}`)

  const enableTimeFilter = () => (['incidents'].includes(activeTab as string))

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Wi-Fi' }) },
    { text: $t({ defaultMessage: 'Access Points' }) },
    { text: $t({ defaultMessage: 'AP Group List' }), link: '/devices/wifi/apgroups' }
  ])

  return (
    <PageHeader
      title={apgHeaderData.title || ''}
      titleExtra={<ApGroupDetailSubTitle>
        <LocationOutlined />
        {venueName}
      </ApGroupDetailSubTitle>}
      breadcrumb={breadcrumb}
      extra={[
        enableTimeFilter() &&
          <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
            maxMonthRange={isDateRangeLimit ? 1 : 3}
          />,
        ...filterByAccess([
          <Button type='primary'
            scopeKey={[WifiScopes.UPDATE]}
            rbacOpsIds={[getOpsApi(WifiRbacUrlsInfo.updateApGroup)]}
            children={$t({ defaultMessage: 'Configure' })}
            onClick={() => {
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/edit/general`
              }, {
                state: {
                  from: location
                }
              })
            }} />
        ])
      ]}
      footer={
        <ApGroupTabs apGroupDetail={apgHeaderData as ApGroupDetailHeader} />
      }
    />
  )
}

export default ApGroupPageHeader
