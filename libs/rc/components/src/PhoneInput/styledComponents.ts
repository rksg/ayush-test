import styled from 'styled-components/macro'

import backgroundImage from './img/flags.png'

export const FlagContainer = styled.div`
  .iti {
    width: 100%;
    .iti__flag {
      background-image: url(${backgroundImage});
    }
    .iti__country-list {
      max-width: 296px;
    }
    /* ===== Scrollbar CSS ===== */
    /* Firefox */
    * {
      scrollbar-width: auto;
      scrollbar-color: rgba(0, 0, 0, 0.5) #ffffff;
    }

    /* Chrome, Edge, and Safari */
    *::-webkit-scrollbar {
      width: 16px;
    }

    *::-webkit-scrollbar-track {
      background: #ffffff;
    }

    *::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      border: 3px solid #ffffff;
    }
  }
`
