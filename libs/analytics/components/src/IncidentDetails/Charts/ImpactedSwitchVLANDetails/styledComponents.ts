import styled from 'styled-components'

import {
  Switch,
  VLANIcon
} from '@acx-ui/icons'

type vlanType = 'switch' | 'vlan'

// const iconByType = (type: vlanType) => {
//   switch (type) {
//     case 'switch': return Switch
//     case 'vlan': return VLANIcon
//     // case 'port': return sanitizeSVG(portIcon('#607481'))
//   }
// }

export const SummaryType = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
  text-align: center;
  line-height: 1;
  &:not(:first-of-type) {
    border-left: 1px solid ${p => p.theme.incidentDetailTitleBorderColor};
  }
  padding-bottom: 10px;
`

export const Summary = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
`

export const SummaryCount = styled.div`
  font-size: 3.5rem;
  margin-right: 20px;
`

export const SummaryList = styled.div`
  font-size: 12px;
  font-weight: bold;
  line-height: 1.5;
  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    & > span:last-child {
      opacity: 0.6;
    }
  }
`

export const SummaryTitle = styled.div`
  margin-top: 20px;
  font-size: 14px;
  font-weight: bold;
`

export const SummaryDetails = styled.div`
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.6;
`

// export const Icon = styled.span`
//   background: url('${p => iconByType(p.type)}') no-repeat;
//   background-size: 100% 100%;
//   width: 14px;
//   height: 14px;
//   display: inline-block;
//   margin-right: 5px;
// `
