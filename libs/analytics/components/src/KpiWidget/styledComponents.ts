import { Space }       from 'antd'
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
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-body-2-font-size);
  font-weight: var(--acx-body-font-weight-bold);
`

export const KpiTitle = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  text-align: left;
`

export const KpiShortText = styled.span`
  display: block;
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-6-font-size);
  line-height: var(--acx-body-6-line-height);
  font-weight: var(--acx-body-font-weight);
  color: var(--acx-neutrals-60);
`

export const Wrapper = styled(Space)`
  width: 100%;
  height: 100%;
  justify-content: center;
`