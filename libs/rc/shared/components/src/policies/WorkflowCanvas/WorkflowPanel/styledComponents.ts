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

export const PublishReadinessProgress = styled('div')<{ ready: boolean }>`

  display: flex;
  align-items: center;
  justify-content: center;

  width: 116px;
  min-height: 30px;
  padding: 2px 2px 2px 2px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--acx-primary-black);

  text-align: center;
  line-height: 30px;

  color:  ${props => props.ready ? 'var(--acx-primary-white)' : 'var(--acx-primary-black)'};

  background: ${props => props.ready ? 'var(--acx-semantics-green-50)' : 'rgba(0,0,0,0)' };

  .readyIcon {
    margin-right: 0.5rem;
    path:nth-child(1) {
      fill: ${props => props.ready ? 'var(--acx-primary-white)' : 'var(--acx-primary-black)'};
    }    
  }

  .notReadyIcon {
    margin-right: 0.5rem;
    path:nth-child(2) {
      fill: var(--acx-primary-black);
    }
    path:nth-child(3) {
      stroke: var(--acx-primary-white);
    }
    path:nth-child(4) {
      stroke: var(--acx-primary-white);
    }
    
  }
`