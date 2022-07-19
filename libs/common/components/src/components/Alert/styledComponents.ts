import { Alert } from 'antd'
import styled    from 'styled-components/macro'

export const AlertStyle = styled(Alert)`
&.ant-alert {
  font-size: var(--acx-body-4-font-size);
  padding: 10px 15px;
  margin-bottom: var(--acx-content-vertical-space);
  svg {
    font-size: var(--acx-body-3-font-size);
  }
}

.ant-alert-close-icon .anticon-close {
  color: var(--acx-primary-black);
}

&.ant-alert-info {
  background-color: var(--acx-accents-orange-10);
  border: 1px solid var(--acx-accents-orange-25);

  svg.ant-alert-icon path:nth-child(-n+2) {
    fill: var(--acx-accents-orange-50);
    stroke: var(--acx-accents-orange-50);
  }
}

`
