import { useState, useEffect } from 'react';

// actions and initial state are set up in products-store.js

// these only exist once in this application, in this file
// they only exist once in the application lifetime
// they are shared in the entire application (the data in them)
// managing state globally with just react and javascript
let globalState = {};
// an array of functions that can be called to update all components 
// that are using this hook
let listeners = [];
// actions objects where our actions are registered
// with keys which match the actionIdentifier
let actions = {};

// custom hook
// everything that uses this hook gets the same shared data
export const useStore = (shouldListen = true) => {
  // any component that uses this hook, when setState
  // is called, it will re-render
  const setState = useState(globalState)[1];

  // similar to what we would do in redux
  // forward payload to the action function as well
  const dispatch = (actionIdentifier, payload) => {
    // performs an action based on the actionIdentifier and stores this
    // as the new state
    const newState = actions[actionIdentifier](globalState, payload);
    // global state becomes the old state plus all the updates in the new state
    globalState = { ...globalState, ...newState };

    // use our updated global state and put it in the listeners
    for (const listener of listeners) {
      listener(globalState);
    }
  };

  // check to see if the component is unmounted and get rid of the
  // listeners if it is unmounted, if it is amounted, add to listeners
  useEffect(() => {
    if (shouldListen) {
      // add this function to the shared listeners array
      listeners.push(setState);
    }

    return () => {
      if (shouldListen) {
        // remove from the listeners array if component is unmounted
        listeners = listeners.filter(li => li !== setState);
      }
    };
  }, [setState, shouldListen]);

  return [globalState, dispatch];
};

// so we can change the actions
// this is where we can register the user's actions
export const initStore = (userActions, initialState) => {
  if (initialState) { // if this is not null
    globalState = { ...globalState, ...initialState };
  }
  actions = { ...actions, ...userActions };
};
