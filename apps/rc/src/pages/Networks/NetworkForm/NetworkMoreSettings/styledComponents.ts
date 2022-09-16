import { Form, Collapse } from 'antd'
import styled             from 'styled-components/macro'

import { Subtitle } from '@acx-ui/components'

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

export const CollpasePanel = styled(Collapse)`
  &.ant-collapse-icon-position-end
    > .ant-collapse-item {
      > .ant-collapse-header {
        border-bottom: 1px solid var(--acx-neutrals-20);
        padding: 15px 0px 5px 0px;
        font-size: var(--acx-body-2-font-size);
        font-weight: 600;
        fontFamily: cssStr('--acx-neutral-brand-font');
      }
      & .ant-collapse-arrow {
        right: 10px;
        top: 65%;
      }
    }

   &.ant-collapse-ghost
     > .ant-collapse-item
       > .ant-collapse-content
         > .ant-collapse-content-box {
           padding-left: 85px;
         }
`

export const LabelOfInput = styled.span`
    font-size: var(--acx-body-4-font-size);
    line-height: 32px;
    color: var(--acx-neutrals-60);
    margin: 22px 0px 10px;
    position: relative;
    left: 80px;
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
