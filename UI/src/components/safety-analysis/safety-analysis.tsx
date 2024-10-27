import mainTableStyles from './safety-analysis.module.css';

// safetyAnalysisData will be received from an API call when moving from PoC to Production
const safetyAnalysisData = ['wRrAxlAngleI_CharacteristicYNvM_xas16', 'MathLibI_AsymmetricSaturation_Int', 'mlAbsU32', 'EvtHstI_HlSetEventEntry',
    'sSetValueDataInvI_ErrLvl_Red_xdu8', 'sSetValueDataInvI_ErrLvl_xdu8', 'wSetValueI_SetValue_xds16', 'SetValue'];

export const SafetyAnalysis = (props: any) => {

    return (
        <div>
        <div className={mainTableStyles["flex-wrapper"]}>
            <div className={mainTableStyles["banner"]}>EA Blackbox components which are not referenced in the Safety Analysis</div>
            <div className={mainTableStyles["table-wrapper-1"]}>
                <table className={mainTableStyles["main-table"]}>
                    <tbody>
                        {safetyAnalysisData.map(current => (<tr><td>{current}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    )
}