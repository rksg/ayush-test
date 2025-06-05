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
const channelChildEven = `
  .ant-checkbox-wrapper:nth-child(even) {
	  border-right: 1px solid var(--acx-neutrals-40)
  }
  .ant-checkbox-wrapper-checked:nth-child(even) {
	  border-right: 1px solid var(--acx-neutrals-60)
  }
`
const channelChildUnit60 = `
  .ant-checkbox-wrapper {
	  border-right: 1px solid var(--acx-neutrals-60)
  }
  .ant-checkbox-wrapper-checked {
	  border-right: 1px solid var(--acx-neutrals-60)
  }
`

export const CheckboxGroup = styled(Checkbox.Group)<{ intervalunit: number, slotWidth: number }>`
${(props) => `
  .ant-checkbox-group-item{
	  margin-right: 0;
  }
  .ant-checkbox-wrapper:first-child {
	  border-left: 1px solid var(--acx-neutrals-60)
  }
  ${props.intervalunit===15?channelChildEven:channelChildUnit60}
  .ant-checkbox-wrapper:nth-child(4n) {
	  border-right: 1px solid var(--acx-neutrals-60)
  }
  .ant-checkbox-wrapper + .ant-checkbox-wrapper{
	  margin-left: 0;
  }
  .ant-checkbox-wrapper {
    position: relative;
    font-size: 10px;
    width: ${props.intervalunit===15?channelWidth:`${props.slotWidth}px`};
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

    &.ant-checkbox-wrapper-disabled {
	    background:  var(--acx-neutrals-20);
      &:before {
        background:  var(--acx-neutrals-20);
      }
    }

    &.ant-checkbox-wrapper-checked {
		  background:  var(--acx-accents-blue-50);
      &:hover {
        background:  var(--acx-accents-blue-60);
      }
    }
  }
}
`}`

export const DayCheckbox = styled(Checkbox)`
  .ant-checkbox-inner{
    background-color: var(--acx-accents-blue-50);
  }
`

const timeTickWidth = '80px'
const marginLeftChildSecond = `
  &:nth-child(2) {
    margin-left: 13px;
  }
  &:last-child {
    width: 60px;
  }
`

const marginLeftChildSecondUnit60 = `
  &:nth-child(2) {
    margin-left: 16px;
  }
  &:last-child {
    width: 20px;
  }
`

export const Timetick = styled.div<{ intervalunit: number, slotWidth: number }>`
${(props) => `
  width: ${props.intervalunit===15?timeTickWidth:`${(props.slotWidth*3)}px`};
  height: 15px;
  color: var(--acx-neutrals-60);
  float: left;
  font-size: 12px;
  ${props.intervalunit===15?marginLeftChildSecond:marginLeftChildSecondUnit60}
`}`

export const LocalTimeZone = styled.div`
width: 100%;
height: 15px;
color: var(--acx-neutrals-60);
margin-left: 160px;
font-size: 12px;
`

const timetickborderWidth = '20px'
const timetickborderWidthUnit60 = '40px'

export const Timetickborder = styled.div<{ intervalunit: number }>`
${(props) => `
  width: ${props.intervalunit===15?timetickborderWidth:timetickborderWidthUnit60};
  height: 5px;
  float: left;
  border-left: 1px solid var(--acx-neutrals-60);
  &:first-child {
	  width: 19px;
  }
`}`

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

export const TitleSpan = styled.span`
  color: var(--acx-neutrals-60);
`

export const DaySpan = styled.span`
  text-transform: capitalize;
`

export const TipSpan = styled.span`
  margin-top: -2px;
  margin-left: 20px;
`
