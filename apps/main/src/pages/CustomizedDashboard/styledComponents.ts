import styled from 'styled-components/macro'

import { ArrowChevronRight } from '@acx-ui/icons'

export const ArrowChevronRightIcons = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  path {
    stroke: var(--acx-accents-blue-50);
  }
`
export const Wrapper = styled.div`
  &:hover {
    path {
      stroke: var(--acx-accents-blue-60);
    }
  }
`
export const MenuExpandArrow = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  margin: 0.3em;
`

export const Preview = styled.div.attrs((props: { $siderWidth: string }) => props)`
position: fixed; /* Stay in place */
z-index: 101; /* Sit on top */
padding-top: 100px; /* Location of the box */
left: 0;
top: 0;
width: 100%; /* Full width */
height: 100%; /* Full height */
overflow: auto; /* Enable scroll if needed */
background-color: transparent;
border-left: ${props => props.$siderWidth} solid rgba(255,255,255, 0.4);
border-top: 75px solid rgba(255,255,255, 0.4);

.modal-content {
  background-color: #fefefe;
  width: 100%;
  height: calc(100vh - 116px);
  position: fixed;
  top: 108px;
}

.toolbar {
  position: fixed;
  width: calc(
    100%
    - ${props => props.$siderWidth}
  );
  min-width: calc(
    1280
    - ${props => props.$siderWidth}
    - var(--acx-content-horizontal-space) * 2
  );
  top: 0;
  padding: 14px 0;
  background-color: var(--acx-neutrals-10);
  height: 60px;
}

.ant-btn-text {
  &:not([disabled]):hover {
    background-color: var(--acx-neutrals-20);
  }
  svg {
    path {
      stroke-width: 0;
    }
  }
  &:not([disabled]):active {
    color: var(--acx-primary-white);
    background-color: var(--acx-neutrals-70);
    svg {
      path {
        fill: var(--acx-primary-white);
      }
    }
  }
  &[disabled] {
    svg {
      path {
        fill: var(--acx-neutrals-50);
      }
    }
  }
}

.sub-toolbar {
  position: fixed;
  width: calc(
    100%
    - ${props => props.$siderWidth}
  );
  min-width: calc(
    1280
    - ${props => props.$siderWidth}
    - var(--acx-content-horizontal-space) * 2
  );
  top: 60px;
  padding: 10px 0;
  background-color: var(--acx-neutrals-20);
  height: 48px;
}

.actions {
  position: fixed;
  width: calc(
    100%
    - ${props => props.$siderWidth}
  );
  min-width: calc(
    1280
    - ${props => props.$siderWidth}
    - var(--acx-content-horizontal-space) * 2
  );
  bottom: 0;
  padding: 12px 0;
  background-color: var(--acx-neutrals-10);
  z-index: 5;
  &::before {
    content: '';
    position: absolute;
    inset: 0 -100% 0 -100%;
  }
  .ant-space-item .ant-space {
    position: absolute;
    left: 50%;
    bottom: var(--acx-steps-form-actions-vertical-space);
    transform: translate(-50%, 0);
  }
}

`