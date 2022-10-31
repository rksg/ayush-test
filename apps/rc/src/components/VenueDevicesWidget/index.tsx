import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'

import { VenueMeshApsTable } from '../../../../main/src/pages/Venues/VenueDetails/VenueDevicesTab/VenueMeshAps'
import { VenueRougeAps }     from '../../../../main/src/pages/Venues/VenueDetails/VenueDevicesTab/VenueRougeAps'


export default function VenueDevicesWidget () {
  const { $t } = useIntl()
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'APs List' }),
      value: 'apsList',
      children: <VenueMeshApsTable />
    },
    {
      label: $t({ defaultMessage: 'AP Groups' }),
      value: 'apGroups',
      children: <span>apGroups</span>
    },
    {
      label: $t({ defaultMessage: 'Rouge APs' }),
      value: 'rougeAps',
      children: <VenueRougeAps />
    }
  ]

  return (
    <AutoSizer>
      {({ height, width }) => (
        <div style={{ width, height }}>
          <ContentSwitcher
            defaultValue='apsList'
            tabDetails={tabDetails}
            size='small'
            align='left'
          />
        </div>
      )}
    </AutoSizer>
  )
}
