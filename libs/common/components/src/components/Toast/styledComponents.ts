import styled from 'styled-components/macro'

export const Toast = styled.div`
  display: flex;
  align-items: baseline;
  font-size: var(--acx-body-3-font-size);
  font-weight: 400;
`

export const Content = styled.div`
  display: flex;
  align-items: center;
`

export const Link = styled.button`
  line-height: 1;
  margin-left: 60px;
  text-decoration: underline;
  color: var(--acx-primary-white);
  background-color: transparent;
  border: none;
  cursor: pointer;
`

export const CloseButton = styled.div`
  .anticon {
    color: var(--acx-primary-white);
    margin-right: 0;
    margin-left: 30px;
    font-size: 14px;
    cursor: pointer;
  }
`
