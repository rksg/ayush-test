import { Statistic as AntStatistic } from 'antd'
import styled                        from 'styled-components/macro'

export const Statistic = styled(AntStatistic)<{ width: string }>`
    width: ${props => props.width};
  .ant-statistic-title {
    font-weight: 600;
    margin: 0 0 3px 0;
  }
  .ant-statistic-content-value{
    width: ${props => props.width};
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
