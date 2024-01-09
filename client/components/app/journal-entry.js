export default function JournalEntry({ id, tag, date, entryText, symbol, onClick}) {

    const cursor = onClick ? "cursor-pointer" : "cursor-default";

    return (<div className={`flex flex-col w-full ${cursor}`} onClick={() => onClick && onClick(id)}>
        <div className="flex flex-row justify-between font-bold">
            <span>{tag}</span>
            {symbol && <span>{symbol}</span>}
        </div>
        <div>
            <span className="text-sm text-gray-500">{date}</span>
        </div>
        <p className="line-clamp-1 mb-2">
            {entryText}
        </p>
    </div>)

}