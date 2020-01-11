import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Prompt,
    Redirect,
    Link,
    NavLink
  } from 'react-router-dom';
// import { browserHistory as history } from 'react-router'
import cx from 'classnames';
import joinURL from 'url-join';
import eventBus from './services/EventBus.js';

export { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, cx, joinURL, eventBus };