import { Form, Typography } from 'antd'
import styled, { css }      from 'styled-components/macro'

export const StyledFeatureName = styled(Typography.Text)`
  font-size: var(--acx-subtitle-4-font-size);
  font-weight: var(--acx-subtitle-4-font-weight);
  color: var(--acx-primary-black);
  margin-bottom: 10px;
`

export const StyledDeviceTypeTitle = styled(Typography.Text)`
  font-size: var(--acx-body-2-font-size);
  font-weight: var(--acx-body-font-weight-bold);
  color: var(--acx-primary-black);
  margin-top: var(--acx-content-vertical-space);
  margin-bottom: 8px;
`

export const StyledFormItem = styled(Form.Item)`
  &, & .ant-form-item-control-input {
    font-size: 13px;  
    line-height: 13px;
    min-height: 13px;
}
`

const StyledRequirementWrapperCss = css`
  background-color: var(--acx-neutrals-10);
  border-radius: 4px;
  padding: 15px 10px 5px 10px;

`
export const StyledRequirementWrapper = styled.div<{ $hasBackground?: boolean }>`
 ${props => props.$hasBackground !== false ? StyledRequirementWrapperCss : ''}
`

export const StyledApModelFamilyWrapper = styled.div<{ tagWidth: string }>`
  display: grid;
  grid-template-columns: ${props => props.tagWidth} auto;
  column-gap: 5px;
  padding-bottom: 10px;
`

// FeatureType Tags
const StyledFeatureType = styled.div`
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  padding: 0 8px 0 8px;
  font-size: 11px;
  line-height: 16px;
`

export const StyledFeatureTypeWifi = styled(StyledFeatureType)`
  background-color: var(--acx-accents-blue-10);
  color: var(--acx-accents-blue-50);
  border-color: var(--acx-accents-blue-50);
`

export const StyledFeatureTypeEdge = styled(StyledFeatureType)`
  color: var(--acx-accents-orange-50);
  border-color: var(--acx-accents-orange-50);
  background-color: var(--acx-accents-orange-10);
`

export const StyledFeatureTypeSwitch = styled(StyledFeatureType)`
  color: var(--acx-semantics-green-50);
  border-color: var(--acx-semantics-green-50);
  background-color: var(--acx-semantics-green-10);
`

// ApModelFamilyType Tags
const StyledApModelFamilyType = styled(StyledFeatureType)`
  color: white;
  height: 16px;
  width: fit-content;
  text-align: center;
  border-style: none;
`

export const StyledApModelFamilyTypeWIFI11AC1 = styled(StyledApModelFamilyType)`
  background-color: var(--acx-accents-orange-50);
`

export const StyledApModelFamilyTypeWIFI11AC2 = styled(StyledApModelFamilyType)`
  background-color: var(--acx-accents-orange-55);
`

export const StyledApModelFamilyTypeWIFI6 = styled(StyledApModelFamilyType)`
  background-color: var(--acx-accents-blue-55);
`

export const StyledApModelFamilyTypeWIFI6E = styled(StyledApModelFamilyType)`
  background-color: var(--acx-accents-blue-60);
`

export const StyledApModelFamilyTypeWIFI7 = styled(StyledApModelFamilyType)`
  background-color: var(--acx-semantics-green-40);
`
