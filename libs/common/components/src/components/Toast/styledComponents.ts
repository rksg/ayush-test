import styled from 'styled-components/macro'

export const CloseButton = styled.div`
.anticon {
  color: var(--acx-primary-white);
  margin-right: 0;
  margin-left: 30px;
  font-size: 14px;
  cursor: pointer;
}
`

export const Toast = styled.div`
display: flex;
align-items: baseline;
font-size: var(--acx-body-3-font-size);
font-weight: 400;
.toast-style {
  width: 100%;
  display: flex;
  .toast-left-side {
    max-width: 600px;
  }
  .toast-link {
    margin-left: 60px;
    text-decoration: underline;
    color: var(--acx-primary-white);
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  p-progressSpinner {
    float: right;
    margin-left: 20px;
    margin-top: 3px;
  }
}
.toast-style.toast-countdown {
 display: flex;
 align-items: center;
 justify-content: space-between;
 .toast-left-side {
   float: none;
   width: 60%;
 }
 .close-countdown {
   color: $rw-blue-light;
   cursor: pointer;
   float: unset;
 }
 .countdown__block {
   .anticon {
     color: #fff;
     float: right;
     margin-left: 20px;
     font-size: 22px;
   }
   float: none;
   position: relative;
   p-progressSpinner {
     float: none;
     margin-left: unset;
     margin-top: unset;
   }
   .number {
     font-size: var(--acx-body-4-font-size);
     font-weight: bold;
     position: absolute;
     top: 4px;
     right: 38%;
     transform: translateX(50%);
   }
 }
}
`
