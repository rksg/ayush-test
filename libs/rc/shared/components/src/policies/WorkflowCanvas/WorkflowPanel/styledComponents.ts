import { Card as AntCard } from 'antd'
import styled              from 'styled-components/macro'


export const WorkflowCard = styled(AntCard)`
  display: grid;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 4px rgba(51, 51, 51, 0.08);

  .ant-card-body {
    padding: 0;
  }
`
