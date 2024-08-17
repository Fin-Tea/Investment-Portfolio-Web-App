import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'

export default function AccountInfo({ className, id, platform, accountName, onDelete}) {
 return (<div className={`flex w-full border rounded-sm px-4 py-2  ${className}`}>
    <div className="flex w-full flex-col">
        <h5>{platform}</h5>
        <p className='mb-0'>{accountName}</p>
    </div>
    <div><FontAwesomeIcon className="cursor-pointer" onClick={() => onDelete && onDelete(id)} icon={faTrashCan} height={32} /></div>
 </div>)
}