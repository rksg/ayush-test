import { Statistic as AntStatistic } from 'antd'
import styled                        from 'styled-components/macro'

export const Title = styled.div`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  font-weight: var(--acx-headline-5-font-weight-bold);
  margin-bottom: 10px;
`

export const Statistic = styled(AntStatistic)`
  display: flex;
  flex-direction: column-reverse;
  .ant-statistic-title {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
  .ant-statistic-content{
    display: flex;
    align-items: center;
  }
  .ant-statistic-content-value {
    font-size: 28px;
    font-weight: var(--acx-body-font-weight-bold);
  }
}
`
