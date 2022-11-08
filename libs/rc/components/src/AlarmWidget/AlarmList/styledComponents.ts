import styled, { css } from 'styled-components/macro'

export const AlarmListWrapper = styled.div`
  padding: 0px 5px;

  .ant-list-item {
    display: grid;
    padding: 4px 0;
  }

  .ant-list-split .ant-list-item {
    border: none;
  }
`

const alarmStatusIconStyle = css`
  position: relative;
  display: inline-block;
  top: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`

const textFontStyle = css`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-body-font-weight);
`

export const CriticalAlarmIcon = styled.span`
  ${alarmStatusIconStyle}
  background-color: var(--acx-semantics-red-50);
`

export const MajorAlarmIcon = styled.span`
  ${alarmStatusIconStyle}
  background-color: var(--acx-accents-orange-30);
`

export const MesssageWrapper = styled.div`
  ${textFontStyle}
  margin-left: -4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const SubTextContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

export const Link = styled.a`
  ${textFontStyle}
  margin-left: 12px;
  color: var(--acx-accents-blue-50);
`

export const NoLink = styled.span`
  ${textFontStyle}
  margin-left: 12px;
  color: var(--acx-neutrals-40);
`

export const TimeStamp = styled.span`
  ${textFontStyle}
  color: var(--acx-neutrals-60);
`