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
border-top: 75px solid rgba(255,255,255, 0.4);

.chat {
  position: fixed;
  width: 45%;
  top: 60px;
  z-index: 2;
  .header {
    border: 1px solid #E5E5E5;
    border-right: 0px;
    background-color: var(--acx-primary-white);
    height: 60px;
    padding: 15px 25px;
    display: flex;
    justify-content: space-between;
    .title{
      svg {
        margin-right: 10px;
       }
       padding: 5px;
       font-family: var(--acx-accent-brand-font);
       font-weight: var(--acx-headline-3-font-weight);
       font-size: var(--acx-headline-3-font-size);
    }
    .actions{
      button {
        margin-left: 15px;
      }
    }
  }
  .content {
    background-color: #fefefe;
    height: calc(100vh - 120px);
    width: 45%;
    position: fixed;
    top: 120px;
    padding: 40px;
    overflow: auto;
  }
}

.canvas {
  position: fixed;
  width: 55%;
  top: 60px;
  z-index: 2;
  left: 45%;
  .header {
    border: 1px solid #E5E5E5;
    background-color: var(--acx-primary-white);
    height: 60px;
    display: flex;
    justify-content: space-between;
    padding: 15px 25px;
    .title{
       padding: 5px;
       font-family: var(--acx-accent-brand-font);
       font-weight: 500;
       font-size: var(--acx-headline-4-font-size);
    }
    .actions{
      button {
        margin-left: 15px;
        &.black{
          background-color: var(--acx-primary-black);
          color: var(--acx-primary-white);
        }
      }
    }
  }
}

.modal-content {
  background-color: #fefefe;
  width: 100%;
  height: calc(100vh - 120px);
  position: fixed;
  top: 120px;
  padding: 40px;
  padding-top: 40px;
  overflow: auto;
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

`