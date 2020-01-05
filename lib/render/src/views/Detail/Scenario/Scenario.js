/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

import moment from "moment";
import _ from "lodash";

import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from "@material-ui/core/DialogContent";
import GivenLabel from "@material-ui/icons/Label";
import WhenLabel from "@material-ui/icons/LabelImportant";
import PhaseMore from "@material-ui/icons/MoreHoriz";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import ScreenPlay from "../../ScreenPlay/ScreenPlay";
import Step from "../Step/Step";
import LoopTab from "../LoopTab/LoopTab";
import XHRDetail from "../../XHRDetail/XHRDetail";
import CookieList from "../../CookieList/CookieList";

import withWidth from '@material-ui/core/withWidth';

import style from './scenario.scss';

class Scenario extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            expandSteps: false,
            popOpen: 'none',
            screen: null,      // screenshot path of a step
            xhr: null,          // current xhr record object after any XHR call act
            cookies: null,      // current cookies after an act
            stepTitle: "jjj",
            expandParams: false
        };

        this.expToggle = () => {
            this.setState({ expandSteps: !this.state.expandSteps });
        };

        this.changeTab = (idx) => {
            if ( idx !== this.state.activeTab ) {
                this.setState({ activeTab: idx });
            }
        };

        this.openPop = ( type, step ) => {
            if (type == 'screen') {
                this.setState({ popOpen: "screen", screen: step.screen, stepTitle: step.title });
            } else if (type == 'xhr') {
                this.setState({ popOpen: "xhr", xhr: step.xhr, stepTitle: step.title });
            } else if (type == 'cookies') {
                this.setState({ popOpen: "cookies", cookies: step.cookies, stepTitle: step.title });
            } else {
                // do nothing
            }
        };

        this.closePop = () => {
            this.setState({ popOpen: "none" });
        };

        this.expandParams = () => {
            this.setState({ expandParams: true });
        };
        this.unexpandParams = () => {
            this.setState({ expandParams: false });
        };
    }
    render() {
        let phaseStatus = true;
        let actsBroken = 0;
        let factsFailed = 0;

        const phaseStart = this.props.phase.loop[0].acts[0].start;
        const phaseEnd = this.props.phase.loop[this.props.phase.loop.length - 1].facts[this.props.phase.loop[this.props.phase.loop.length - 1].facts.length - 1].end;

        for ( const lp of this.props.phase.loop ) {
            for (const step of lp.acts) {
                !step.status && ( phaseStatus = false );
                // phaseStatus = step.status;
                !step.status && actsBroken++;
            }
            for (const step of lp.facts) {
                !step.status && ( phaseStatus = false );
                !step.status && factsFailed++;
            }
        }

        return (
        <div className="cpnt-scenario">
            <Grid container className={cx(style.phaseLabel)} style={{ whiteSpace: (this.props.width == 'xs' || this.props.width == 'sm') ? 'nowrap' : 'normal' }}>
                <Grid item xs={12} sm={12} md={7} onClick={(this.expToggle)}>
                { this.props.type === 'given'
                    ? <GivenLabel name='icon' style={{ color: phaseStatus ? 'green' : 'red' }} h4w='icon-given-phase' />
                    : <WhenLabel name='icon' style={{ color: phaseStatus ? 'green' : 'red' }}  h4w='icon-when-phase' />
                }
                    <div h4w='phase-title' name='phase-title'>
                        {this.props.phase.scenario}
                    </div>
                    <PhaseMore name='icon' style={{ color: phaseStatus ? 'green' : 'red' }} h4w='icon-more-dots-expend' />
                </Grid>
                <Grid item xs={12} sm={12} md={5} style={{ textAlign: "right", marginTop: (this.props.width == 'xs' || this.props.width == 'sm') ? '-12px' : '0px' }}>
                    <div h4w='phase-info' name='phase-info'>
                        <div className={cx(style.phaseTiming)} h4w='phase-timing'>
                        <span>{moment(phaseStart).format("YYYY-MM-DD HH:mm:ss")}</span>
                        &nbsp;-&nbsp;<span>{moment(phaseEnd).format("HH:mm:ss")}</span>
                        &nbsp;(<b>{Math.round((phaseEnd - phaseStart) / 1000)}</b> seconds)
                        </div>
                        <Hidden only={['sm', 'xs']}>
                        <div className={cx(style.phaseStatus)} h4w='phase-status'>
                            { (this.props.phase.loop.length > 1) &&
                                <i h4w='phase-loop-count'>Phase was looped <b h4w='phase-loop-count-number'>{this.props.phase.loop.length}</b> times.&nbsp;</i>
                            }
                            { ( actsBroken === 0 && factsFailed === 0 ) &&
                                <i h4w='all-steps-passed'>All steps passed</i>
                            }
                            { ( actsBroken > 0 || factsFailed > 0 ) &&
                                <i h4w='steps-broken-failed'><b h4w='acts-broken-count-number'>{actsBroken}</b> actions are broken, <b h4w='facts-failed-count-number'>{factsFailed}</b> verifications are failed.</i>
                            }
                        </div>
                        </Hidden>
                    </div>
                </Grid>
            </Grid>
            <Grid container className={cx(style.steps)} style={{ display: this.state.expandSteps ? 'block' : 'none' }}>
                { this.props.phase.loop.length > 1 &&
                    <LoopTab size='sm' loop={this.props.phase.loop} changeTab={this.changeTab} h4w='when-phase-loop-tab' />
                }

                { ( this.props.phase.loop[this.state.activeTab].parameters
                    && !_.isEmpty( this.props.phase.loop[this.state.activeTab].parameters ) ) &&
                    <div name='params-kv-container'>
                        <div className={cx(style.paramsTitle)} h4w='phase-params-title'>
                            Parameters in phase scope
                        </div>

                        { this.state.expandParams
                            ?    <div onClick={ this.unexpandParams } h4w='phase-params-hide' style={{ display: 'inline-block' }}>
                                    <ExpandLess className={cx(style.paramsIcon)} />
                                </div>
                            :   <div onClick={ this.expandParams } h4w='phase-params-show' style={{ display: 'inline-block' }}>
                                    <ExpandMore className={cx(style.paramsIcon)} />
                                </div>
                        }
                        { this.state.expandParams &&
                            <pre className={cx(style.params)} h4w='phase-params'>
                                {JSON.stringify(this.props.phase.loop[this.state.activeTab].parameters, null, 2)}
                            </pre>
                        }

                    </div>
                }

                <Grid item xs={12} style={{ paddingLeft: '6px' }}>
                        { this.props.phase.loop[this.state.activeTab].acts.map( (act, idx) => (
                                <Step step={act} type='act' openPop={this.openPop} key={idx} h4w='ctner-act-step' />
                        ))}
                        { this.props.phase.loop[this.state.activeTab].facts.map( (fact, idx) => (
                                <Step step={fact} type='fact' openPop={this.openPop} key={idx} h4w='ctner-act-step' />
                        ))}
                </Grid>
            </Grid>

            <Dialog onClose={this.closePop} aria-labelledby="customized-dialog-title" maxWidth="lg" fullWidth={true}
                open={this.state.popOpen == 'screen' || this.state.popOpen == 'xhr' || this.state.popOpen == 'cookies'}>
                <MuiDialogTitle disableTypography style={{ padding: '10px 20px 5px 20px', backgroundColor: "ghostwhite" }}>
                        { this.state.popOpen == 'screen' &&
                            <div className={cx(style.dialogTitle)} dangerouslySetInnerHTML={{ __html: this.state.stepTitle }}></div>
                        }
                        { this.state.popOpen == 'xhr' && <div className={cx(style.dialogTitle)}>XHR communication record</div> }
                        { this.state.popOpen == 'cookies' && <div className={cx(style.dialogTitle)}>Cookies after step finished</div> }
                    <IconButton className={cx(style.dialogCloseBtn)} size="small" onClick={this.closePop} style={{ position: 'absolute', right: '3px' }}>
                        <CloseIcon />
                    </IconButton>
                </MuiDialogTitle>
                <MuiDialogContent dividers style={{ padding: '0px' }}>
                { this.state.popOpen == 'screen' &&
                    <ScreenPlay scPath={this.state.screen} close={this.closePop} h4w='content-screen-pop' />
                }
                { this.state.popOpen == 'xhr' &&
                    <XHRDetail resp={this.state.xhr} close={this.closePop} h4w='content-xhr-pop' />
                }
                { this.state.popOpen == 'cookies' &&
                    <CookieList cookies={this.state.cookies} close={this.closePop} h4w='content-cookies-pop' />
                }
                </MuiDialogContent>
            </Dialog>

        </div>
        );
    }
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

Scenario.defaultProps = {
    propA: "STRING"
};

export default withWidth()(Scenario);
