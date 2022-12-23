import styled from 'styled-components/macro'

export type Status = 'PENDING' | 'INPROGRESS' | 'SUCCESS' | 'FAIL' | 'OFFLINE'

const getStatusColor = (status: Status) => {
  switch(status){
    case 'SUCCESS':
      return 'var(--acx-semantics-green-50)'
    case 'FAIL':
      return 'var(--acx-semantics-red-50)'
    case 'PENDING':
    case 'INPROGRESS':
    case 'OFFLINE':
      return 'var(--acx-neutrals-60)'
  }
}

export const Wrapper = styled.div`
  .ant-timeline-item:nth-child(odd)  {
    padding-bottom: 7px;
  }
  .ant-timeline-item:nth-child(even)  {
    padding-bottom: 16px;
  }
  .ant-timeline-item-tail {
    height: 100%;
    top: 8px;
    color: var(--acx-accents-orange-50);
  }
  .ant-timeline-item-content {
    font-size: var(--acx-body-5-font-size);
    line-height: var(--acx-body-5-line-height);
  }
  .ant-timeline-item-head-custom {
    background: transparent;
    top: 3px;
  }
  .ant-descriptions-item-container {
    padding-bottom: 26px;
  }
  .ant-descriptions-item-content {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    font-weight: var(--acx-body-font-weight-bold);
    color: var(--acx-primary-black);
  }
  .ant-descriptions-item-label {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    font-weight: var(--acx-body-font-weight-bold);
    color: var(--acx-neutrals-60);
  }
`

export const ItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 106px auto;
`

export const ContentWrapper = styled.div`
  margin: -27px 4px 0px 30px;
`

export const StatusWrapper = styled.div<{ status: Status }>`
  display: flex;
  align-items: center;
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight-bold);
  color: ${(props) => getStatusColor(props.status)};
`

export const DescriptionWrapper = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  margin-left: 24px;
`

export const WithExpanderWrapper = styled.div`
  display: grid;
  grid-template-columns: auto min-content;
`

export const ExpanderWrapper = styled.div`
  display: flex;
  align-items: center;
  svg {
    width: 16.5;
    height: 16.5;
    rect {
      fill: var(--acx-accents-blue-50);
    }
    path {
      stroke: var(--acx-primary-white);
    }
  }
`
