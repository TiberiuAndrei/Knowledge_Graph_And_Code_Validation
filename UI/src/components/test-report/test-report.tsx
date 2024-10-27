import mainTableStyles from './test-report.module.css';

// regressionReportData & testData will be received from an API call when moving from PoC to Production
const regressionReportData = ['VCar is N/A', 'BTC-MIL is N/A', 'BTC-SIL is N/A', 'BTC-B2B is N/A', 'BTC-Coverage is N/A'];
const testData = ['All integration tests for current module are used at least once'];

export const TestReport = (props: any) => {

    return (
        <div>
        <div className={mainTableStyles["flex-wrapper"]}>
            <div className={mainTableStyles["banner"]}>HTML Regression Check Fails</div>
            <div className={mainTableStyles["table-wrapper-1"]}>
                <table className={mainTableStyles["main-table"]}>
                    <tbody>
                        {regressionReportData.map(current => (<tr><td>{current}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className={mainTableStyles["flex-wrapper"]}>
            <div className={mainTableStyles["banner"]}>Integration tests which are not used at least once</div>
            <div className={mainTableStyles["table-wrapper-2"]}>
                <table className={mainTableStyles["main-table"]}>
                    <tbody>
                        {testData.map(current => (<tr><td>{current}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    )
}