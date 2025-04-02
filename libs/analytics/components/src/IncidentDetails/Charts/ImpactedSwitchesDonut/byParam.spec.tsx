import { fakeIncidentDDoS, overlapsRollup }     from '@acx-ui/analytics/utils'
import { dataApi, dataApiURL, Provider, store } from '@acx-ui/store'
import { mockGraphqlQuery, render,
  screen } from '@acx-ui/test-utils'

import {  DonutChartByParamProps, ImpactedSwitchesByParamDonut } from './byParam'
import { ImpactedSwitch }                                        from './services'


jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

describe.each(['model', 'firmware'])('ImpactedSwitchesByParamDonut',(param)=>{
  const capitalizeParam = param.charAt(0).toUpperCase() + param.slice(1)
  const sample1:ImpactedSwitch[] = [{
    name: 'ICX7150-C12 Router',
    mac: '58:FB:96:0B:12:CA',
    model: 'ICX7150-C12',
    firmware: 'firmware1'
  },
  {
    name: 'ICX7650-48ZP Router',
    mac: 'D4:C1:9E:14:C3:99',
    model: 'ICX7650-48ZP',
    firmware: 'firmaware2'
  }
  ]

  const response = (data: ImpactedSwitch[] = [
    ...sample1
  ]) => ({
    incident: {
      impactedSwitches: data,
      switchCount: 5
    }
  })

  describe(`(${param})`, () => {
    beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
    it('should render', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      const { asFragment } = render(<Provider>
        <ImpactedSwitchesByParamDonut incident={fakeIncidentDDoS}
          param={param as DonutChartByParamProps['param']}/>
      </Provider>)
      await screen.findByText(`Impacted Switch ${capitalizeParam}s`)
      expect(asFragment()
        .querySelector('div.ant-card-body > div:nth-child(1) > div > div > div > div:nth-child(1)'))
        .toMatchSnapshot()
    })
    it('should hide chart when under druidRollup', async () => {
      jest.mocked(mockOverlapsRollup).mockReturnValue(true)
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', { data: response() })
      render(<Provider>
        <ImpactedSwitchesByParamDonut incident={fakeIncidentDDoS}
          param={param as DonutChartByParamProps['param']}/>
      </Provider>)
      await screen.findByText(`Impacted Switch ${capitalizeParam}`)
      await screen.findByText('Data granularity at this level is not available')
      jest.mocked(mockOverlapsRollup).mockReturnValue(false)
    })
  })
})