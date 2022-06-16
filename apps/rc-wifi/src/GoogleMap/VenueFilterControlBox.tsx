import { useState } from 'react'

import Icon from '@ant-design/icons'

import { Tooltip } from '@acx-ui/components'

import { ApVenueStatusEnum } from './constant'
import * as UI               from './styledComponents'

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
  onChange?: (e: FilterStateChange) => void;
}

export default function VenueFilterControlBox (props: VenueFilterControlBoxProps) {
  const [ filter, setFilter ] = useState<FilterState>({
    [ApVenueStatusEnum.REQUIRES_ATTENTION]: true,
    [ApVenueStatusEnum.TRANSIENT_ISSUE]: true,
    [ApVenueStatusEnum.IN_SETUP_PHASE]: true,
    [ApVenueStatusEnum.OPERATIONAL]: true
  })
  function onChange (e:any) {
    filter[e.target.name] = !filter[e.target.name]
    setFilter(filter)
    if(props.onChange){
      props.onChange({ key: e.target.name, value: filter[e.target.name] })
    }
  }
  return (
    <UI.VenueFilterContainer>
      <UI.FilterBoxTitle>Show</UI.FilterBoxTitle>
      <UI.FilterCheckbox
        name={ApVenueStatusEnum.REQUIRES_ATTENTION}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.REQUIRES_ATTENTION]}>
        <Tooltip title='Requires Attention' placement='right'>
          <Icon component={UI.VenueMarkerRedIcon} />
        </Tooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnum.TRANSIENT_ISSUE}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.TRANSIENT_ISSUE]}>
        <Tooltip title='Temporarily degraded' placement='right'>
          <Icon component={UI.VenueMarkerOrangeIcon} />
        </Tooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnum.IN_SETUP_PHASE}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.IN_SETUP_PHASE]}>
        <Tooltip title='In Setup Phase' placement='right'>
          <Icon component={UI.VenueMarkerGreyIcon} />
        </Tooltip>
      </UI.FilterCheckbox>
      <UI.FilterCheckbox name={ApVenueStatusEnum.OPERATIONAL}
        onChange={onChange}
        defaultChecked={filter[ApVenueStatusEnum.OPERATIONAL]}>
        <Tooltip title='Operational' placement='right'>
          <Icon component={UI.VenueMarkerGreenIcon} />
        </Tooltip>
      </UI.FilterCheckbox>
    </UI.VenueFilterContainer>
  )
}
