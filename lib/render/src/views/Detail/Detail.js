/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

import Button from '@material-ui/core/Button';

import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import Scenario from './Scenario/Scenario';

import LoopTab from './LoopTab/LoopTab';
import record from '../../services/record.js';

import style from './Detail.scss';

export default class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            expandParams: false,
            showParams: false,
            givenPhase: {
                scenario: this.props.story.given.scenario,
                loop: [{
                    parameters: null,
                    acts: this.props.story.given.loop[0].acts,
                    facts: this.props.story.given.loop[0].facts
                }]
            }
        };

        this.changeTab = (idx) => {
            if ( idx !== this.state.activeTab ) {
                this.presetGivenPhase(idx);
                this.setState({ activeTab: idx });
            }
        };

        this.toggleParams = () => {
            this.setState({ showParams: !this.state.showParams });
        };

        this.expandParams = () => {
            this.setState({ expandParams: true });
        };
        this.unexpandParams = () => {
            this.setState({ expandParams: false });
        };

        // Process special given to be constistent with whens
        this.presetGivenPhase = (idx) => {
            this.setState({ givenPhase: {
                scenario: this.props.story.given.scenario,
                loop: [{
                    parameters: null,
                    acts: this.props.story.given.loop[idx].acts,
                    facts: this.props.story.given.loop[idx].facts
                }]
            } });
        };
    }
    render() {
        return (
            <div className={cx('cpnt-story-details', this.state.showParams ? style.paramsCtrlShow : style.paramsCtrlHide)}>
                <Button className={cx(style.paramsCtrlBtn)} variant="outlined" h4w='params-show-hide-toggle'
                        size="small" color="secondary" onClick={this.toggleParams}>
                    { this.state.showParams
                      ? ( <span>Hide Parameters</span> )
                      : ( <span>Show Parameters</span> )
                    }
                </Button>

                { (this.props.story.given.loop.length > 1) &&
                    <LoopTab size='md' id='story-loop-tab' h4w='story-loop-tab'
                            loop={this.props.story.given.loop} changeTab={this.changeTab}/>
                }
                <div style={{ fontSize: '14px' }}>
                    { ( this.props.story.given.loop[this.state.activeTab].parameters
                            && this.props.story.given.loop[[this.state.activeTab]].parameters != {} ) &&
                        <div name='params-kv-container' h4w='story-params-ctner'>
                            <div className={cx(style.paramsTitle)}> Parameters in story scope</div>
                            <div h4w='story-params-show-hide' style={{ display: 'inline-block' }}>
                            { !this.state.expandParams &&
                                <div onClick={ this.expandParams } h4w='story-params-show'>
                                    <ExpandMore className={cx(style.paramsIcon)} />
                                </div>
                            }
                            { this.state.expandParams &&
                                <div onClick={ this.unexpandParams } h4w='story-params-hide'>
                                    <ExpandLess className={cx(style.paramsIcon)} />
                                </div>
                            }
                            </div>
                            { this.state.expandParams &&
                                <pre className={cx(style.params)} h4w='story-params'>
                                    {JSON.stringify(this.props.story.given.loop[this.state.activeTab].parameters, null, 2)}
                                </pre>
                            }
                        </div>
                    }
                </div>
                <Scenario phase={this.state.givenPhase} type='given' h4w='ctner-given-phase' />

                { this.props.story.given.loop[this.state.activeTab].whens.map( (wlp, idx) => (
                    <Scenario phase={wlp} type='when' key={idx} h4w='ctner-when-phase' />
                ))}

            </div>
        );
    }
    componentDidMount() {
    }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

Detail.defaultProps = {
    propA: "STRING"
};
