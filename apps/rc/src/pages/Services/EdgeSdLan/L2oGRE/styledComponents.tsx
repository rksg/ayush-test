import { Col, Descriptions, Form, Row, Space, Typography } from 'antd'
import styled                                              from 'styled-components/macro'

import { Tooltip }            from '@acx-ui/components'
import { WarningCircleSolid } from '@acx-ui/icons'

export const Wrapper = styled(Row)`
  margin-top: 30px;
`

export const FieldText = styled.div`
  font-size: var(--acx-body-4-font-size);
`
export const ClusterSelectorHelper = styled(FieldText)`
  & svg {
    vertical-align: sub;
  }
`

export const VerticalSplitLine = styled(Col)`
  margin: auto 0;
  height: 350px;
  border-left: 1px solid var(--acx-neutrals-30);
`

export const WarningCircleRed = styled(WarningCircleSolid)`
  path:nth-child(2) {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
`

export const ValidationMessageField = styled(Form.Item)`
  text-wrap: auto;
  margin-bottom: 0px !important;
  .ant-form-item-control-input {
    display: none;
  }
`

export const StyledAntdDescriptions = styled(Descriptions)`
  .ant-descriptions-view .ant-descriptions-item-container {
      .ant-descriptions-item-label,
      .ant-descriptions-item-content {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
      }
  }

  .ant-descriptions-item-container .ant-descriptions-item-label {
    color: var(--acx-neutrals-90);
  }

  .ant-descriptions-item-container .ant-descriptions-item-content {
    color: var(--acx-neutrals-60);
  }

  .ant-descriptions-row > th {
    padding-bottom: 0px;
  }
`

export const DescriptionWrapper = styled.div`
  margin-bottom: var(--acx-content-horizontal-space);
`
export const InfoMargin = styled.div`
  margin: 10px 10px;
`

export const InstancesContainer = styled(Space)`
  margin: 10px 0px 22px 0px;
  justify-content: space-between;
`
export const InstancesTitle = styled(Typography.Title)`
  &.ant-typography {
    margin-bottom: 0px;
  }
`

export const StyledTableInfoText = styled(Typography.Text)`
  color: var(--acx-neutrals-50)
`

export const StyledSpace = styled(Space)`
  & > .ant-space-item:not(:last-child) {
    margin-bottom: -15px;
  }
`
export const StyledTooltip = styled(Tooltip.Question)`
  display: flex;
  justify-content: center;
  width: 16px;
  height: 16px;
`
