import { useState } from 'react'

import Icon                      from '@ant-design/icons'
import { Tooltip as AntTooltip } from 'antd'

import { ApVenueStatusEnumType } from '@acx-ui/rc/services'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

export interface FilterState {
  [key: string]: boolean
  [ApVenueStatusEnumType.REQUIRES_ATTENTION] : boolean
  [ApVenueStatusEnumType.TRANSIENT_ISSUE]: boolean
  [ApVenueStatusEnumType.IN_SETUP_PHASE]: boolean
  [ApVenueStatusEnumType.OPERATIONAL]: boolean
}

export type FilterStateChange = {
  key: string
  value: boolean
}

interface VenueFilterControlBoxProps {
  onChange?: (e: FilterStateChange) => void;
}

export default function VenueFilterControlBox (props: VenueFilterControlBoxProps) {
  const [ filter, setFilter ] = useState<FilterState>({
    [ApVenueStatusEnumType.REQUIRES_ATTENTION]: true,
    [ApVenueStatusEnumType.TRANSIENT_ISSUE]: true,
    [ApVenueStatusEnumType.IN_SETUP_PHASE]: true,
    [ApVenueStatusEnumType.OPERATIONAL]: true
  })

  function onChange (e: CheckboxChangeEvent) {
    filter[e.target.name!] = !filter[e.target.name!]
    setFilter(filter)
    if(props.onChange){
      props.onChange({ key: e.target.name!, value: filter[e.target.name!] })
    }
  }

  return (
    <UI.VenueFilterContainer>
      <UI.FilterBoxTitle>Show</UI.FilterBoxTitle>
      <UI.FilterCheckbox
        name={ApVenueStatusEnumType.REQUIRES_ATTENTION}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnumType.REQUIRES_ATTENTION]}>
        <AntTooltip title='Requires Attention' placement='right'>
          <Icon component={UI.VenueMarkerRedIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnumType.TRANSIENT_ISSUE}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnumType.TRANSIENT_ISSUE]}>
        <AntTooltip title='Temporarily degraded' placement='right'>
          <Icon component={UI.VenueMarkerOrangeIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnumType.IN_SETUP_PHASE}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnumType.IN_SETUP_PHASE]}>
        <AntTooltip title='In Setup Phase' placement='right'>
          <Icon component={UI.VenueMarkerGreyIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnumType.OPERATIONAL}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnumType.OPERATIONAL]}>
        <AntTooltip title='Operational' placement='right'>
          <Icon component={UI.VenueMarkerGreenIcon} />
        </AntTooltip>
      </UI.FilterCheckbox>
    </UI.VenueFilterContainer>
  )
}
