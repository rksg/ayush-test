import styled from 'styled-components/macro'

export const Container = styled.div`
  width: 100%;
  height: 100%;
  .ant-form-item-label > label {
    font-size: var(--acx-body-3-font-size);
  }
`
export const TextHeader = styled.div`
  display: grid;
  grid-template-columns: auto 25% 26% 25%;
  text-align: center;
  align-items: center;
  line-height: var(--acx-body-6-line-height);
  > span, label {
    padding-bottom: 5px;
    > span {
      font-size: var(--acx-body-5-font-size);
      display: block;
    }
  }
`

export const TextNumber = styled.div`
  display: grid;
  grid-template-columns: auto 25% 26% 25%;
  border-top: 1px solid var(--acx-neutrals-30);
  > span {
    text-align: center;
    padding: 6px 0;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
  > label {
    padding: 6px;
    .ant-typography {
      font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
      margin-bottom: 0;
    }
  }
`

export const DetailsPassword = styled.span`
  .ant-input-password {
    padding: 0px;
    input { 
      font-size: var(--acx-body-4-font-size);
    }
  }
`

export const NoOnlineInfo = styled.div`
  text-align: center;
  color: var(--acx-neutrals-50);
`