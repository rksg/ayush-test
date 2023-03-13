import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  height: 410px;
  width: 286px;
  border-radius: 8px;
  background: var(--acx-primary-black);
  .ant-carousel .slick-slide {
    border-radius: 8px;
    background: var(--acx-primary-black);
    overflow: hidden;
  } 
  .carousel-card {
    margin: 0;
    height: 410px;
    width: 286px;
    color: var(--acx-primary-white);
    text-align: center;
    background: var(--acx-primary-black);
    border-radius: 8px;
    padding: 16px;
  }
  .carousel-card.no-data {
    ol {
      list-style-type: none;
      padding-left: 0px !important;
      li {
        padding-top: 8px !important;
        list-style-type: none !important;
      }
    }
  }
  .carousel-dots {
    li {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      border: 1px solid var(--acx-neutrals-25);
      background: var(--acx-primary-black);
      button {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--acx-primary-black);
      }
    }
    li.slick-active {
      width: 6px;
      background: var(--acx-neutrals-25);
    }
  }
`
export const Title = styled.div`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-white);
  text-align: left;
  font-weight: var(--acx-headline-4-font-weight-bold);
  font-family: var(--acx-chart-font);
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`
export const SubTitle = styled.div`
  margin-top: 16px;
  color: var(--acx-primary-white);
  font-family: var(--acx-neutral-brand-font);
  font-style: normal;
  font-weight: var(--acx-subtitle-6-font-weight);
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  text-align: left;
`
export const List = styled.div`
  text-align: left;
  ol {
    padding-left: 16px;
  }
  li {
    list-style-type: disc;
    font-family: var(--acx-neutral-brand-font);
    font-style: normal;
    font-weight: var(--acx-subtitle-6-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    padding-top: 16px;
  }
`
