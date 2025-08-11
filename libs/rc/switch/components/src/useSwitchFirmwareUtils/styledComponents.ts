import { Statistic as AntStatistic, Space, Tag } from 'antd'
import styled                                    from 'styled-components/macro'

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

export const DowngradeTag = styled(Tag)`
    color: var(--acx-accents-blue-50);
    border-color: var(--acx-accents-blue-50);
    background-color: var(--acx-accents-blue-10);
    border-radius: 10px;
    font-size: 12px;
    height: 20px;
`
export const RecommendedTag = styled(Tag)`
    color: var(--acx-semantics-yellow-70);
    border-color: var(--acx-semantics-yellow-40);
    background-color: #FFFBF1;
    border-radius: 10px;
    font-size: 12px;
    height: 20px;
`

export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    color: inherit;
    background-color: currentColor;
  }
`
