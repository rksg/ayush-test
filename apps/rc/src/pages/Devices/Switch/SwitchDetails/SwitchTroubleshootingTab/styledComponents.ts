import styled from 'styled-components/macro'

export const ResultContainer = styled.div`
  border: 1px solid var(--acx-neutrals-50);
  border-radius: 4px;
  height: 300px;
  margin-bottom: 5px;
  
  .ant-pro-table {
    margin: 20px;
  }
  
  .report {
    font-size: var(--acx-body-4-font-size);
    margin-left: 20px;
    .title {
      font-weight: var(--acx-body-font-weight-bold);
      padding-right: 5px;
    }
  }
}
`
