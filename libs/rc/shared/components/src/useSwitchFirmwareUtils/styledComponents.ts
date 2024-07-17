import { Statistic as AntStatistic } from 'antd'
import styled                        from 'styled-components/macro'

export const Statistic = styled(AntStatistic) <{
  width: number,
  contentValueWidthToDeduct: number
}>`
    width: ${props => `${props.width}px`};
  .ant-statistic-title {
    font-weight: 600;
    margin: 0 0 3px 0;
  }
  .ant-statistic-content-value{
    width: ${props => `${props.width - props.contentValueWidthToDeduct}px`};
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
