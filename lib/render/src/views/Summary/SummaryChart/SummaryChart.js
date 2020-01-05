/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import { Pie } from 'react-chartjs-2';
import PropType from 'prop-types';
import style from './SummaryChart.scss';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import withWidth from '@material-ui/core/withWidth';

import moment from "moment";


import record from '../../../services/record';

class SummaryChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = { piedata: [100, 0, 0], sumTable: [[]], start: null, end: null };
        this.setSummay = ( data ) => {
            this.setState({ piedata: data.piedata, sumTable: data.sumTable, start: data.start, end: data.end });
        };
    }
    render() {
        const pieData = {
                labels: [
                    'Failed',
                    'Broken',
                    'Passed'
                ],
                datasets: [{
                    data: this.state.piedata,
                    borderWidth: 0,
                    backgroundColor: [
                        '#FF0000',
                        '#FFA500',
                        'LimeGreen'
                    ],
                    hoverBackgroundColor: [
                        '#FF0000',
                        '#FFA500',
                        'LimeGreen'
                    ]

                }]
        };
        const xsPieData = {
                labels: [
                    '',
                    '',
                    ''
                ],
                datasets: [{
                    data: this.state.piedata,
                    borderWidth: 0,
                    backgroundColor: [
                        '#FF0000',
                        '#FFA500',
                        'LimeGreen'
                    ],
                    hoverBackgroundColor: [
                        '#FF0000',
                        '#FFA500',
                        'LimeGreen'
                    ]

                }]
        };
        const options = {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 20
                    }
                },
                rotation: -1 * Math.PI,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 20,
                        bottom: -10
                    }
                } };
        return (
            <div style={{ color: "red" }}>
            <Paper className={cx(style.summary)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12} md={6}>
                        <div style={{ height: 5 }}></div>
                        <Pie data={this.props.width == 'xs' ? xsPieData : pieData} options={options} h4w='pie-chart' />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                    <div name='start-end' h4w='test-duration'>
                        <span>{moment(this.state.start).format("YYYY-MM-DD HH:mm:ss")}</span>
                        &nbsp;to&nbsp;<span>{moment(this.state.end).format("HH:mm:ss")}</span>
                    </div>
                    <Table className={cx("list-table", "tr-interlaced")} h4w='table-report-summary'>
                        <TableBody>
                        { this.state.sumTable.map( (row, idx) => (
                            <TableRow className={cx(style.row)} key={idx} h4w={`table-report-summary-tr${idx}`}>
                                { row.map( (td, _idx) => (
                                    <TableCell key={_idx} h4w={`table-report-summary-tr${idx}-td${_idx}`}>{td}</TableCell>
                                )) }
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </Grid>
                </Grid>
            </Paper>
            </div>
        );
    }
    componentDidMount() {
        const summary = record.getSummary();
        const sumTable = [
            ["", "Stories", "Actions", "Verifications"],
            ["Passed", summary.passedStories, summary.passedActs, summary.passedFacts],
            ["Failed", summary.failedStories, "--", summary.failedFacts],
            ["Broken", "--", summary.failedActs, "--"],
            ["Total", summary.totalStories, summary.totalActs, summary.totalFacts],
            ["%", ((summary.passedStories / summary.totalStories) * 100).toFixed(0), ((summary.passedActs / summary.totalActs) * 100).toFixed(0), ((summary.passedFacts / summary.totalFacts) * 100).toFixed(0)]
        ];
        this.setSummay( {
            piedata: [summary.failedFacts, summary.failedActs, summary.passedSteps],
            sumTable: sumTable,
            start: summary.start,
            end: summary.end
        } );
    }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

SummaryChart.defaultProps = {
    propA: "STRING"
};

export default withWidth()(SummaryChart);
