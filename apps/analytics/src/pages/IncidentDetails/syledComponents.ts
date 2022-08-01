import { Anchor, Col, PageHeader } from 'antd'
import styled                      from 'styled-components/macro'

export const LeftColumn = styled(Anchor)`
  min-width: 200px;
  max-width: 300px;
  width: 100%;
  padding-right: 10px;

  .ant-anchor {
    font-weight: var(--acx-body-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);

    .ant-anchor-ink {
      visibility: hidden;
    }
  }
`

export const InsightComponent = styled.div`
  background-color: var(--acx-neutrals-20);
  border-radius: 8px;

  .ant-page-header-heading {
    // background-color: var(--acx-neutrals-20);
    border-radius: inherit;
  }

  .ant-page-header {
    border-radius: inherit;
    padding-left: 14px;
  }
`

export const InsightHeader = styled(PageHeader)`
  .ant-page-header-heading {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
`

export const InsightDetails = styled(Col)`
  padding: 12px;
`
