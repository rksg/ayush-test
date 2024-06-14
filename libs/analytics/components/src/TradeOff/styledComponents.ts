import { Row, Divider } from 'antd'
import styled           from 'styled-components/macro'

export const TradeOffWrapper = styled.div`
  h2 {
    font-size: var(--acx-headline-2-font-size);
    line-height: var(--acx-headline-2-line-height);
    font-weight: var(--acx-headline-3-font-weight);
    color: var(--acx-primary-black);
  }

  .ant-form-item-label > label {
    color: var(--acx-primary-black);
    line-height: var(--acx-subtitle-4-line-height);
    font-size: var(--acx-subtitle-4-font-size);
    font-family: var(--acx-neutral-brand-font);
    font-weight: var(--acx-subtitle-4-font-weight);
  }

  .ant-radio-group {
    line-height: var(--acx-subtitle-4-line-height);
  }
`

export const HeaderWrapper = styled(Row)`
    margin: 6px 12px;
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
    font-weight: var(--acx-subtitle-4-font-weight);
`

export const DividerWrapper = styled(Divider)`
    padding: 0px 0px;
    margin-top: 6px !important;
    margin-bottom: 0px !important;
`


export const RowWrapper = styled(Row)`
    padding: 6px;
    transition: background-color .2s linear;
    -webkit-transition: background-color .2s linear;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-2-line-height);

    &.highlight {
        background: var(--acx-accents-blue-10);
        border-radius: 4px;
        border: 1px solid var(--acx-accents-blue-50);
    }
`