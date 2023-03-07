import { Space }       from 'antd'
import styled, { css } from 'styled-components/macro'

import { CaretDownOutlined, EnvelopClosedSolid } from '@acx-ui/icons'

export const EnvelopClosedSolidIcon = styled(EnvelopClosedSolid)`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`
export const OtpLabel = styled(Space).attrs({ direction: 'vertical', size: 0 })`
  margin-bottom: 16px;
  width: 420px;
  height: 42px;
  line-height: 16px;
  padding-top: 4px;
  padding-left: 22px;
  margin-left: 85px;
  font-size: var(--acx-body-4-font-size);
  .ant-space-item:last-of-type {
    color: var(--acx-accents-orange-30);
    font-size: var(--acx-body-4-font-size);
  }
`
const linkStyle = css`
  color:var(--acx-accents-blue-50);
  cursor:pointer;
  margin-bottom:10px;
  &:hover{
    color:var(--acx-accents-blue-50);
  }
`
export const FieldTextLink = styled.div`
  ${linkStyle}
`
export const AdminList = styled.div`
  padding-right: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 `
export const FieldLabel2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 150px 150px;
  align-items: baseline;
`
export const FieldLabelAdmins = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 135px 280px 40px;
  align-items: baseline;
`
export const FieldLabelSubs = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 130px 90px 200px;
  align-items: baseline;
`
export const FieldLabeServiceDate = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 150px 150px 150px;
  align-items: baseline;
`
export const FieldLabelAccessPeriod = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 110px 90px 100px;
  align-items: baseline;
`
export const CaretDownIcon = styled(CaretDownOutlined)`
cursor: pointer;
margin-left: 7px;
margin-right: 2px;
path{
  fill:var(--acx-primary-white);
}
`
export const FieldLabelDomain = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 100px 180px 150px;
  align-items: baseline;
`
export const ImagePreviewDark = styled.div<{ width: string, height: string }>`
  display: flex;
  align-items: center;
  background-color: var(--acx-primary-black);
  width: ${props => props.width};
  height: ${props => props.height}
`

export const ImagePreviewLight = styled.div<{ width: string, height: string }>`
  display: flex;
  align-items: center;
  background-color: var(--acx-neutrals-15);
  width: ${props => props.width};
  height: ${props => props.height}
`
