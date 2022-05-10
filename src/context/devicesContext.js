import React from 'react';

/**
 * This is the context shared from DevicePanel to all its children.
 * This context is used to avoid passing props down the chain.
 * @type {React.Context<unknown>}
 */
const DevicesContext = React.createContext();

export { DevicesContext as default };
