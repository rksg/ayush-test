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

export const PublishReadinessProgress = styled('div')<{ progress: number }>`

    width: 136px;
    height: 30px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid;

    .progress-bar {
      text-align: center;
      line-height: 30px;
      height: 100%;
      background: ${props => props.progress < 100 ? 'var(--acx-semantics-green-40)'
    : 'var(--acx-semantics-green-50)' };
    }

    .status-label {
      display: inline-block;
      width: 136px;
      color:  ${props => props.progress < 100 ? 'var(--acx-primary-black)'
    : 'var(--acx-primary-white)'};
    }
`