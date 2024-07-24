import { render, screen } from '@acx-ui/test-utils';
import '@testing-library/jest-dom/extend-expect';
import { TimeDropdown } from '.';
import { IntlProvider } from 'react-intl';


const messages = {
  'Please enter hour': 'Please enter hour',
  'Select hour': 'Select hour',
  'Please enter day': 'Please enter day',
  'Select day': 'Select day'
};

const renderWithIntl = (component) => {
  return render(<IntlProvider locale="en" messages={messages}>{component}</IntlProvider>);
};

describe('TimeDropdown', () => {
  it('renders DailySchedule correctly', () => {
    const name = 'testName';
    renderWithIntl(<TimeDropdown />);
    renderWithIntl(<TimeDropdown.DailySchedule name={name} />);

    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument();
    expect(screen.getByText('Please enter hour')).toBeInTheDocument();
  });

  it('renders WeeklySchedule correctly', () => {
    const name = 'testName';
    renderWithIntl(<TimeDropdown />);
    renderWithIntl(<TimeDropdown.WeeklySchedule name={name} />);

    expect(screen.getByPlaceholderText('Select day')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument();
    expect(screen.getByText('Please enter day')).toBeInTheDocument();
    expect(screen.getByText('Please enter hour')).toBeInTheDocument();
  });

  it('renders MonthlySchedule correctly', () => {
    const name = 'testName';
    renderWithIntl(<TimeDropdown />);
    renderWithIntl(<TimeDropdown.MonthlySchedule name={name} />);

    expect(screen.getByPlaceholderText('Select day')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument();
    expect(screen.getByText('Please enter day')).toBeInTheDocument();
    expect(screen.getByText('Please enter hour')).toBeInTheDocument();
  });
});