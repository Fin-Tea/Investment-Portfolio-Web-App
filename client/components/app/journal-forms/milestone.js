import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import BaseForm from "./base-form";
import Pill from "../pill";
import Tooltip from "../tooltip";


export default function Milestone({ data, onSubmit, onDelete }) {
    const validationSchema = Yup.object().shape({
        growthTypeId: Yup.number()
          .transform((value) => (Number.isNaN(value) ? null : value))
          .required("Type required"),
          milestoneText: Yup.string().required("Milestone is required"),
      });

      const formOptions = {
        defaultValues: {
          growthTypeId: data?.milestone.growthTypeId,
          reachedOn: data?.milestone.reachedOn,
          milestoneText: data?.milestone.milestoneText,
        },
        resolver: yupResolver(validationSchema),
      };


  const [growthTypeId, setGrowthTypeIdId] = useState(1);
  const [achievedOn, setAchievedOn] = useState(null);
  const [milestone, setMilestone] = useState("");


  function handlePillClick({id}) {
    setGrowthTypeIdId(id);
  }

  return (
    <BaseForm header="Milestone">
      <div>
        <label className="text-sm ml">Type*</label>
        <div className="flex">
            <Pill className="mr-2" key={1} id={1} controlled onClick={handlePillClick} isActive={growthTypeId === 1} >Earnings</Pill>
            <Pill className="mr-2" key={2} id={2} controlled onClick={handlePillClick} isActive={growthTypeId === 2} >Habits</Pill>
            <Pill className="mr-2" key={3} id={3} controlled onClick={handlePillClick} isActive={growthTypeId === 3} >Skillz</Pill>
            <Pill className="mr-2" key={4} id={4} controlled onClick={handlePillClick} isActive={growthTypeId === 4} >Knowledge</Pill>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm ml">Date Reached</label>
        <div className="flex items-center">
        <DatePicker className="border rounded-md text-sm p-2" selected={achievedOn} onChange={(date) => setAchievedOn(date)} />
        <Tooltip text="(Keep blank until completed)" />
        </div>
      </div>


      <div className="mt-4">
        <label className="text-sm ml">Milestone*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" value={milestone} onChange={(e) => setMilestone(e.target.value)} />
          <Tooltip text="Celebrate and keep track of achievements throughout your trading/investing journey!" />
        </div>
      </div>

    </BaseForm>
  );
}
