import styled, { css } from 'styled-components/macro'

const alarmStatusIconStyle = css`
  position: relative;
  display: inline-block;
  top: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`

export const CriticalIcon = styled.span`
  ${alarmStatusIconStyle}
  background-color: var(--acx-semantics-red-50);
`

export const MajorIcon = styled.span`
  ${alarmStatusIconStyle}
  background-color: var(--acx-accents-orange-30);
`

export const HealthyIcon = styled.span`
  ${alarmStatusIconStyle}
  background-color: var(--acx-semantics-green-30);
`

export const Percent = styled.span`
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-subtitle-5-font-weight);
`

export const KpiTitle = styled.span`
  margin-top: 15px;
  font-size: var(--acx-headline-3-font-size);
  text-align: left;
`

export const KpiShortText = styled.span`
  margin-top: 5px;
  font-size: var(--acx-headline-5-font-size);
  color: #7F7F7F;
`