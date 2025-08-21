import styled from 'styled-components/macro'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

export const PublishReadinessBox = styled('div')<{ ready: boolean }>`

  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;
  padding: 2px 2px 2px 2px;
  border-radius: 10px;
  overflow: hidden;

  text-align: center;

  color:  ${props => props.ready ? 'var(--acx-primary-white)' : 'var(--acx-primary-black)'};

  background: ${props => props.ready ? 'var(--acx-semantics-green-50)' : 'var(--acx-neutrals-20)' };

  .icon {
    scale: 0.7;
    path:nth-child(1) {
      fill: ${props => props.ready ? 'var(--acx-primary-white)' : 'var(--acx-neutrals-50)'};
    }
    
  }
`

export const RestrictedUrl = styled('div')`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 160px;

    span {
       font-size: var(--acx-body-3-font-size);
       color: var(--acx-neutrals-60);
    }
`

export const QuestionMarkCircleOutlinedIcon = styled(QuestionMarkCircleOutlined)`
  width: 20px;
  cursor: pointer;
  color: var(--acx-neutrals-60);
`