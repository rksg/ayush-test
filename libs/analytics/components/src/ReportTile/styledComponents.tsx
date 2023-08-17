import { Statistic } from 'antd'
import styled        from 'styled-components/macro'

import { Tile as TileIcon } from '@acx-ui/icons'

export const ReportTileWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  align-items: center;
`
ReportTileWrapper.displayName = 'ReportTileWrapper'

export const TileContent = styled(Statistic)`
  display: flex;
  flex-direction: column-reverse;
`
TileContent.displayName = 'TileContent'

export const TileWrapper = styled.div`
`
TileWrapper.displayName = 'TileWrapper'

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
