// Declare your remote Modules here
// Example declare module 'about/Module';

declare module 'rc/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
declare module 'rc/Widgets' {
  // refer to modulefederation.config.js for correct mapping
  function Widgets (props: { name: string }): React.ReactElement
  export = Widgets
}
declare module 'analytics/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
declare module 'analytics/Widgets' {
  // eslint-disable-next-line align-import/align-import
  import type { AnalyticsFilter } from '@acx-ui/analytics/utils'
  // eslint-disable-next-line align-import/align-import
  import type { DashboardFilter } from '@acx-ui/utils'

  // refer to modulefederation.config.js for correct mapping
  function Widgets (props: {
    name: string;
    filters: AnalyticsFilter | DashboardFilter;
  }): React.ReactElement
  export = Widgets
}
declare module 'msp/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
declare module 'msp/Widgets' {
  // refer to modulefederation.config.js for correct mapping
  function Widgets (props: { name: string }): React.ReactElement
  export = Widgets
}
