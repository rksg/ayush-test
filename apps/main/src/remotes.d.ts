// Declare your remote Modules here
// Example declare module 'about/Module';

declare module 'rc/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
declare module 'analytics/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
declare module 'msp/Routes' {
  // refer to modulefederation.config.js for correct mapping
  function Routes (): React.ReactElement
  export = Routes
}
