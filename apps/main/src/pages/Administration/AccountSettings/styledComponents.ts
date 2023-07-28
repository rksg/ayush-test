import { css } from 'styled-components/macro'

export const greyTextStyles = css`
  .greyText {
    color: var(--acx-neutrals-50)
  }
`

export const darkGreyTextStyles = css`
  .darkGreyText {
    color: var(--acx-neutrals-70)
  }
`

export const checkboxStyles = css`
  input[type=checkbox] {
    padding-right: 5px;
  }
`

export const blueIconStyles = css`
  span[role="img"].anticon {
    color: var(--acx-accents-blue-50);
  }
`

export const styles = css`
  & .ant-list-item {
    padding: 0;
  }

  & .ant-select.ant-select-in-form-item {
    width: 200px;
  }

  & .ant-checkbox-wrapper-in-form-item {
    color: var(--acx-neutrals-60)
  }

  & .description {
    font-size: var(--acx-body-4-font-size);
  }

  & .descriptionsWrapper {
    margin-left: 24px;
    flex-wrap: wrap;
    align-content: flex-start;
  }

  .ant-divider {
    margin: 4px 0px 20px;
    background: var(--acx-neutrals-30);
  }
    
  ${checkboxStyles}
  ${greyTextStyles}
  ${darkGreyTextStyles}
`

