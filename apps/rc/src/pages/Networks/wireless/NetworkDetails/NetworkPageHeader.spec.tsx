import '@testing-library/react';
import { render, screen } from '@acx-ui/test-utils';
import NetworkPageHeader from './NetworkPageHeader';
import { Provider } from '@acx-ui/store';

jest.mock('./ActiveVenueFilter', () => ({
    ActiveVenueFilter: (setSelectedVenues?: CallableFunction, selectedVenues?: string[]) =>
        <div>Active Venue Filter</div>
}))

describe('NetworkPageHeader', () => {
  it('should render correctly in overview', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview',
          },
        },
      }
    );
    const dateFilter = await screen.findAllByPlaceholderText('Start date');
    expect(dateFilter).toHaveLength(1);
  });

  it('should render without datefilter in aps/venue', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'aps',
          },
        },
      }
    );
    const dateFilter = screen.queryByPlaceholderText('Start date');
    expect(dateFilter).not.toBeInTheDocument();
  });
});
