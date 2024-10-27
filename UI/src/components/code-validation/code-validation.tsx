import mainTableStyles from './code-validation.module.css';

// flowChartData & blackboxData will be received from an API call when moving from PoC to Production
const flowChartData = ['All conditions are implemented'];
const blackboxData = ['All conditions are implemented'];

export const CodeValidation = (props: any) => {

    return (
        <div>
        <div className={mainTableStyles["flex-wrapper"]}>
            <div className={mainTableStyles["banner"]}>EA Flow Chart Conditions which are not implemented</div>
            <div className={mainTableStyles["table-wrapper-1"]}>
                <table className={mainTableStyles["main-table"]}>
                    <tbody>
                        {flowChartData.map(current => (<tr><td>{current}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className={mainTableStyles["flex-wrapper"]}>
            <div className={mainTableStyles["banner"]}>Blackbox components which are missing from code implementation</div>
            <div className={mainTableStyles["table-wrapper-2"]}>
                <table className={mainTableStyles["main-table"]}>
                    <tbody>
                        {blackboxData.map(current => (<tr><td>{current}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    )
}