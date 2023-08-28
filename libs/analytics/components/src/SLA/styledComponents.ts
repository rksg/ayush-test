import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  .ant-progress {
    grid-column: 1 / span 2;
  }
`
export const Text = styled.div`
  font-size: var(--acx-body-5-font-size);
  color: var(--acx-neutrals-60);
  text-align: end;
`