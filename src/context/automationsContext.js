import React from 'react';

/**
 * This is the context shared from ScenesPanel to all its children.
 * This context is used to avoid passing props down the chain.
 * @type {React.Context<unknown>}
 */
const AutomationsContext = React.createContext();

export { AutomationsContext as default };
