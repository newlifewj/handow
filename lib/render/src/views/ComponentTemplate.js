/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

export default class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div>
            </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

Component.defaultProps = {
    propA: "STRING"
};
