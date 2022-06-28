import { Checkbox } from 'antd'
import { Space }    from 'antd'
import styled       from 'styled-components/macro'

import { ReactComponent as VenueInfoMarkerGreen }  from '../assets/map/VenueInfoMarkerGreen.svg'
import { ReactComponent as VenueInfoMarkerGrey }   from '../assets/map/VenueInfoMarkerGrey.svg'
import { ReactComponent as VenueInfoMarkerOrange } from '../assets/map/VenueInfoMarkerOrange.svg'
import { ReactComponent as VenueInfoMarkerRed }    from '../assets/map/VenueInfoMarkerRed.svg'
import { ReactComponent as VenueMarkerGreen }      from '../assets/map/VenueMarkerGreen.svg'
import { ReactComponent as VenueMarkerGrey }       from '../assets/map/VenueMarkerGrey.svg'
import { ReactComponent as VenueMarkerOrange }     from '../assets/map/VenueMarkerOrange.svg'
import { ReactComponent as VenueMarkerRed }        from '../assets/map/VenueMarkerRed.svg'

export const FilterCheckbox = styled(Checkbox)`
  margin-left: 0px !important; // override antd default margin
`
const venueMarkerIconStyle =`
  height: 20px;
  width: 32px;
  vertical-align: text-bottom;
  fill: var(--acx-neutrals-50);
`
export const FilterBoxTitle = styled.span`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: 700
`
export const VenueFilterContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 3px;
  margin: 18px;
  padding: 12px;
  position: absolute;
  width: 75px;
  height: 173px;
  opacity: 0.9;
  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 30%) 0px 1px 4px -1px;
  overflow: hidden;
  background: none var(--acx-neutrals-20);
`

export const VenueMarkerGreenIcon = styled(VenueMarkerGreen)`
  ${venueMarkerIconStyle}
`
export const VenueMarkerGreyIcon = styled(VenueMarkerGrey)`
  ${venueMarkerIconStyle}
`
export const VenueMarkerOrangeIcon = styled(VenueMarkerOrange)`
  ${venueMarkerIconStyle}
`
export const VenueMarkerRedIcon = styled(VenueMarkerRed)`
  ${venueMarkerIconStyle}
`

export const VenueInfoMarkerGreenIcon = styled(VenueInfoMarkerGreen)`
  ${venueMarkerIconStyle}
`
export const VenueInfoMarkerGreyIcon = styled(VenueInfoMarkerGrey)`
  ${venueMarkerIconStyle}
`
export const VenueInfoMarkerOrangeIcon = styled(VenueInfoMarkerOrange)`
  ${venueMarkerIconStyle}
`
export const VenueInfoMarkerRedIcon = styled(VenueInfoMarkerRed)`
  ${venueMarkerIconStyle}`

export const Wrapper = styled.div`
  height: 140px;
  width: 375px;
  padding: 10px 15px;
`
export const CellWrapper = styled(Space)`
  direction={props => props.direction ? props.direction : 'horizontal'}
  justify-content: left;
  width: 100%;
  height: 15px;
`
export const InfoWindowHeader = styled.div`
  height: 35px;
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--acx-neutrals-30);
`
export const Title = styled.a`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  font-weight: 600;
  color: var(--acx-accents-blue-50);
  padding: 10px 0px;
`
export const TotalCount = styled.a`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: 700;
  color: var(--acx-accents-blue-50);
`
