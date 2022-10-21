import styled, { css } from 'styled-components/macro'

export const Fieldset = styled.fieldset<{ $checked: boolean }>`${props => props.$checked ? css`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-30);
  padding: 32px 16px 16px;
` : ''}`

export const Legend = styled.legend`
  &, .ant-form & {
    color: var(--acx-primary-black);
    width: max-content;
    border: 0;
    margin: 0;

    &, & > label {
      font-size: var(--acx-subtitle-5-font-size);
      font-weight: var(--acx-subtitle-5-font-weight);
      line-height: var(--acx-subtitle-5-line-height);

      cursor: pointer;
      fieldset:disabled & { cursor: not-allowed; }
    }
  }

  .ant-switch { 
    margin-left: 50px;
    position: absolute;
    background: var(--acx-primary-white); 
  }
`
