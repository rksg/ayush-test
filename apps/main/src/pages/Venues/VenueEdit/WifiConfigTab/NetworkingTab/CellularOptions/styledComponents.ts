import styled from 'styled-components/macro'


export const CountryDescLabel = styled.span`
font-size: var(--acx-body-5-font-size);
line-height: 32px;

`

export const FieldLabel = styled.div<{ width: string }>`
font-size: var(--acx-body-4-font-size);
display: grid;
line-height: 32px;
grid-template-columns: ${props => props.width} 1fr;
`

export const CurrentCountryLabel = styled.span`
font-size: var(--acx-body-4-font-size);
line-height: var(--acx-body-4-line-height);
`

export const MultiSelect = styled.div`
div.ant-checkbox-group {
  display: flex;
  > label.ant-checkbox-wrapper {
    font-size: 12px;
    align-items: center;
    margin: 0 3px;
    width: auto;
    padding: 4px 12px;
    border: 1px solid rgb(217, 217, 217);
    border-right-width: 0;

    border: 1px solid #333333;
    border-radius: 4px;
    background-color: white;

    > span:first-child {
      display: none;
    }
  }

  > label.ant-checkbox-wrapper-checked {
    border: 1px solid #333333;
    border-radius: 4px;
    background-color: #333333;
    color: white;
  }

  > label.ant-checkbox-wrapper:last-child {
    border-right-width: 1px;
  }
}
`