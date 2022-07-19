import { Checkbox, Space } from 'antd'
import styled              from 'styled-components/macro'

import { Close } from '@acx-ui/icons'

import { ReactComponent as VenueInfoMarkerGreen }  from '../../../assets/map/VenueInfoMarkerGreen.svg'
import { ReactComponent as VenueInfoMarkerGrey }   from '../../../assets/map/VenueInfoMarkerGrey.svg'
import { ReactComponent as VenueInfoMarkerOrange } from '../../../assets/map/VenueInfoMarkerOrange.svg'
import { ReactComponent as VenueInfoMarkerRed }    from '../../../assets/map/VenueInfoMarkerRed.svg'
import { ReactComponent as VenueMarkerGreen }      from '../../../assets/map/VenueMarkerGreen.svg'
import { ReactComponent as VenueMarkerGrey }       from '../../../assets/map/VenueMarkerGrey.svg'
import { ReactComponent as VenueMarkerOrange }     from '../../../assets/map/VenueMarkerOrange.svg'
import { ReactComponent as VenueMarkerRed }        from '../../../assets/map/VenueMarkerRed.svg'

export const FilterCheckbox = styled(Checkbox)`
  margin-left: 0px !important; // override antd default margin
`
const venueMarkerIconStyle = `
  height: 20px;
  width: 32px;
  vertical-align: text-bottom;
  fill: var(--acx-neutrals-50);
`
export const FilterBoxTitle = styled.span`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-body-font-weight-bold);
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

export const CloseIcon = styled(Close)`
  font-size: large;
  margin-top: 2px;
`

interface WrapperProps {
  needPadding?: boolean
}
export const Wrapper = styled.div<WrapperProps>`
  height: 140px;
  width: 375px;
  padding: ${props => props.needPadding ? '10px 15px' : undefined};
  margin-bottom: ${props => !props.needPadding ? '-25px' : undefined};
`
export const CellWrapper = styled(Space)`
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
  font-weight: var(--acx-headline-4-font-weight-bold);
  color: var(--acx-accents-blue-50);
  padding: 10px 0px;
`
export const TotalCount = styled.a`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  color: var(--acx-accents-blue-50);
`

export const VenueClusterTooltip = styled.div`
  width: 200px;
  background-color: var(--acx-primary-white);
  border-radius: 4px;

  .venueInfoHeader {
    color: var(--acx-primary-white);
    font-family: var(--acx-neutral-brand-font);
    font-style: normal;
    font-weight: var(--acx-headline-4-font-weight);
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
  }

  .ListWithIcon-item-title{
    white-space: nowrap;
    width: 145px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ant-list-header {
    padding: 10px;
  }

  .ant-list-bordered {
    border: none;
  }

  .ant-list-items {
    margin: 0;
    padding: 5px;
    list-style: none;
  }

  .ant-list-item {
    padding: 6px;
    color: var(--acx-primary-black);
    font-family: var(--acx-neutral-brand-font);
    font-style: normal;
    font-weight: var(--acx-headline-4-font-weight);
    font-size: var(--acx-headline-5-font-size);
    line-height: var(--acx-subtitle-5-line-height);
  }

  .ant-list-split .ant-list-item {
    border-bottom: 1px solid var(--acx-neutrals-30);
  }

  .ant-list-split .ant-list-header {
    background-color: var(--acx-primary-black);
    border-bottom: 1px solid var(--acx-neutrals-30);
  }

  .ant-list-split.ant-list-something-after-last-item
  .ant-spin-container > .ant-list-items > .ant-list-item:last-child {
    border-bottom: 1px solid var(--acx-neutrals-30);
  }

  .ant-list-split .ant-list-item:last-child {
    border-bottom: none;
    margin-bottom: 5px;
  }

  .ant-list-item:hover {
    background-color: var(--acx-neutrals-25);
  }

  .ant-list-pagination {
    margin-top: 12px;
    text-align: center;
  }

  .ant-pagination-item a {
    display: block;
    padding: 0 6px;
    color: var(--acx-primary-black);
    transition: none;
    font-weight: var(--acx-headline-5-font-weight-bold);
  }

  .ant-pagination-item-active a {
    color: var(--acx-primary-white);
    font-weight: var(--acx-headline-5-font-weight-bold);
    text-decoration-line: none;
  }

  .ant-pagination-item-active {
    font-weight: var(--acx-headline-5-font-weight-bold);
    background-color: var(--acx-accents-blue-50) !important;
    border: none;
  }

  .ant-pagination-prev button, .ant-pagination-next button {
    color: var(--acx-primary-black);
    cursor: pointer;
    user-select: none;
  }

  .ant-list-bordered .ant-list-pagination {
    margin: 0px 24px 10px 24px;
  }
`
