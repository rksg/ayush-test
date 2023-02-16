// import { useIntl } from 'react-intl'

import styled from 'styled-components'

const TitleWrapper = styled.div`
  display: grid;
  padding: 8px;
  font-size: 15px;
  background-color: #ffcd70;
  grid-template-columns: auto 10px;
  color: #7f7f7f;
  height: 31px;
`

const TitleContainer = styled.div`
  font-weight: 700;
  color: #7f7f7f;
  height: 15px;
`

const VersionBanner = () => {
  return (
    // <div *ngIf='versions && versions.length'>
    <div>
      <TitleWrapper>
        <TitleContainer>
          Latest Version
        </TitleContainer>
      </TitleWrapper>

      <div className='version-info-container'>
        <div className='firmware-divider'></div>
        <div className='firmware-version-wrapper'>
          <div className='version-number-wrapper'>Version firmware.name</div>
          <div className='firmware-type-wrapper'>
            <span className='type'>firmware.category | firmwareType: 'type'</span>
            <span className='firmware-info'>
              <span className='subType'> (firmware.category | firmwareType: 'subType') </span>
              <span className='firmware-info-divider'></span>
              <span className='firmware-date'>firmware.createdDate | date: 'MMM dd, yyyy'</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionBanner
