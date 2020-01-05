/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import Close from "@material-ui/icons/Close";
import Grid from '@material-ui/core/Grid';

import PropType from 'prop-types';

import style from './ScreenPlay.scss';

export default class ScreenPlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div>
                <img src={this.props.scPath} width='100%' alt='screenshot'></img>
            </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

ScreenPlay.defaultProps = {
    propA: "STRING"
};
