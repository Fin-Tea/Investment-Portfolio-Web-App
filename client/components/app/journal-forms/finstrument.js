import React, { useState } from "react";
import BaseForm from "./base-form";
import Pill from "../pill";
import Autocomplete from "../autocomplete";


export default function Finstrument({ id, onSubmit }) {
  const [instrumentTypeId, setinstrumentTypeId] = useState(1);
  const [symbol, setSymbol] = useState("");
  const [observations, setObservations] = useState("");


  function handlePillClick({id}) {
    setinstrumentTypeId(id);
  }

  return (
    <BaseForm header="Finstrument">
      <div>
        <label className="text-sm ml">Type*</label>
        <div className="flex flex-wrap">
            <Pill className="mr-2 mb-2" key={1} id={1} controlled onClick={handlePillClick} isActive={instrumentTypeId === 1} >Stock</Pill>
            <Pill className="mr-2 mb-2" key={2} id={2} controlled onClick={handlePillClick} isActive={instrumentTypeId === 2} >ETF</Pill>
            <Pill className="mr-2 mb-2" key={3} id={3} controlled onClick={handlePillClick} isActive={instrumentTypeId === 3} >Bond</Pill>
            <Pill className="mr-2 mb-2" key={4} id={4} controlled onClick={handlePillClick} isActive={instrumentTypeId === 4} >Options</Pill>
            <Pill className="mr-2 mb-2" key={5} id={5} controlled onClick={handlePillClick} isActive={instrumentTypeId === 5} >Futures</Pill>
            <Pill className="mr-2 mb-2" key={6} id={6} controlled onClick={handlePillClick} isActive={instrumentTypeId === 6} >Crypto</Pill>
            <Pill className="mr-2 mb-2" key={7} id={7} controlled onClick={handlePillClick} isActive={instrumentTypeId === 7} >Forex</Pill>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm ml">Symbol*</label>
        <Autocomplete
          items={[{ label: "ES" }, { label: "NQ" }]}
          onSearch={(value) => setSymbol(value)}
          onSelect={({ label }) => setSymbol(label)}
          tooltip="The symbol of the financial instrument being invested in or traded (e.g. AAPL for Apple)"
          value={symbol}
        />
      </div>


      <div className="mt-4">
        <label className="text-sm ml">Observations*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" value={observations} onChange={(e) => setObservations(e.target.value)} />
        </div>
      </div>

    </BaseForm>
  );
}
