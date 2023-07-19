import React from 'react'

import { StepsFormLegacy }           from '@acx-ui/components'
import { Provider  }                 from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { RadioSettingsChannelsManual320Mhz } from './RadioSettingsChannelsManual320Mhz'

describe('RadioSettingsChannelsManual320Mhz', () => {

  it('should render correctly', async () => {
    render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannelsManual320Mhz
              formName={['apRadioParams6G', 'allowedChannels']}
              // eslint-disable-next-line
              channelBandwidth320MhzGroupFieldName={['apRadioParams6G', 'channelBandwidth320MhzGroup']}
              channelList={TEST_CHANNEL_DATA}
              disabled={false}
              editContext={React.createContext({
                setEditContextData: jest.fn()
              })}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Provider>
    )
    expect(screen.getByTestId('320MHz-1-radio')).toBeChecked()
    expect(screen.getByTestId('320MHz-1-checkboxgroup')).toBeInTheDocument()
    expect(screen.queryByTestId('320MHz-2-checkboxgroup')).not.toBeInTheDocument()
  })

  it('should render correctly after click second group', async () => {
    render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannelsManual320Mhz
              formName={['apRadioParams6G', 'allowedChannels']}
              // eslint-disable-next-line
              channelBandwidth320MhzGroupFieldName={['apRadioParams6G', 'channelBandwidth320MhzGroup']}
              channelList={TEST_CHANNEL_DATA}
              disabled={false}
              editContext={React.createContext({
                setEditContextData: jest.fn()
              })}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Provider>
    )
    expect(screen.getByTestId('320MHz-1-radio')).toBeChecked()
    fireEvent.click(screen.getByTestId('320MHz-2-radio'))
    expect(screen.queryByTestId('320MHz-1-checkboxgroup')).not.toBeInTheDocument()
    expect(screen.getByTestId('320MHz-2-checkboxgroup')).toBeInTheDocument()
  })

  it('should render correctly should have zero manual active channel', async () => {
    const { container } = render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannelsManual320Mhz
              formName={['apRadioParams6G', 'allowedChannels']}
              // eslint-disable-next-line
              channelBandwidth320MhzGroupFieldName={['apRadioParams6G', 'channelBandwidth320MhzGroup']}
              channelList={TEST_CHANNEL_DATA}
              disabled={false}
              editContext={React.createContext({
                setEditContextData: jest.fn()
              })}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Provider>
    )
    expect(screen.getByTestId('320MHz-1-radio')).toBeChecked()
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelectorAll('span.ant-checkbox-checked > input').length).toBe(0)
  })
})


const TEST_CHANNEL_DATA = [
  { value: '1', selected: true },
  { value: '5', selected: false },
  { value: '9', selected: false },
  { value: '13', selected: false },
  { value: '17', selected: false },
  { value: '21', selected: false },
  { value: '25', selected: false },
  { value: '29', selected: false },
  { value: '33', selected: false },
  { value: '37', selected: false },
  { value: '41', selected: false },
  { value: '45', selected: false },
  { value: '49', selected: false },
  { value: '53', selected: false },
  { value: '57', selected: false },
  { value: '61', selected: false },
  { value: '65', selected: false },
  { value: '69', selected: false },
  { value: '73', selected: false },
  { value: '77', selected: false },
  { value: '81', selected: false },
  { value: '85', selected: false },
  { value: '89', selected: false },
  { value: '93', selected: false },
  { value: '97', selected: false },
  { value: '101', selected: false },
  { value: '105', selected: false },
  { value: '109', selected: false },
  { value: '113', selected: false },
  { value: '117', selected: false },
  { value: '121', selected: false },
  { value: '125', selected: false },
  { value: '129', selected: false },
  { value: '133', selected: false },
  { value: '137', selected: false },
  { value: '141', selected: false },
  { value: '145', selected: false },
  { value: '149', selected: false },
  { value: '153', selected: false },
  { value: '157', selected: false },
  { value: '161', selected: false },
  { value: '165', selected: false },
  { value: '169', selected: false },
  { value: '173', selected: false },
  { value: '177', selected: false },
  { value: '181', selected: false },
  { value: '185', selected: false },
  { value: '189', selected: false },
  { value: '193', selected: false },
  { value: '197', selected: false },
  { value: '201', selected: false },
  { value: '205', selected: false },
  { value: '209', selected: false },
  { value: '213', selected: false },
  { value: '217', selected: false },
  { value: '221', selected: false }
]