import styled from 'styled-components/macro'

export const GroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-height: calc( 100vh - 450px);
  min-height: 350px;
  label {
    display: flex;
    margin: 4px 0;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }
  .ant-card{
    min-height: 320px;
  }
`