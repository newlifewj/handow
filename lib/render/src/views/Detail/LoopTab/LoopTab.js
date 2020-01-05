/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

import style from './LoopTab.scss';

export default class LoopTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: 0 };
        this.changeTab = (e, idx) => {
            if (idx !== this.state.activeTab) {
                this.setState({ activeTab: idx });
                this.props.changeTab(idx);
            }
        };
    }
    render() {
        const loopStatus = [];
        for ( const lp of this.props.loop ) {
            let status = true;
            for ( const act of lp.acts ) {
                if (!act.status) {
                    status = false;
                }
            }
            for ( const fact of lp.facts ) {
                if (!fact.status) {
                    status = false;
                }
            }
            loopStatus.push(status);
        }
        const tabClass = this.props.size === 'md' ? "mdtab" : "smtab";
        const activeColor = this.props.size === 'md' ? "lightgrey" : "white";
        const inactiveColor = this.props.size === 'md' ? "white" : "lightgrey";
        return (
            <div className={cx(style[`${tabClass}`], 'cpnt-loop-tab')}>
                { this.props.loop.map( (lp, idx) => (
                    <div name={`Loop-${idx + 1}`} key={idx} h4w={`loop-${idx + 1}`}
                        style={{ color: loopStatus[idx] ? 'green' : 'red',
                                backgroundColor: this.state.activeTab === idx ? activeColor : inactiveColor }}
                        onClick={(e) => this.changeTab(e, idx)}>
                        Loop-{idx + 1}
                    </div>
                ))}
            </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

LoopTab.defaultProps = {
    propA: "STRING"
};
