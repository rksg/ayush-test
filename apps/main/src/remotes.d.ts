// Declare your remote Modules here
// Example declare module 'about/Module';
type AnalyticsFilter = {
   startDate: string;
   endDate: string;
   range: DateRange;
   path: Readonly<NetworkPath>;
}

interface NetworkPath extends Array<{ type: string; name: string }> {}
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
  // refer to modulefederation.config.js for correct mapping
  function Widgets (props: { name: string, filters: AnalyticsFilter }): React.ReactElement
  export = Widgets
}