import styled, { css } from 'styled-components/macro'

export const Row = styled.div`
  ${props => props.onClick
    ? css`
      text-decoration-line: underline;
      text-decoration-style: dotted;
      cursor: pointer;`
    : ''}
`

export const Wrapper = styled.div`
  .ant-descriptions-row > th{
    padding-bottom: 0;
  }
  .ant-descriptions-item-label{
    color: var(--acx-neutrals-50);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
  .ant-descriptions-item-content{
    color: var(--acx-primary-black);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
`