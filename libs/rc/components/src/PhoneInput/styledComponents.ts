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
  }
`
