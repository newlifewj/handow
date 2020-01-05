
import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import style from './Foot.scss';
import PropType from 'prop-types';


export default class Foot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className={cx(style.foot)}>
                <p>
                    &copy;&nbsp;<span>{ new Date().toISOString().split("-")[0] }</span>&nbsp;
                    <span>
                        <FmtMsg id="Foot.copyright" />
                    </span>
                </p>
                <i className={cx(style.support)}>
                    <FmtMsg id="Foot.support" />
                </i>
            </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

Foot.defaultProps = {
    propA: "STRING"
};
