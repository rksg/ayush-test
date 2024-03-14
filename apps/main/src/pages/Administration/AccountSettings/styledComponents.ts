import { css } from 'styled-components/macro'

import { StepsForm } from '@acx-ui/components'

export const greyTextStyles = StepsForm.DescriptionTextWrapper

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

  ${StepsForm.DescriptionWrapper}
  ${checkboxStyles}
  ${darkGreyTextStyles}
`

