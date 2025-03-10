import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { EnforcedButton, usePathBasedOnConfigTemplate }     from '@acx-ui/rc/components'
import { useVenueDetailsHeaderQuery }                       from '@acx-ui/rc/services'
import {
  ConfigTemplateType,
  CommonUrlsInfo,
  useConfigTemplate,
  useConfigTemplateBreadcrumb,
  VenueDetailHeader,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'
import { WifiScopes, EdgeScopes, SwitchScopes }       from '@acx-ui/types'
import { filterByAccess, getShowWithoutRbacCheckKey } from '@acx-ui/user'
import { getOpsApi, useDateFilter }                   from '@acx-ui/utils'

import VenueTabs from './VenueTabs'


function DatePicker () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate, setDateFilter, range } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
    maxMonthRange={isDateRangeLimit ? 1 : 3}
  />
}


function VenuePageHeader () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { tenantId, venueId, activeTab } = useParams()
  const enableTimeFilter = () => !['networks', 'services', 'units'].includes(activeTab as string)

  const { data } = useVenueDetailsHeaderQuery({
    params: { tenantId, venueId },
    payload: { isTemplate }
  })

  const navigate = useNavigate()
  const location = useLocation()
  const detailsPath = usePathBasedOnConfigTemplate(
    `/venues/${venueId}/edit/`,
    `/venues/${venueId}/edit/details`
  )

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }), link: '/venues' }
  ])

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        enableTimeFilter() ? <DatePicker key={getShowWithoutRbacCheckKey('date-filter')} /> : <></>,
        ...filterByAccess([<EnforcedButton
          configTemplateType={ConfigTemplateType.VENUE}
          instanceId={venueId}
          type='primary'
          rbacOpsIds={[
            getOpsApi(CommonUrlsInfo.updateVenue),
            getOpsApi(WifiRbacUrlsInfo.updateVenueRadioCustomization),
            getOpsApi(CommonUrlsInfo.updateVenueSwitchSetting)
          ]}
          scopeKey={[WifiScopes.UPDATE, EdgeScopes.UPDATE, SwitchScopes.UPDATE]}
          onClick={() =>
            navigate(detailsPath, {
              state: {
                from: location
              }
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</EnforcedButton>])
      ]}
      footer={<VenueTabs venueDetail={data as VenueDetailHeader} />}
    />
  )
}

export default VenuePageHeader
