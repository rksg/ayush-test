import styled from 'styled-components'

import { StepsFormLegacy } from '@acx-ui/components'


export const OverwriteStepsForm = styled(StepsFormLegacy.StepForm)`
  h3 {
    &::after {
        content: "*";
        margin-right: 0;
        margin-left: 3px;
        color: var(--acx-accents-orange-50);
        font-family: var(--acx-neutral-brand-font);
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        display: inline-block;
        box-sizing: border-box;
    }
  }
`
