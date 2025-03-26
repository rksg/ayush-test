import { Typography, Steps as AntSteps, Space, Alert as AntAlert, AlertProps } from 'antd'
import styled, { css }                                                         from 'styled-components/macro'

import modifyVars                     from '../../theme/modify-vars'
import { Subtitle as CommonSubtitle } from '../Subtitle'
import { disableStickyPagination }    from '../Table/styledComponents'

export const Wrapper = styled.section`
  --acx-steps-form-steps-title-color: var(--acx-primary-black);
  --acx-steps-form-steps-title-font-size: var(--acx-body-4-font-size);
  --acx-steps-form-steps-title-line-height: var(--acx-body-4-line-height);
  --acx-steps-form-steps-active-title-font-weight: var(--acx-body-font-weight-bold);
  --acx-steps-form-steps-step-size: 12px;
  --acx-steps-form-steps-step-color: var(--acx-accents-orange-50);

  --acx-steps-form-form-title-font-size: var(--acx-headline-3-font-size);
  --acx-steps-form-form-title-font-weight: var(--acx-headline-3-font-weight);
  --acx-steps-form-form-title-line-height: var(--acx-headline-3-line-height);
  --acx-steps-form-form-title-margin-bottom: 16px;

  padding-block-end: calc(var(--acx-steps-form-actions-vertical-space) * 2 + 32px);

  ${disableStickyPagination}
`

const stepCompletedStyle = css<{ $editMode?: boolean }>`
  .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon-dot {
    &::after {
      top: 1px;
      left: 1px;
      ${props => !props.$editMode ? css`
        background-color: var(--acx-steps-form-steps-step-color);
      ` : css`
        background-color: transparent;
      `}
    }
  }
`

export const Steps = styled(AntSteps)<{ $editMode?: boolean }>`
  position: fixed;
  // col span=4/24, gutter=20px
  width: calc((
    (100% + 20px)
    - var(--acx-sider-width)
    - var(--acx-content-horizontal-space) * 2
  ) * 4 / 24 - 20px);
  min-width: calc((
    (${modifyVars['@screen-xl']} + 20px)
    - var(--acx-sider-width)
    - var(--acx-content-horizontal-space) * 2
  ) * 4 / 24 - 20px);
  padding-top: calc(
    var(--acx-steps-form-form-title-line-height) +
    var(--acx-steps-form-form-title-margin-bottom) +
    3px
  );

  &.ant-steps-vertical {
    .ant-steps-item {
      .ant-steps-item-title {
        padding: 0 0 var(--acx-steps-form-steps-title-line-height) 12px;
        line-height: var(--acx-steps-form-steps-title-line-height);
        font-size: var(--acx-steps-form-steps-title-font-size);
      }
      &.ant-steps-item-active .ant-steps-item-title {
        font-weight: var(--acx-steps-form-steps-active-title-font-weight);
      }
      .ant-steps-item-title,
      &.ant-steps-item-wait .ant-steps-item-title {
        color: var(--acx-steps-form-steps-title-color);
      }

      .ant-steps-item-container {
        .ant-steps-item-tail {
          top: 3px;
          left: unset;
          width: var(--acx-steps-form-steps-step-size);
          padding: 11px 0 0;

          &::after {
            margin: 0 auto;
            display: block;
            ${props => !props.$editMode ? css`
              background-color: var(--acx-steps-form-steps-step-color);
            ` : css`
              display: none;
            `}
          }
        }

        .ant-steps-item-content {
          min-height: calc(var(--acx-body-4-line-height) * 2);
        }
      }

      .ant-steps-item-icon {
        width: var(--acx-steps-form-steps-step-size);
        height: var(--acx-steps-form-steps-step-size);
        top: unset;
        margin-top: 3px;
        margin-right: 0px;

        .ant-steps-icon-dot {
          width: var(--acx-steps-form-steps-step-size);
          height: var(--acx-steps-form-steps-step-size);
          border: 1px solid var(--acx-steps-form-steps-step-color);
          background-color: transparent;
          top: unset;
          left: unset;

          &::after {
            top: 0;
            left: 0;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: transparent;
            transition-property: top, left, background-color;
          }
        }
      }
      &.ant-steps-item-active .ant-steps-item-icon .ant-steps-icon-dot {
        top: unset;
        left: unset;
        &::after {
          width: 10px;
          height: 10px;
          background-color: var(--acx-steps-form-steps-step-color);
        }
      }
      &.ant-steps-item-finish {
        ${stepCompletedStyle}
      }
      ${props => props.$editMode ? css`
        &.ant-steps-item-wait  {
          ${stepCompletedStyle}
        }
      ` : ''}
    }
  }
`
export const ActionsContainer = styled.div`
  position: fixed;
  width: calc(
    100%
    - var(--acx-sider-width)
    - var(--acx-content-horizontal-space) * 2
  );
  min-width: calc(
    ${modifyVars['@screen-xl']}
    - var(--acx-sider-width)
    - var(--acx-content-horizontal-space) * 2
  );
  bottom: 0;
  padding: var(--acx-steps-form-actions-vertical-space) 0;
  background-color: var(--acx-neutrals-10);
  z-index: 5;
  &::before {
    content: '';
    position: absolute;
    inset: 0 -100% 0 -100%;
    background-color: var(--acx-neutrals-10);
  }
  .ant-space-item .ant-space {
    position: absolute;
    left: 50%;
    bottom: var(--acx-steps-form-actions-vertical-space);
    transform: translate(-50%, 0);
  }
`
interface ActionsButtonsProps {
  $editMode: boolean
  $multipleSteps: boolean
}
export const ActionsButtons = styled(Space).attrs((props: ActionsButtonsProps) => ({
  size: 12,
  align: props.$editMode ? 'start' : 'center'
}))<ActionsButtonsProps>`
  ${props => props.$editMode && props.$multipleSteps && `
    margin-left: 0;
  `}
`

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  font-size: var(--acx-steps-form-form-title-font-size);
  line-height: var(--acx-steps-form-form-title-line-height);
  font-weight: var(--acx-steps-form-form-title-font-weight);
  margin-bottom: var(--acx-steps-form-form-title-margin-bottom) !important;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  svg {
    width: 16px;
    height: 16px;
  }
