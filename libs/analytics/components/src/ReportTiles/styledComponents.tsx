import styled from 'styled-components/macro'

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

export const Tile = styled.div.attrs({ 'data-testid': 'Tile' })<{ selected?: boolean }>`
  display: block;
  margin: auto;
  margin-top: -4px;
  background-color: #35b1ff;
  transform: skew(-56deg);
  opacity: ${props => props.selected ? 0.7 : 0.3};
  ${({ selected }) => selected && 'box-shadow: 7px 4px 3px rgba(0, 0, 0, .3);'}
  width: 39px;
  height: 15px;
  cursor: pointer;
  &:hover { opacity: ${props => props.selected ? 1 : 0.5}; }
`
Tile.displayName = 'Tile'
