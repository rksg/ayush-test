import styled from 'styled-components/macro'

export const FormLabel = styled.div`
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-control {
    display: none;
  }
  .ant-form-item-label {
    padding-bottom: 0;
  }
`

export const FormChildren = styled.div`
  .ant-form-item-control-input {
    min-height: auto;
  }
  .ant-form-item-control-input-content div{
    margin-top: 3px
  }
`
