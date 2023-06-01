import styled, { css } from 'styled-components/macro'

export const InfoMargin = styled.div`
  margin: 10px 10px;
`
export const InstancesMargin = styled.div`
  margin: 10px 0px;
`

export const WrapperStyle = css`
  .ant-tabs.ant-tabs-top {
    position: relative;
  }
`
export const ActionsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  & div:not(:first-child) {
    margin-left: var(--acx-modal-footer-small-button-space);
  }
`