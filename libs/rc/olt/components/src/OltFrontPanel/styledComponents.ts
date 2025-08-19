import styled from 'styled-components'

import { Card as CardComponent, Descriptions } from '@acx-ui/components'
import { OltCageStateEnum }                    from '@acx-ui/olt/utils'


const UNIT_WIDTH = 24
const UNIT_HEIGHT = 24
const UNIT_COL_GAP = 10
const UNIT_ROW_GAP = 10
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 70%;
  min-width: 750px;
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 8px;
  border: 2px solid var(--acx-neutrals-50);
`

export const Slot = styled.div<{ type: 'NT' | 'LT' | 'ONT' }>`
  display: flex;
  position: relative;
  justify-content: center;
  width: 100%;
  padding: 10px 0;

  ${({ type }) => type === 'NT' && `
    width: 33%;
    border-right: 1px solid var(--acx-neutrals-50);
  `}

  ${({ type }) => type === 'LT' && `
    border-top: 1px solid var(--acx-neutrals-50);
  `}

  ${({ type }) => type === 'ONT' && `
    border: 0 !important;
    padding: 24px 0;
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

export const SlotUnits = styled.div<{ type: 'NT' | 'LT' | 'ONT' }>`
  max-width: ${({ type }) => type === 'NT' ? MAX_NC_WIDTH : MAX_LC_WIDTH}px;
  display: flex;
  flex-wrap: wrap;
  gap: ${UNIT_ROW_GAP}px ${UNIT_COL_GAP}px;

  ${({ type }) => type === 'NT' && `
    justify-content: center;
  `}
`

export const UnitWrapper = styled.div`
  align-items: center;
  text-align: center;
`

export const Unit = styled.div<{ status?: OltCageStateEnum }>`
  display: flex;
  width: ${UNIT_WIDTH}px;
  height: ${UNIT_HEIGHT}px;
  border: 1px solid var(--acx-neutrals-50);
  background-color: var(--acx-neutrals-20);
  border-radius: 2px;
  align-items: center;
  justify-content: center;

  ${({ status }) => status === OltCageStateEnum.UP && `
    background-color: var(--acx-semantics-green-50);
    color: var(--acx-primary-white);
  `}

`

export const UnitTitle = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-neutrals-60);
  margin-top: 2px;
`

export const TooltipDescriptions = styled(Descriptions)`
  .ant-descriptions-item-content,
  .ant-descriptions-item .ant-descriptions-item-container .ant-descriptions-item-label {
    color: var(--acx-primary-white) !important;
  }
`