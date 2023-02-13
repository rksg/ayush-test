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

export const Module = styled.div`
  div.ant-checkbox-group {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 18px;
      height: 18px;
      align-items: center;
      border: 1px solid var(--acx-primary-black);
      background-color: white;
      margin-right: 0px;
      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper-checked {
      border: 1px solid var(--acx-primary-black);
      background-color: var(--acx-primary-black);
      color: white;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }
  }
  .ant-checkbox + span {
    padding: 0;
  }
`