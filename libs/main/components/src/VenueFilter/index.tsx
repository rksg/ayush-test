import { useIntl, defineMessage } from 'react-intl'

import { Cascader, Loader }                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { useVenuesListQuery }                                   from '@acx-ui/rc/services'
import { useParams }                                            from '@acx-ui/react-router-dom'
import { useDashboardFilter, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import * as UI from './styledComponents'

type Venue = { id: string, name: string }

const transformResult = (data: Venue[]) => data.map(
  ({ id, name }) => ({ label: name, value: id })
)

export function VenueFilter () {
  const { $t } = useIntl()
  const { setNodeFilter, venueIds } = useDashboardFilter()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const value = venueIds.map((id: string) => [id])

  const queryResults = useVenuesListQuery({
    params: { ...useParams() },
    payload: {
      fields: ['name', 'id'],
      filters: {},
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000 //ACX-25572
    }
  }, {
    selectFromResult: ({ data, ...rest }) => {
      return { data: data ? transformResult(data?.data as Venue[]) : [],
        ...rest
      }
    }
  })

  useTrackLoadTime({
    itemName: widgetsMapping.ORGANIZATION_DROPDOWN,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <Cascader
          entityName={{
            singular: defineMessage({ defaultMessage: '<venueSingular></venueSingular>' }),
            plural: defineMessage({ defaultMessage: '<venuePlural></venuePlural>' })
          }}
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple
          defaultValue={value}
          value={value}
          options={queryResults.data}
          onApply={(selectedOptions) => setNodeFilter(selectedOptions as string[][])}
          placement='bottomLeft'
          allowClear
        />
      </Loader>
    </UI.Container>
  )
}
