import styled from 'styled-components/macro'

import {
  Lightening,
  RuckusUpload,
  Stacking
} from '@acx-ui/icons'

export const LighteningIcon = styled(Lightening)`
  vertical-align: text-top;
  path {
    fill: currentColor;
  }
`

export const RuckusUploadIcon = styled(RuckusUpload)`
  vertical-align: text-top;
  path {
    fill: currentColor;
  }
`

export const StackingIcon = styled(Stacking)`
  vertical-align: text-top;
  path {
    fill: currentColor;
  }
`

export const GroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-height: calc( 100vh - 450px);
  min-height: 350px;

  div.ant-radio-group{
    width: 100%
  }

  label {
    display: flex;
    width: 100%;
    margin: 4px 0;
    padding: 2px;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }

  label:has(.ant-radio-checked) {
    background: var(--acx-accents-orange-20)
  }

  .ant-card{
    min-height: 320px;
    padding-left: 0;
    padding-right: 0;
  }

  .ant-radio-inner{
    display: none;
  }
`

export const Module = styled.div`
  padding-bottom: 10px;
  div.lightblue.ant-checkbox-group {
    padding-top: 10px;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 20px;
      height: 20px;
      align-items: center;
      border: 1px solid var(--acx-neutrals-60);
      background-color: white;
      margin-right: 0px;

      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper:has(.ant-checkbox-disabled)  {
      width: 20px;
      height: 20px;
      align-items: center;
      background-color: var(--acx-neutrals-15);
      border: solid 1px var(--acx-neutrals-25);
      margin-right: 0px;
    }

    > label.ant-checkbox-wrapper-checked {
      background-color: #d7f8fb;
      border: solid 1px #5de0ec;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }

    > label:nth-child(even) p {
      margin-top: 2px;
      margin-left: -2px;
      text-align: center;
    }

    > label:nth-child(odd) p {
      margin-top: -37px;
      margin-left: -2px;
      text-align: center;
    }
  }
  
  div.purple.ant-checkbox-group {
    padding-top: 10px;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 20px;
      height: 20px;
      align-items: center;
      border: 1px solid var(--acx-neutrals-60);
      background-color: white;
      margin-right: 0px;

      > span:first-child {
        display: none;
      }
    }
    
    > label.ant-checkbox-wrapper:has(.ant-checkbox-disabled)  {
      width: 20px;
      height: 20px;
      align-items: center;
      background-color: var(--acx-neutrals-15);
      border: solid 1px var(--acx-neutrals-25);
      margin-right: 0px;
    }

    > label.ant-checkbox-wrapper-checked {
      background-color: #dcc9ed;
      border: solid 1px #7025b6;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }

    > label:nth-child(even) p {
      margin-top: 2px;
      margin-left: -2px;
      text-align: center;
    }

    > label:nth-child(odd) p {
      margin-top: -37px;
      margin-left: -2px;
      text-align: center;
    }
  }

  .ant-checkbox + span {
    padding: 0;
    width: 20px;
    height: 20px;
  }
`