import { useState } from 'react'


import Icon                      from '@ant-design/icons'
import { Tooltip as AntTooltip } from 'antd'
import { useIntl }               from 'react-intl'

import { ApVenueStatusEnum } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

export interface FilterState {
  [key: string]: boolean
  [ApVenueStatusEnum.REQUIRES_ATTENTION] : boolean
  [ApVenueStatusEnum.TRANSIENT_ISSUE]: boolean
  [ApVenueStatusEnum.IN_SETUP_PHASE]: boolean
  [ApVenueStatusEnum.OPERATIONAL]: boolean
}

export type FilterStateChange = {
  key: string
  value: boolean
}

interface VenueFilterControlBoxProps {
  onChange: (e: FilterStateChange) => void;
}

export default function VenueFilterControlBox (props: VenueFilterControlBoxProps) {
  const { $t } = useIntl()
  const [ filter, setFilter ] = useState<FilterState>({
    [ApVenueStatusEnum.REQUIRES_ATTENTION]: true,
    [ApVenueStatusEnum.TRANSIENT_ISSUE]: true,
    [ApVenueStatusEnum.IN_SETUP_PHASE]: true,
    [ApVenueStatusEnum.OPERATIONAL]: true
  })

  function onChange (e: CheckboxChangeEvent) {
    filter[e.target.name!] = !filter[e.target.name!]
    setFilter(filter)
    props.onChange({ key: e.target.name!, value: filter[e.target.name!] })
  }

  return (
    <UI.VenueFilterContainer>
      <UI.FilterBoxTitle>{$t({ defaultMessage: 'Show' })}</UI.FilterBoxTitle>
      <UI.FilterCheckbox
        name={ApVenueStatusEnum.REQUIRES_ATTENTION}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.REQUIRES_ATTENTION]}>
        <AntTooltip title={$t({ defaultMessage: 'Requires Attention' })} placement='right'>
          <Icon component={UI.VenueMarkerRedIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnum.TRANSIENT_ISSUE}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.TRANSIENT_ISSUE]}>
        <AntTooltip title={$t({ defaultMessage: 'Temporarily degraded' })} placement='right'>
          <Icon component={UI.VenueMarkerOrangeIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnum.IN_SETUP_PHASE}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.IN_SETUP_PHASE]}>
        <AntTooltip title={$t({ defaultMessage: 'In Setup Phase' })} placement='right'>
          <Icon component={UI.VenueMarkerGreyIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnum.OPERATIONAL}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.OPERATIONAL]}>
        <AntTooltip title={$t({ defaultMessage: 'Operational' })} placement='right'>
          <Icon component={UI.VenueMarkerGreenIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
    </UI.VenueFilterContainer>
  )
}
