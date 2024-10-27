import { useEffect, useState } from 'react';
import styles from './layout.module.css'
import { MainTable } from '../main-table/main-table';
import Grid from '../resizable/resizable';
import { Statistcs } from '../statistics/statistics';
import jsonData from '../../data/data.json';
import { CodeValidation } from '../code-validation/code-validation';
import { TestReport } from '../test-report/test-report';
import { SafetyAnalysis } from '../safety-analysis/safety-analysis';

export const Layout = () => {
    const displayOptions = [
        {value: 'complete', label: 'Complete Design Requirements'},
        {value: 'incomplete', label: 'Incomplete Design Requirements'},
        {value: 'timelapse', label: 'Timelapse'},
        {value: 'statistics', label: 'Statistics'},
        {value: 'code-validation', label: 'Code Validation'},
        {value: 'test-report', label: 'Test Report'},
        {value: 'safety-analysis', label: 'Safety Analysis'},
    ]

    const dateOptions = [
        {value: '12_16_2023', label: 'Show reports for date: 12/16/2023'},
        {value: '1_16_2024', label: 'Show reports for date: 1/16/2024'},
        {value: '2_16_2024', label: 'Show reports for date: 2/16/2024'},
        {value: '6_19_2024', label: 'Show reports for date: 6/19/2024'},
        {value: '8_18_2024', label: 'Show reports for date: 8/18/2024'},
    ]

    const [state, setState] = useState({
        displayValue: '',
        dateValue: '',
        data: {}
    });

    useEffect(() => {
        let displayValue = sessionStorage.getItem('display');
        if (!displayValue) {
            displayValue = displayOptions[0].value
        }

        let dateValue = sessionStorage.getItem('date');
        if (!dateValue) {
            dateValue = dateOptions[4].value;
        }
        const data = jsonData[dateValue as keyof typeof jsonData];

        setState(previousState => ({...previousState, displayValue, dateValue, data}))

    }, [])

    const handleDisplayDropdownChange = (event:any) => {
        sessionStorage.setItem('display', event.target.value)

        setState(previousState => ({...previousState, displayValue: event.target.value}));
    }

    const handleDateDropdownChange = (event:any) => {
        sessionStorage.setItem('date', event.target.value)

        setState(previousState => ({...previousState, dateValue: event.target.value, data: jsonData[event.target.value as keyof typeof jsonData]}));
    }

    return (
        <div className={styles["layout-wrapper"]}>
            <div className={styles["flex-wrapper"]}>
                <div className={styles["drop-downs-wrapper"]}>

                    <select value={state.dateValue} onChange={handleDateDropdownChange} className={styles["main-drop-down"]}>
                        {dateOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>


                    <select value={state.displayValue} onChange={handleDisplayDropdownChange}>
                        {displayOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {state.displayValue === 'complete' && <MainTable {...displayOptions[0]} data={state.data} />}
                {state.displayValue === 'incomplete' && <MainTable {...displayOptions[1]} data={state.data}/>}
            </div>
            {state.displayValue === 'timelapse' && <div className={styles["grid-wrapper"]}><Grid/></div>}
            {state.displayValue === 'statistics' && <Statistcs data={state.data}/>}
            {state.displayValue === 'code-validation' && <CodeValidation data={state.data}/>}
            {state.displayValue === 'test-report' && <TestReport data={state.data}/>}
            {state.displayValue === 'safety-analysis' && <SafetyAnalysis data={state.data}/>}
        </div>
    )
}