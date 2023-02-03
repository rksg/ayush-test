import { css } from 'styled-components/macro'

import { blueIconStyles, greyTextStyles } from '../styledComponents'

export const wrapperStyles = css`
  .ant-input-password.ant-input-affix-wrapper-borderless {
    width: 200px;

    & > input {
      text-align: center;
    }
  }

  ${blueIconStyles}
`

export const drawerStyles = css`
  .ant-drawer-footer {
    justfy-content: flex-start;
    & > div {
      display: flex;
      flex-direction: revert;
    }
    & > div > .ant-btn + .ant-btn {
      margin: 0;
      margin-right: 12px;
    }
  }
  
  ${greyTextStyles}
`

export const passwordsGroupStyles = css`
  .ant-form-item-control .ant-form-item-explain-error:not(:first-child) {
    display: none;
  }

  .passwordGroupEndIcons {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  ${blueIconStyles}
`