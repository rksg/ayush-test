import styled from 'styled-components/macro'

export const CloseButton = styled.div`
.anticon {
  color: var(--acx-primary-white);
  margin-right: 0;
  margin-left: 30px;
  font-size: 14px;
  cursor: pointer;
}
`

export const Toast = styled.div`
display: flex;
align-items: baseline;
font-size: var(--acx-body-3-font-size);
font-weight: 400;
.toast-style {
  width: 100%;
  display: flex;
  .toast-link {
    line-height: 1;
    margin-left: 60px;
    text-decoration: underline;
    color: var(--acx-primary-white);
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  &.toast-countdown {
    align-items: center;
    .countdown-block {
      .anticon {
        color: #fff;
        margin-left: 20px;
        font-size: 22px;
      }
      position: relative;
      .number {
        font-size: var(--acx-body-4-font-size);
        font-weight: 700;
        position: absolute;
        top: 4px;
        right: 38%;
        transform: translateX(50%);
      }
    }
  }
}
`
