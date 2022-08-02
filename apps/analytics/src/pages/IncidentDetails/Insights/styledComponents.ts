import { Col } from 'antd'
import styled  from 'styled-components/macro'

export const InsightComponent = styled.div`
  background-color: var(--acx-neutrals-10);
  border-radius: 8px;

  ol {
    padding-left: 15px;
  }
`

export const InsightHeader = styled.div`
  display: flex;
  padding-top: 20px;
  padding-left: 20px;
`

export const LeftInsightDetails = styled(Col)`
  padding-left: 25px;
`

export const RightInsightDetails = styled(Col)`
  padding-right: 20px;
`

export const InsightTitle = styled.div`
  padding-left: 5px;
`
