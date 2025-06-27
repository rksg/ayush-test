import styled from 'styled-components/macro'

export const PublishReadinessBox = styled('div')<{ ready: boolean }>`

  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;
  padding: 2px 2px 2px 2px;
  border-radius: 15px;
  overflow: hidden;

  text-align: center;
  line-height: 30px;

  color:  ${props => props.ready ? 'var(--acx-primary-white)' : 'var(--acx-primary-black)'};

  background: ${props => props.ready ? 'var(--acx-semantics-green-50)' : 'var(--acx-neutrals-20)' };

  .icon {
    path:nth-child(1) {
      fill: ${props => props.ready ? 'var(--acx-primary-white)' : 'var(--acx-neutrals-50)'};
    }
    
  }
`