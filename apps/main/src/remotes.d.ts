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
  // refer to modulefederation.config.js for correct mapping
  function Widgets (props: { name: string, filters?: any }): React.ReactElement
  export = Widgets
}