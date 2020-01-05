/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

import Close from "@material-ui/icons/Close";
import Paper from '@material-ui/core/Paper';

import style from './XHRDetail.scss';

export default class XHRDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className={cx(style.xhrpanel)}>
                <div>
                    <span>{this.props.resp.request.method}</span>&nbsp;
                    <span style={{ fontFamily: "monospace" }}>{this.props.resp.request.path}</span>
                </div>
                <div>
                    <span>Response Status</span>&nbsp;
                    <span style={{ fontFamily: "monospace" }}>{this.props.resp.status}</span>
                </div>
                <div>
                    Response Body
                    <pre>
                        {JSON.stringify(this.props.resp.data, null, 2)}
                    </pre>
                </div>
                <div>
                    Response Headers
                    <pre>
                        {JSON.stringify(this.props.resp.headers, null, 2)}
                    </pre>
                </div>
                { this.props.resp.request.headers &&
                    <div>
                        Resquest Headers
                        <pre>
                            {JSON.stringify(this.props.resp.request.headers, null, 2)}
                        </pre>
                    </div>
                }
                { this.props.resp.request.data &&
                    <div>
                        Resquest Body
                        <pre>
                            {JSON.stringify(this.props.resp.request.data, null, 2)}
                        </pre>
                    </div>
                }
            </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

XHRDetail.defaultProps = {
    propA: "STRING"
};
