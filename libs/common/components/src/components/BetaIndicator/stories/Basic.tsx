import { BetaIndicator, getTitleWithIndicator } from '../index'

export function Basic () {
  return <>
    <div>
      <p style={{ fontWeight: 600 }}>Icon only:</p>
      size=sm <BetaIndicator />
      size=md <BetaIndicator size='md' />
    </div>
    <br></br>
    <div>
      <p style={{ fontWeight: 600 }}>One line text with Beta Indicator:</p>
      { getTitleWithIndicator('Title') }
    </div>
    <br></br>
    <div>
      <p style={{ fontWeight: 600 }}>Multi line text with Beta Indicator:</p>
      <div style={{ maxWidth: '20px' }} >{
        getTitleWithIndicator('TitleTitle TitleTitleTitleTitle', true)
      }</div>
    </div>
  </>
}
