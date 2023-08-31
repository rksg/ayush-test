import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { StepsFormLegacy }    from '@acx-ui/components'
import { DeleteOutlinedIcon } from '@acx-ui/icons'

export const TableContainer = styled.div`
  .ant-pro-table .ant-table-thead > tr:first-child > th,
  .ant-pro-table .ant-table-thead > tr:last-child > th {
    border-bottom: 0;
    color: var(--acx-neutrals-60);
    font-weight: var(--acx-body-font-weight);
  }
  .ant-pro-table .ant-table-thead > tr:last-child > th:nth-child(2),
  .ant-pro-table .ant-table-thead > tr:last-child > th:nth-child(3),
  .ant-pro-table .ant-table-thead > tr:last-child > th:nth-child(4) {
    text-align: center;
  }
  .ant-pro-table .ant-table-tbody > tr > td{
    border-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    vertical-align: baseline;
  }
  .ant-pro-table .ant-table-tbody > tr > td:first-child{
    color: var(--acx-neutrals-60);
  }
  .ant-pro-table .ant-table-tbody > tr > td:nth-child(2),
  .ant-pro-table .ant-table-tbody > tr > td:nth-child(3),
  .ant-pro-table .ant-table-tbody > tr > td:nth-child(4) {
    text-align: center;
  }
  .ant-pro-table .ant-table-tbody > tr > td:nth-child(5) {
    top: 3px;
  }
  button{
    align-items: start;
    vertical-align: baseline;
  }
`

export const DisabledDeleteOutlinedIcon = styled(DeleteOutlinedIcon)`
  svg path{
    stroke: var(--acx-neutrals-40);
  }
`

export const RequiredDotSpan = styled.span`
  color: var(--acx-accents-orange-50)
`

export const StepFormTitle = styled(StepsFormLegacy.Title)`
  margin-bottom: 5px !important;
  margin-top: 20px;
`

export const TypographyText = styled(Typography.Text)`
  margin-bottom: 10px;
  font-size: 10px;
`
