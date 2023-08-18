import styled from 'styled-components/macro'

import { Tile as TileIcon } from '@acx-ui/icons'

export const ReportTileWrapper = styled.div`
  display: grid;
  grid-template-columns: 5fr 6fr;
  height: 100%;
  align-items: center;

  a {
    text-decoration: none
  }

  .ant-statistic {
    display: flex;
    flex-direction: column-reverse;
    .ant-statistic-content {
      font-family: var(--acx-chart-font);
      font-weight: var(--acx-headline-1-font-weight);
      font-size: var(--acx-headline-1-font-size);
      line-height: var(--acx-headline-1-line-height);
    }
    .ant-statistic-title {
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
    }
  }
`
ReportTileWrapper.displayName = 'ReportTileWrapper'

export const Tile = styled(TileIcon)<{ selected?: boolean }>`
  display: block;
  margin: auto;
  margin-top: -4px;
  opacity: ${props => props.selected ? 0.7 : 0.3};
  ${({ selected }) => selected && 'filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .3));'}
  width: 61.11px;
  height: 15px;
  cursor: pointer;
  &:hover { opacity: ${props => props.selected ? 1 : 0.5}; }
`
Tile.displayName = 'Tile'
