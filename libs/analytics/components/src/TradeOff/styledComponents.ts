import { Row, Divider } from 'antd'
import styled           from 'styled-components/macro'

export const TradeOffWrapper = styled.div`
  h2 {
    font-size: var(--acx-body-1-font-size);
    line-height: var(--acx-body-1-line-height);
    font-weight: var(--acx-headline-3-font-weight);
    color: var(--acx-primary-black);
    margin-bottom: 20px;
  }

  .ant-form-item-label {
    padding: 0px 0px 11px;
  }

  .ant-form-item-label > label {
    color: var(--acx-primary-black);
    line-height: var(--acx-body-3-line-height);
    font-size: var(--acx-body-3-font-size);
    font-weight: var(--acx-body-font-weight-bold);
  }
`

export const HeaderWrapper = styled(Row)`
    margin: 50px 8px 9px;
    font-size: var(--acx-subtitle-5-font-size);
    line-height: var(--acx-subtitle-5-line-height);
    font-weight: var(--acx-body-font-weight-bold);
`

export const DividerWrapper = styled(Divider)`
    padding: 0px 0px;
    margin-top: 9px !important;
    margin-bottom: 0px !important;
    border-top: 1px solid var(--acx-neutrals-30)
`


export const RowWrapper = styled(Row)`
    padding: 11px;
    transition: background-color .2s linear;
    -webkit-transition: background-color .2s linear;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-2-line-height);
    border: 1px solid transparent;
    cursor: pointer;

    &.highlight {
        background-color: var(--acx-accents-blue-10);
        border-radius: 4px;
        border: 1px solid var(--acx-accents-blue-50);
    }
`

