import { Statistic as AntStatistic } from 'antd'
import styled                        from 'styled-components/macro'

export const Statistic = styled(AntStatistic)`
    width: 100px;   
  .ant-statistic-title {
    font-weight: 600;
    margin: 0 0 3px 0;
  }
  .ant-statistic-content-value{
    width: 100px;  
    overflow: auto;
    text-overflow: ellipsis;
  }
`
