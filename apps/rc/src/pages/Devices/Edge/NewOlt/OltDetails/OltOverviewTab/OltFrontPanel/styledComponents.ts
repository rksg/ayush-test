import styled from 'styled-components'

import { Card as CardComponent } from '@acx-ui/components'

const UNIT_WIDTH = 24
const UNIT_HEIGHT = 20
const UNIT_COL_GAP = 10
const UNIT_ROW_GAP = 6
const MAX_UNITS_PER_LC_LINE = 16
const MAX_UNITS_PER_NC_LINE = 4
const MAX_LC_WIDTH = UNIT_WIDTH * MAX_UNITS_PER_LC_LINE + UNIT_COL_GAP * (MAX_UNITS_PER_LC_LINE - 1)
const MAX_NC_WIDTH = UNIT_WIDTH * MAX_UNITS_PER_NC_LINE + UNIT_COL_GAP * (MAX_UNITS_PER_NC_LINE - 1)

export const Card = styled(CardComponent)`
  padding: 24px !important;
`

export const CardTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Wrapper = styled.div`
  width: 70%;
  min-width: 750px;
  max-width: 1000px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 8px;
  border: 2px solid var(--acx-neutrals-50);
`

export const Slot = styled.div<{ type: 'NC' | 'LC' }>`
  display: flex;
  position: relative;
  justify-content: center;
  width: 100%;
  padding: 16px 0 7px;

  ${({ type }) => type === 'NC' && `
    width: 33%;
    border-right: 1px solid var(--acx-neutrals-50);
  `}

  ${({ type }) => type === 'LC' && `
    border-top: 1px solid var(--acx-neutrals-50);
  `}

  &:first-child {
    border-left: 1px solid var(--acx-neutrals-50);
  }
`

export const SlotTitle = styled.div`
  position: absolute;
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-body-font-weight-bold);
  color: var(--acx-accents-blue-50);
  top: 12px;
  left: 12px;
`

export const SlotUnits = styled.div<{ type: 'NC' | 'LC' }>`
  max-width: ${({ type }) => type === 'NC' ? MAX_NC_WIDTH : MAX_LC_WIDTH}px;
  display: flex;
  flex-wrap: wrap;
  gap: ${UNIT_ROW_GAP}px ${UNIT_COL_GAP}px;

  ${({ type }) => type === 'NC' && `
    justify-content: center;
  `}
`

export const UnitWrapper = styled.div`
  align-items: center;
  text-align: center;
`

export const Unit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${UNIT_WIDTH}px;
  height: ${UNIT_HEIGHT}px;
  border: 1px solid var(--acx-neutrals-50);
  border-radius: 4px;
`

export const UnitTitle = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-neutrals-60);
`