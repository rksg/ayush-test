import { Col } from 'antd'
import styled  from 'styled-components/macro'

export const InsightComponent = styled.div`
  background-color: var(--acx-neutrals-20);
  border-radius: 8px;

  .ant-page-header-heading {
    border-radius: inherit;
  }

  .ant-page-header {
    border-radius: inherit;
    padding-left: 14px;
  }

  p {
    padding-top: 5px;
    margin-bottom: 7px;
  }
  ol {
    padding-left: 15px;
  }
  li {
    padding-bottom: 8px;
  }
`

export const InsightHeader = styled.div`
  display: flex;
  padding-top: 20px;
  padding-left: 25px;
  padding-bottom: 5px;
  text-align: center;
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

export const InsightIcon = styled.div`
  padding-top: 3px;
`
