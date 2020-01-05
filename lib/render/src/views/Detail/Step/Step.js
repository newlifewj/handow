/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

import CheckCircle from '@material-ui/icons/CheckCircleOutline';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import Cancel from '@material-ui/icons/Cancel';
import Badge from "@material-ui/core/Badge";
import AttachFile from "@material-ui/icons/AttachFile";

import { withStyles } from "@material-ui/core/styles";
import withWidth from '@material-ui/core/withWidth';

import style from './Step.scss';

const StyledBadge1 = withStyles( (theme) => ({
    badge: {
      fontSize: 12,
      right: 5,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: "5px 4px"
    }
  }))(Badge);

class Step extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className={cx(style.step)}>
                <div>
                    <div style={{ whiteSpace: 'nowrap', display: 'inline-block', width: this.props.width == 'xs' ? '72%' : this.props.width == 'sm' ? '80%' : '90%', overflowX: 'hidden' }}>
                        { this.props.step.status
                            ? ( <CheckCircle name='icon'  style={{ color: 'green', verticalAlign: 'middle' }} h4w='icon-step-passed' /> )
                            : ( <Cancel name='icon'  style={{ color: 'red', verticalAlign: 'middle' }} h4w='icon-step-failed' /> )
                        }

                        <div className={cx(style.title)} h4w='step-title'
                                dangerouslySetInnerHTML={{ __html: this.props.step.title }}>
                        </div>
                    </div>
                    { this.props.type === 'act' &&
                        <StyledBadge1 badgeContent={`${Math.ceil( ((this.props.step.end - this.props.step.start) / 1000) )}s`}
                            color="secondary" h4w='step-time-bage' style={{ float: 'right' }}>
                            { this.props.step.cookies && ( this.props.step.cookies.length == 1 && this.props.step.cookies[0] !== {} ) &&
                                <div className={cx(style.cookiesIcon)}  h4w='open-cookies-entry' title='Cookies of current view'
                                    onClick={(e) => this.props.openPop("cookies", this.props.step)}>
                                </div>
                            }
                            { this.props.step.xhr &&
                                <div className={cx(style.xhrIcon)} h4w='open-xhr-entry' title='XHR record'
                                    onClick={(e) => this.props.openPop("xhr", this.props.step)}>
                                    <AttachFile name='icon' color='primary' h4w='xhr-data-icon' />
                                </div>
                            }
                            { this.props.step.screen &&
                                <div className={cx(style.screenIcon)} h4w='open-screen-entry'
                                    onClick={(e) => this.props.openPop("screen", this.props.step)}>
                                    <img src={this.props.step.screen} width='30px' alt=' ' h4w='img-screen-thumbnail' title='Screenshot post action'></img>
                                </div>
                            }
                        </StyledBadge1>
                    }
                </div>
                { !this.props.step.status &&
                    <div style={{ fontSize: '14px', marginLeft: '28px', color: 'Crimson' }} h4w='step-error-trace'>
                        <ErrorOutline style={{ fontSize: '18px', verticalAlign: 'middle', marginTop: '-3px', marginRight: '4px' }} />
                        {this.props.step.info.error}
                        { this.props.step.info.errAttachment &&
                            <div style={{ color: 'dimgray', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{this.props.step.info.errAttachment}</div>
                        }
                    </div>
                }
            </div>
        );
    }
    componentDidMount() {}
    componentDidUpdate() {

    }
    componentWillUnmount() { this.setState = () => {}; }
}

Step.defaultProps = {
    propA: "STRING"
};

export default withWidth()(Step);
