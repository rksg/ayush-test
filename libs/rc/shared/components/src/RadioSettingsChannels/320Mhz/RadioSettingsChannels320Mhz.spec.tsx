import React from 'react'

import { StepsFormLegacy }           from '@acx-ui/components'
import { Provider  }                 from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { RadioSettingsChannels320Mhz } from './RadioSettingsChannels320Mhz'



describe('RadioSettingsChannels320Mhz', () => {

  it('should render correctly', async () => {
    render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannels320Mhz
              context={'venue'}
              formName={['apRadioParams6G', 'allowedChannels']}
              channelList={TEST_CHANNEL_DATA}
              disabled={false}
              editContext={React.createContext({})}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Provider>
    )
    expect(screen.queryAllByTestId('320-button', { exact: false }).length).toBe(6)
    expect(screen.queryAllByTestId('160-checkbox', { exact: false }).length).toBe(7)
  })

  it('should render correctly with correctly checked 160 Channel Group', async () => {
    render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannels320Mhz
              context={'venue'}
              formName={['apRadioParams6G', 'allowedChannels']}
              channelList={TEST_CHANNEL_DATA}
              disabled={false}
              editContext={React.createContext({})}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Provider>
    )
    expect(screen.getByTestId('160-checkbox-15')).toBeChecked()
    expect(screen.getByTestId('160-checkbox-47')).toBeChecked()
    expect(screen.getByTestId('160-checkbox-79')).not.toBeChecked()
    expect(screen.getByTestId('160-checkbox-111')).not.toBeChecked()
    expect(screen.getByTestId('160-checkbox-143')).not.toBeChecked()
    expect(screen.getByTestId('160-checkbox-175')).not.toBeChecked()
    expect(screen.getByTestId('160-checkbox-205')).not.toBeChecked()
  })

  it('should render correctly with correctly click 320 channel group', async () => {
    render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannels320Mhz
              context={'venue'}
              formName={['apRadioParams6G', 'allowedChannels']}
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

    fireEvent.click(screen.getByTestId('320-button-95'))
    expect(screen.getByTestId('160-checkbox-15')).toBeChecked()
    expect(screen.getByTestId('160-checkbox-47')).toBeChecked()
    expect(screen.getByTestId('160-checkbox-79')).toBeChecked()
    expect(screen.getByTestId('160-checkbox-111')).toBeChecked()
    expect(screen.getByTestId('160-checkbox-143')).not.toBeChecked()
    expect(screen.getByTestId('160-checkbox-175')).not.toBeChecked()
    expect(screen.getByTestId('160-checkbox-205')).not.toBeChecked()
  })

  it('should render correctly if channel isolated', async () => {
    const { container } = render(
      <Provider>
        <StepsFormLegacy>
          <StepsFormLegacy.StepForm>
            <RadioSettingsChannels320Mhz
              context={'venue'}
              formName={['apRadioParams6G', 'allowedChannels']}
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

    fireEvent.click(screen.getByTestId('160-checkbox-47'))

    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('.isolated')).toBeInTheDocument()
  })

})


const TEST_CHANNEL_DATA = [
  { value: '1', selected: true },
  { value: '5', selected: true },
  { value: '9', selected: true },
  { value: '13', selected: true },
  { value: '17', selected: true },
  { value: '21', selected: true },
  { value: '25', selected: true },
  { value: '29', selected: true },
  { value: '33', selected: true },
  { value: '37', selected: true },
  { value: '41', selected: true },
  { value: '45', selected: true },
  { value: '49', selected: true },
  { value: '53', selected: true },
  { value: '57', selected: true },
  { value: '61', selected: true },
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