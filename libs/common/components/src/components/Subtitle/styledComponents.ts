import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const Subtitle = styled(Typography.Title)`
h1&.ant-typography {
  line-height: var(--acx-subtitle-1-line-height);
  font-size: var(--acx-subtitle-1-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-1-font-weight);
}

h2&.ant-typography {
  line-height: var(--acx-subtitle-2-line-height);
  font-size: var(--acx-subtitle-2-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-2-font-weight);
}

h3&.ant-typography {
  line-height: var(--acx-subtitle-3-line-height);
  font-size: var(--acx-subtitle-3-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-3-font-weight);
}

h4&.ant-typography {
  line-height: var(--acx-subtitle-4-line-height);
  font-size: var(--acx-subtitle-4-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-4-font-weight);
}

h5&.ant-typography {
  line-height: var(--acx-subtitle-5-line-height);
  font-size: var(--acx-subtitle-5-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-5-font-weight);
}

`
