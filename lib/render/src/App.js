
import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from './Depends.js';

import { IntlProvider, addLocaleData } from 'react-intl';
import locale_en from 'react-intl/locale-data/en';
import locale_fr from 'react-intl/locale-data/fr';

import message_en from './i18n/en.json';
import message_fr from './i18n/fr.json';

import { MuiThemeProvider } from '@material-ui/core/styles';
import './scss/global.scss';

import Head from './views/Head/Head';
import Foot from './views/Foot/Foot';
import MainZone from './views/MainZone/MainZone';

import customTheme from "./customTheme";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    addLocaleData([...locale_en, ...locale_fr]);

    this.state = {
      locale: 'en',
      storyTitle: null
    };

    this.switchLocale = ( key ) => {
      this.setState( { locale: key } );
    };
    // Focus on any elelent will come here except propagation was stopped.
    this.focusChange = ( e ) => {
      eventBus.emit( eventBus.labels.focusChanged );
    };

  }

  componentDidMount() {
    eventBus.on( "locale_change", (key) => {
      this.switchLocale(key);
    } );
    window.scrollTo(0, 0);
  }
  render() {
    return (
      <IntlProvider locale={this.state.locale} messages={this.props.msg[this.state.locale]}>
        <MuiThemeProvider theme={customTheme}>
        <div>
          <Head />
          <MainZone locale={this.state.locale} />
          <Foot />
        </div>
        </MuiThemeProvider>
      </IntlProvider>
    );
  }
}

App.defaultProps = {
  msg: {
    en: message_en,
    fr: message_fr
  }
};

/*
  redirect to different per login/profile //
*/