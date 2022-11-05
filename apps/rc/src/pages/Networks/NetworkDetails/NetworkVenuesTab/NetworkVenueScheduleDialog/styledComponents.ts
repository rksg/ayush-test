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
  .ant-checkbox-wrapper:first-child {
	  border-left: 1px solid var(--acx-neutrals-60)
  }
  .ant-checkbox-wrapper:nth-child(even) {
	  border-right: 1px solid var(--acx-neutrals-50)
  }
  .ant-checkbox-wrapper-checked:nth-child(even) {
	  border-right: 1px solid var(--acx-neutrals-60)
  }
  .ant-checkbox-wrapper:nth-child(4n) {
	  border-right: 1px solid var(--acx-neutrals-60)
  }
  .ant-checkbox-wrapper + .ant-checkbox-wrapper{
	  margin-left: 0;
  }
  .ant-checkbox-wrapper {
    position: relative;
    font-size: 10px;
    width: ${channelWidth};
    height: 32px;
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

    &.ant-checkbox-wrapper-disabled:hover {
		  background: var(--acx-neutrals-40);
    }

    &:hover {
		  background: var(--acx-accents-blue-60);
    }

    &.ant-checkbox-wrapper-checked:not(.ant-checkbox-wrapper-disabled) {
		  background:  var(--acx-accents-blue-50);
      &:hover {
        background:  var(--acx-accents-blue-60);
      }
    }

    &.ant-checkbox-wrapper-disabled {
	    background:  var(--acx-neutrals-20);
      &:before {
        background:  var(--acx-neutrals-20);
      }
    }
  }
}
`

export const Timetick = styled.div`
  width: 40px;
  height: 15px;
  float: left;
  font-size: 9px;
  &:first-child {
	  width: 45px;
  }
`

export const Timetickborder = styled.div`
  width: 20px;
  height: 5px;
  float: left;
  border-left: 1px solid var(--acx-neutrals-60);
  &:first-child {
	  width: 19px;
  }
`

export const Section = styled.section`
  header {
    transform-style: preserve-3d;
    font-size: 0;

    li {
      font-size: 10px;
      overflow: visible;
      width: 0;
      display: inline-block;
      position: relative;

      .time-label {
        display: block;
        position: absolute;
        left: 0;
        font-size: 12px;
        color: #babbbd;
        transform: translateX(-100%);
      }

      &:first-child span div {
        position: absolute;
        left: -21px;
      }

      &:not(:last-of-type) {
        width: 40px;
      }
    }
  }
`