`

export const Subtitle = styled(CommonSubtitle).attrs({ level: 4 })`
  &.ant-typography {
    margin-top: 20px;
    margin-bottom: 12px;
  }
  ${Title} + &.ant-typography {
    margin-top: 4px;
  }
`

export const SectionTitle = styled(CommonSubtitle).attrs({ level: 3 })`
  &.ant-typography {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--acx-neutrals-30);
    margin-bottom: 32px;
  }
`

export const FieldLabel = styled.label<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`


export const MultiSelect = styled.div`
  div.ant-checkbox-group {
    display: flex;
    > label.ant-checkbox-wrapper {
      font-size: 12px;
      align-items: center;
      margin: 0 3px;
      width: auto;
      padding: 4px 12px;
      border: 1px solid var(--acx-primary-black);
      border-radius: 4px;
      background-color: white;

      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper-checked {
      border: 1px solid var(--acx-primary-black);
      border-radius: 4px;
      background-color: var(--acx-primary-black);
      color: white;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }
  }
`
export const AlertContainer = styled(AntAlert)<{ type: AlertProps['type'] }>`
position: fixed;
width: calc(
  100%
  - var(--acx-sider-width)
  - var(--acx-content-horizontal-space) * 2
);
min-width: calc(
  ${modifyVars['@screen-xl']}
  - var(--acx-sider-width)
  - var(--acx-content-horizontal-space) * 2
);
bottom: calc(
  32px
  + var(--acx-steps-form-actions-vertical-space) * 2
);
padding: 10px 0;
&.ant-alert {
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  border: none;
  svg {
    font-size: var(--acx-body-3-font-size);
    display: block;
  }
  .ant-btn {
    font-size: var(--acx-body-4-font-size);
  }
}
background-color: var(--acx-neutrals-10);
&.ant-alert.ant-alert-success, &.ant-alert.ant-alert-success::before {
  background-color: var(--acx-semantics-green-10);
}
&.ant-alert.ant-alert-info, &.ant-alert.ant-alert-info::before {
  background-color: var(--acx-accents-orange-10);
}
&.ant-alert.ant-alert-warning, &.ant-alert.ant-alert-warning::before {
  background-color: #fffbe6;
}
&.ant-alert.ant-alert-error, &.ant-alert.ant-alert-error::before {
  background-color: var(--acx-semantics-red-10);
}
z-index: 5;
&::before {
  content: '';
  position: absolute;
  inset: 0 -100% 0 -100%;
  background-color: var(--acx-neutrals-10);
}

& > .ant-alert-content {
  z-index: 1;
}
`

export const greyTextStyles = css`
  .greyText {
    color: var(--acx-neutrals-50);
  }
`

export const TextContent = styled.div`
  &, .ant-list {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    font-weight: var(--acx-body-font-weight);
  }

  & .ant-checkbox-wrapper-in-form-item {
    color: var(--acx-neutrals-60);
  }

  & .indent {
    margin-left: 24px;
    flex-wrap: wrap;
    align-content: flex-start;
  }

  ${greyTextStyles}
`

export const ChartContent = styled.div`
  margin-top: 40px;
`
