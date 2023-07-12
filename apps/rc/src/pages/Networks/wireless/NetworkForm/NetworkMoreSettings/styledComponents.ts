import { Form, Radio } from 'antd'
import styled          from 'styled-components/macro'

import { Subtitle }         from '@acx-ui/components'
import { InformationSolid } from '@acx-ui/icons'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
`

export const FormItemNoLabel = styled(Form.Item)`
  margin-bottom: 5px;
`
export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
`
export const RadioSwitch = styled(Radio.Group)`
  border-radius: 0.5rem;
  justify-content: left;
  flex-direction: row;
`

export const LabelOfInput = styled.span`
    font-size: var(--acx-body-4-font-size);
    line-height: 32px;
    color: var(--acx-neutrals-60);
    margin: 22px 0px 10px;
    position: relative;
    left: 80px;
    word-wrap: normal;
`

export const RateLimitBlock = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      width: 50px;
    }
`

const CustomSubtitle = styled(Subtitle).attrs({ level: 4 })`
  margin-block-end: 12px;
`

export { CustomSubtitle as Subtitle }

export const InfoIcon = styled(InformationSolid)`
path {
  fill: var(--acx-neutrals-50);
  stroke: var(--acx-primary-white) !important;
}
margin-left: 0px !important;
display: block;
`

export const Description = styled.span`
color: var(--acx-neutrals-50);
font-size: var(--acx-body-4-font-size);
`
