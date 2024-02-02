import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

export default function SearchBox({ className, placeholder, onClick, onSearch }) {
    
    return (<div className={`flex ${className}`}>
        <input placeholder={placeholder || "Search"} className="border-gray-300 border-x border-y px-2 w-full" onChange={(e) => onSearch && onSearch(e.target.value)} />
        <FontAwesomeIcon className="ml-2" icon={faMagnifyingGlass} height={32} onClick={() => onClick && onClick(text)} />
    </div>);


}