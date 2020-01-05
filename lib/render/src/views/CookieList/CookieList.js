/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';
import Close from "@material-ui/icons/Close";

import moment from "moment";

import style from './CookieList.scss';

export default class CookieList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className={cx(style.cookiepanel)}>
                { this.props.cookies.map( (cookie, idx) => {
                    let sCk = { ...cookie };
                    delete sCk.name;
                    delete sCk.domain;
                    delete sCk.path;
                    sCk.expires = moment(Math.round(sCk.expires * 1000)).format("YYYY-MM-DD HH:mm:ss");
                    return (
                        <div key={idx} h4w='ctner-cookies-popover'>
                            <div>
                                <b>{cookie.name}</b>
                                &nbsp;|&nbsp;
                                <span style={{ fontFamily: "monospace" }}>{cookie.domain}{cookie.path}</span>
                            </div>
                            <pre>
                                {JSON.stringify(sCk, null, 2)}
                            </pre>
                        </div>);
                }) }
            </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

CookieList.defaultProps = {
    propA: "STRING"
};
