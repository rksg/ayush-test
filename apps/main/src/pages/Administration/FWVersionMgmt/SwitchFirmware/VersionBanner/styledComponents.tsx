import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    background-color: var(--acx-neutrals-60);
  }
`
export const VersionName = styled.span`
  font-weight: 600;
`
export const FwContainer = styled.div`
  color: var(--acx-neutrals-70);
  font-size: 12px;
  line-height: 20px;
  margin-right: 30px;
`
export const BannerVersion = styled.div`
  background-color: var(--acx-accents-orange-10);
  width: fit-content;
  padding: 7px 15px 15px 15px;
`
export const LatestVersion = styled.div`
  font-weight: 600;
  margin-bottom: 14px;
  line-height: 18px;
`
