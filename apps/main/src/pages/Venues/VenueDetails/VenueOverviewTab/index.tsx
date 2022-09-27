import React from 'react'

import { Card }    from 'antd'
import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'

import * as UI from './styledComponents'

const WifiWidgets = React.lazy(() => import('rc/Widgets'))

export function VenueOverviewTab () {

  const { $t } = useIntl()

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Topology' }),
      value: 'topology',
      children: <span>Topology</span>
    },
    {
      label: $t({ defaultMessage: 'Floor Plans' }),
      value: 'floor-plans',
      children: <WifiWidgets name='floorPlans'/>
    }
  ]

  return (
    <Card>
      <UI.ContentSwitcherContainer>
        <ContentSwitcher
          defaultValue='floor-plans'
          tabDetails={tabDetails}
          size='small'
          align='left'
        />
      </UI.ContentSwitcherContainer>
    </Card>
  )
}
