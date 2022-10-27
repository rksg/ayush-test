import { Modal as AntModal } from 'antd'
import styled                from 'styled-components/macro'

export const Modal = styled(AntModal)`
  .ant-modal-content {
    border-radius: 12px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  .ant-modal-header {
    border-radius: inherit;
    .ant-modal-title {
      font-family: var(--acx-accent-brand-font);
      font-size: var(--acx-headline-2-font-size);
      font-weight: var(--acx-headline-2-font-weight);
      line-height: var(--acx-headline-2-line-height);
    }
  }
  .ant-modal-body {
    padding-top: 0;
    flex: 1;
    overflow-y: scroll;

    .ant-tabs > .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
      padding-top: 5px;
    }
  }
  .ant-modal-footer {
    border-radius: inherit;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    .ant-btn + .ant-btn:not(.ant-dropdown-trigger) {
      margin-left: 12px;
    }
  }
  .ant-modal-close-x {
    padding-top: 3px;
  }
`

export const SubTitleWrapper = styled.div`
  grid-area: sub-title;
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: var(--acx-body-4-line-height);
  height: var(--acx-body-4-line-height);
  color:  var(--acx-neutrals-60);
  padding-top: 4px;
`
