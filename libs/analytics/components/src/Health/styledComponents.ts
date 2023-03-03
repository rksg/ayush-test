import styled from 'styled-components/macro'

import { Subtitle } from '@acx-ui/components'

const pillDescCommom = `
  font-size: var(--acx-subtitle-6-font-size);
  text-align: center;
  color: var(--acx-neutrals-40);
`
export const ThresholdTitle = styled(Subtitle).attrs({ level: 4 })`
  padding: 16px 0px 11px;
  border-bottom: 1px solid var(--acx-neutrals-30);
`

export const PillTitle = styled(Subtitle).attrs({ level: 5 })`
  padding-bottom: 3px;
  text-align: center;
  flex-direction: row;
  display: flex;
  align-items: center;
  justify-content: center;
  >span:last-of-type{
    margin-left: 3px;
    cursor: pointer;
    display: flex;
  }
`
export const PillWrap = styled.div`
  display: flex;
  flex-grow: 0;
  padding: 0 10px 0 0;
`

export const PillDesc = styled.div`
  ${pillDescCommom}
  margin-top: 10px;
`
export const PillThresholdDesc = styled.div`${pillDescCommom}`
export const PillThresholdVal = styled.u`
  color: var(--acx-primary-black);
`