import styled from 'styled-components/macro'

import { LoadingSolid, SuccessSolid } from '@acx-ui/icons'

export const Wrapper = styled.div`
  .ant-form-item {
    .ant-input-suffix {
      position: relative;
      right: -30px;
    }
  }
`
export const LoadingSolidIcon = styled(LoadingSolid)`
  @keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
  }
  width: 12px;
  height: 12px;
  animation: spin .8s infinite linear;
  path {
    fill: var(--acx-neutrals-70);
  }
`

export const SuccessSolidIcon = styled(SuccessSolid)`
  @keyframes show {
    from {
      opacity: 0;
      transform: scale(0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  width: 12px;
  height: 12px;
  animation: show .2s normal linear;
  path {
    stroke: var(--acx-semantics-green-60);
  }
`