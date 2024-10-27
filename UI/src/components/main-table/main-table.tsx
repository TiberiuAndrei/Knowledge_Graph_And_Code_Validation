import mainTableStyles from './main-table.module.css'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const MainTable = (props: any) => {
    const [searchTerm, setSearchTerm] = useState('');

    const router = useRouter();

    const handleSearchChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const handleClick = (current: any) => {
        sessionStorage.setItem('requirementData', JSON.stringify(current));
        router.push('/DesignRequirement');
    };

    let filteredData:any[] = [];
    
    if (props.value == "complete") {
        if (searchTerm != '') {
            filteredData = props.data["Complete"].filter((item: any) => item.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        else {
            filteredData = props.data["Complete"];
        }
    }
    else {
        if (searchTerm != '') {
            filteredData = props.data["Incomplete"].filter((item: any) => item["requirement"].toLowerCase().includes(searchTerm.toLowerCase()));
        }
        else {
            filteredData = props.data["Incomplete"];
        }
    }

    return (
        <div className={mainTableStyles["flex-wrapper"]}>
            <div className={mainTableStyles["banner"]}>{props.label}</div>
            <div className={mainTableStyles["search-bar"]}>
                <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder='Search design requirement' className={mainTableStyles["main-search-bar"]} />
            </div>
            <div className={mainTableStyles["table-wrapper"]}>
                <table className={mainTableStyles["main-table"]}>
                    <tbody>
                        {props.value == "complete" ? filteredData.map(current => (<tr><td>{current}</td></tr>)) : 
                            filteredData.map(current => (<tr onClick={() => {handleClick(current)}}><td>{current["requirement"]}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}