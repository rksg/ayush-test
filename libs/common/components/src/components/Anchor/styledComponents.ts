import { Anchor as AntAnchor } from 'antd'
import styled                  from 'styled-components/macro'

export const Anchor = styled(AntAnchor)`
  .ant-anchor-ink {
    display: none;
  }
  .ant-anchor-link {
    padding: 0;
    .ant-anchor-link {
      padding-left: 16px;
    }
  }
  .ant-anchor-link-title {
    width: fit-content;
    font-size: var(--acx-body-4-font-size);
    padding: 2px 8px;
    margin: 4px 0;
    background: var(--acx-accents-blue-10);
    border: 1px solid var(--acx-accents-blue-10);
    border-radius: 12px;
    color: var(--acx-accents-blue-50);
    &:hover, &-active {
      border: 1px solid var(--acx-accents-blue-20);
      color: var(--acx-accents-blue-60);
    }
  }
`

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 135px auto;
`

export const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  .section {
    min-height: 100%;
  }
`
