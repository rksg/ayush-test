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
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-6-line-height);
  > span, label {
    padding: 5px 0px;
    > span {
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
    padding-top: 7px;
    padding-bottom: 7px;
  }
  > label {
    padding: 7px;
  }
`

export const NoneField = styled.span`
  font-style: italic;
  color: var(--acx-neutrals-50);
`