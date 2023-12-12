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

export const Preview = styled.div.attrs((props: {
  $siderWidth: string, $subToolbar:boolean
}) => props)`
animation: fadeIn 0.1s linear 0s both;
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
  width: calc(100% - ${props => props.$siderWidth});
  height: calc(100vh - 116px);
  position: fixed;
  top: 60px;
  padding: 40px;
  padding-top: ${props => props.$subToolbar ? '88px' : '40px'} ;
  overflow: auto;
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
  z-index: 2;
}

.ant-btn-text {
  &:not([disabled]):hover {
    background-color: var(--acx-neutrals-20);
  }
  &:not([disabled]):active {
    color: var(--acx-primary-white);
    background-color: var(--acx-neutrals-70);
    svg {
      path {
        stroke: var(--acx-primary-white);
      }
    }
  }
  &[disabled] {
    svg {
      path {
        stroke: var(--acx-neutrals-50);
      }
    }
  }
}

@keyframes subMoveIn {
  from {top: 0px;}
  to {top: 60px;}
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
  top: ${props => props.$subToolbar ? '60px' : '0px'} ;
  padding: 8px 0 10px 0;
  background-color: var(--acx-neutrals-20);
  height: 48px;
  z-index: 1;
  &.animation {
    animation: subMoveIn 0.1s ease both;
  }
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