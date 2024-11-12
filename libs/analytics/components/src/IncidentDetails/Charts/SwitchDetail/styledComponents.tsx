import { Statistic as AntStatistic } from 'antd'
import styled                        from 'styled-components/macro'

export const DetailsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  column-gap: 30px;
`

export const Image = styled.img`
  padding: 10px;
  width: 100%;
  grid-column: 1;
  grid-row: 1 / 3;
`

export const Statistic = styled(AntStatistic)`
  .ant-statistic-title {
    display: flex;
    font-weight: var(--acx-body-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    color: var(--acx-neutrals-70);
  }
  .ant-statistic-content {
    font-weight: var(--acx-subtitle-2-font-weight);
    font-size: var(--acx-subtitle-2-font-size);
    line-height: var(--acx-subtitle-2-line-height);
    color: var(--acx-primary-black);

    .ant-statistic-content-prefix {
      width: 100%;
    }
    .ant-statistic-content-value {
      display: ${(props) => props.value === undefined ? 'none' : 'block'};
    }
  }
`
