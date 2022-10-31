import { Checkbox, Form } from 'antd'
import styled             from 'styled-components/macro'

export const FormItemRounded = styled(Form.Item)`
	background: var(--acx-neutrals-10);
	padding: 8px;
	border-radius: 4px;
`

export const VerticalLabel = styled.div`
	padding: 5px;
	font-size: var(--acx-body-5-font-size);
	line-height: var(--acx-body-5-line-height);
`

const channelWidth = '10px'

export const CheckboxGroup = styled(Checkbox.Group)`
  .ant-checkbox-group-item{
	margin-right: 0;
  }
  .ant-checkbox-wrapper {
    position: relative;
    font-size: 10px;
    width: ${channelWidth};
    height: 46px;
    background: var(--acx-neutrals-30);
    .channels > span + span {
      padding-left: 6px;
    }
    > span {
      width: 100%;
      padding: 0;
      &:first-child {
        display: none;
      }
      &:last-child {
        position: relative;
        text-align: center;
        font-size: var(--acx-body-5-font-size);
        line-height: var(--acx-body-5-line-height);
        color: var(--acx-primary-white);
        user-select: none;
      }
    }
    &:hover {
		background: var(--acx-neutrals-40);
    }

    &.ant-checkbox-wrapper-checked {
		background:  var(--acx-accents-blue-50);
      &:hover {
        background:  var(--acx-accents-blue-60);
      }
    }

    &.ant-checkbox-wrapper-disabled:not(.ant-checkbox-wrapper-checked) {
	  background:  var(--acx-neutrals-30);
      > span:last-child {
        color: var(--acx-neutrals-30);
      }
      &:before {
        content: '';
        display: inline-block;
        position: absolute;
        border-bottom: 14px solid var(--acx-primary-white);
        width: calc(100% + 6px);
        left: -3px;
        top: 1px;
      }
    }
  }
  .ant-checkbox-wrapper:first-child {
	border-left: 1px solid var(--acx-primary-black)
  }
  .ant-checkbox-wrapper:nth-child(even) {
	border-right: 1px solid var(--acx-primary-black)
  }
  .ant-checkbox-wrapper + .ant-checkbox-wrapper{
	margin-left: 0;
  }
}
`