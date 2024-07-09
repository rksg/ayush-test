import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;

  .ant-card {
    background: linear-gradient(180deg, #2B4181 0%, #223878 53.7%, #263C7B 100%);
    color: var(--acx-primary-white);

    .ant-card-body {
      justify-content: center;

      img {
        width: 100px;
        margin-bottom: 5px;
      }

      p {
        font-size: var(--acx-body-3-font-size);
        line-height: var(--acx-body-3-line-height);
        b {
          font-weight: var(--acx-body-font-weight-bold);
        }
      }

      button {
        width: fit-content;
        margin: 0 auto;
        border-color: var(--acx-primary-white) !important;
        color: var(--acx-primary-white) !important;
        &:hover, &:focus, &:active {
          border-color: var(--acx-primary-white) !important;
          color: var(--acx-primary-white) !important;
        }
      }
    }
  }
`
