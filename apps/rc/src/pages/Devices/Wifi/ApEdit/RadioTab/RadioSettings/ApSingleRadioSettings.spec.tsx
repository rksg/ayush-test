import React from 'react'

import { Form }                from 'antd'
import { createMemoryHistory } from 'history'
import { Router }              from 'react-router-dom'

import {
  ApRadioTypeEnum,
  SupportRadioChannelsContext,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions
} from '@acx-ui/rc/components'
import {
  AFCStatus,
  AFCPowerMode
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import {
  r760Ap,
  triBandApCap,
  validRadioChannels
} from '../../../../__tests__/fixtures'

import { ApSingleRadioSettings } from './ApSingleRadioSettings'

const r760Cap = triBandApCap.apModels.find(cap => cap.model === 'R760')

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  SingleRadioSettings: () => <div data-testid='SingleRadioSettings' />
}))

const bandwidthRadioOptions = {
  [ApRadioTypeEnum.Radio24G]: channelBandwidth24GOptions,
  [ApRadioTypeEnum.Radio5G]: channelBandwidth5GOptions,
  [ApRadioTypeEnum.Radio6G]: channelBandwidth6GOptions,
  [ApRadioTypeEnum.RadioLower5G]: channelBandwidth5GOptions,
  [ApRadioTypeEnum.RadioUpper5G]: channelBandwidth5GOptions
}

const supportRadioChannels = {
  [ApRadioTypeEnum.Radio24G]: validRadioChannels['2.4GChannels'],
  [ApRadioTypeEnum.Radio5G]: validRadioChannels['5GChannels'],
  [ApRadioTypeEnum.Radio6G]: validRadioChannels['6GChannels'],
  [ApRadioTypeEnum.RadioLower5G]: validRadioChannels['5GLowerChannels'],
  [ApRadioTypeEnum.RadioUpper5G]: validRadioChannels['5GUpperChannels']
}

describe('ApSingleRadioSettings', ()=> {
  const useStateSpy = jest.spyOn(React, 'useState')
  useStateSpy.mockImplementation(() => [true, jest.fn()])

  const MockedComponent = (props: { afcStatus: AFCStatus }) => (
    <ApEditContext.Provider value={{
      editContextData: {
        tabTitle: '',
        isDirty: false,
        updateChanges: jest.fn(),
        discardChanges: jest.fn()
      },
      apViewContextData: {
        apStatusData: {
          afcInfo: {
            afcStatus: props.afcStatus,
            powerMode: AFCPowerMode.LOW_POWER
          }
        }
      },
      setEditContextData: jest.fn()
    }}
    >
      <ApDataContext.Provider value={{
        apData: r760Ap,
        apCapabilities: r760Cap
      }}>
        <Form>
          <SupportRadioChannelsContext.Provider value={{
            bandwidthRadioOptions,
            supportRadioChannels
          }}>
            <ApSingleRadioSettings
              isUseVenueSettings={false}
              isEnabled={true}
              radioTypeName={'2.4 GHz'}
              useVenueSettingsFieldName={['apRadioParams24G', 'useVenueSettings']}
              enabledFieldName={['enable24G']}
              onEnableChanged={jest.fn()}
              radioType={ApRadioTypeEnum.Radio24G}
              handleChanged={jest.fn()}
            />
          </SupportRadioChannelsContext.Provider>
        </Form>
      </ApDataContext.Provider>
    </ApEditContext.Provider>
  )

  // eslint-disable-next-line max-len
  it('should render correctly when isUseVenueSettings = false and AFC Status = PASSED', async () => {
    const history = createMemoryHistory()

    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <MockedComponent afcStatus={AFCStatus.PASSED} />
        </Provider>
      </Router>)
  })

  // eslint-disable-next-line max-len
  it('should render correctly when isUseVenueSettings = false and AFC Status = REJECTED', async () => {
    const history = createMemoryHistory()

    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <MockedComponent afcStatus={AFCStatus.REJECTED} />
        </Provider>
      </Router>)
  })

  // eslint-disable-next-line max-len
  it('should render correctly when isUseVenueSettings = false and AFC Status = WAIT_FOR_RESPONSE', async () => {
    const history = createMemoryHistory()

    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <MockedComponent afcStatus={AFCStatus.WAIT_FOR_RESPONSE} />
        </Provider>
      </Router>)
  })

  // eslint-disable-next-line max-len
  it('should render correctly when isUseVenueSettings = false and AFC Status = WAIT_FOR_LOCATION', async () => {
    const history = createMemoryHistory()

    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <MockedComponent afcStatus={AFCStatus.WAIT_FOR_LOCATION} />
        </Provider>
      </Router>)
  })
})
