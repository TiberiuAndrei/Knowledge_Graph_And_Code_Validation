import styles from './secondary-table.module.css'

import { useEffect, useState } from 'react'

export const SecondaryTable = () => {
    const [data, setData] = useState<any>({});

    useEffect(() => {
        const requirementData = sessionStorage.getItem('requirementData');
        if (requirementData) {
            setData(JSON.parse(requirementData));
        }
    }, []);

    return (
        <div className={styles["layout-wrapper"]}>
            <div className={styles["flex-wrapper"]}>
                <div className={styles["banner"]}>
                    <div className={styles["banner-item"]}>
                        {data["requirement"]}
                    </div>
                    <div className={styles["banner-item"]}>
                        Reasons of failure:
                    </div>
                </div>
                <div className={styles["table-wrapper"]}>
                    <table className={styles["main-table"]}>
                        <tbody>
                            {data["reasons"] ? data["reasons"].map((reason:any) => <tr><td>{reason}</td></tr>) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}