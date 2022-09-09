import styled from 'styled-components/macro'

export const CustomTable = styled.div`
.ant-pro-table {
  .ant-table {
    &-tbody > tr > td {
      padding-top: 10px;
      padding-bottom: 10px;
      span {
        color: var(--acx-accents-blue-50);
        cursor: pointer;
        transition: color 0.3s;
        &:hover { 
          color: var(--acx-accents-orange-50);
        }
      }
    }
  }
}
`
