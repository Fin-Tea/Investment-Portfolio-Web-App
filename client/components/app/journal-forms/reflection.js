import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import BaseForm from "./base-form";
import Pill from "../pill";

export default function Reflection({ data, onSubmit, onDelete }) {
  const validationSchema = Yup.object().shape({
    timeframeType: Yup.string().required("Timeframe is required"),
    moodType: Yup.string().required("Mood is required"),
    energyType: Yup.string().required("Energy is required"),
    thoughts: Yup.string().required("Thoughts are required"),
  });

  const formOptions = {
    defaultValues: {
      timeframeType: data?.reflection.timeframeType,
      moodType: data?.reflection.moodType,
      energyType: data?.reflection.energyType,
      thoughts: data?.reflection.thoughts,
    },
    resolver: yupResolver(validationSchema),
  };

  const { register, handleSubmit, formState, setValue, watch, reset } =
    useForm(formOptions);
  const { errors } = formState;

  const timeframeType = watch("timeframeType");
  const moodType = watch("moodType");
  const energyType = watch("energyType");

  function handleTimePillClick({ id }) {
    setValue("timeframeType", id);
  }

  function handleMoodPillClick({ id }) {
    setValue("moodType", id);
  }

  function handleEnergyPillClick({ id }) {
    setValue("energyType", id);
  }

  useEffect(() => {
    reset(formOptions.defaultValues);
  }, [data, items]);

  return (
    <BaseForm
      header="Reflection"
      edit={!!data}
      date={data?.updatedAt}
      onSave={handleSubmit(onSubmit)}
      onDelete={onDelete}
    >
      <div>
        <label className="text-sm ml">Timeframe*</label>
        <div className="flex flex-wrap">
          <Pill
            className="mr-2 mb-2"
            key={1}
            id={"Daily"}
            controlled
            onClick={handleTimePillClick}
            isActive={timeframeType === "Daily"}
          >
            Daily
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={2}
            id={"Weekly"}
            controlled
            onClick={handleTimePillClick}
            isActive={timeframeType === "Weekly"}
          >
            Weekly
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={3}
            id={"Monthly"}
            controlled
            onClick={handleTimePillClick}
            isActive={timeframeType === "Monthly"}
          >
            Monthly
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={4}
            id={"Yearly"}
            controlled
            onClick={handleTimePillClick}
            isActive={timeframeType === "Yearly"}
          >
            Yearly
          </Pill>
        </div>
        <div className="text-red-600 text-xs">
          {errors.timeframeType?.message}
        </div>
      </div>

      <div>
        <label className="text-sm ml">Mood*</label>
        <div className="flex flex-wrap">
          <Pill
            className="mr-2 mb-2"
            key={1}
            id={"Okay"}
            controlled
            onClick={handleMoodPillClick}
            isActive={moodType === "Okay"}
          >
            Okay
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={2}
            id={"Good"}
            controlled
            onClick={handleMoodPillClick}
            isActive={moodType === "Good"}
          >
            Good
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={3}
            id={"Bad"}
            controlled
            onClick={handleMoodPillClick}
            isActive={moodType === "Bad"}
          >
            Bad
          </Pill>
        </div>
        <div className="text-red-600 text-xs">{errors.moodType?.message}</div>
      </div>

      <div>
        <label className="text-sm ml">Energy*</label>
        <div className="flex flex-wrap">
          <Pill
            className="mr-2 mb-2"
            key={1}
            id={"Neutral"}
            controlled
            onClick={handleEnergyPillClick}
            isActive={energyType === "Neutral"}
          >
            Neutral
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={2}
            id={"High"}
            controlled
            onClick={handleEnergyPillClick}
            isActive={energyType === "High"}
          >
            High
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={3}
            id={"Low"}
            controlled
            onClick={handleEnergyPillClick}
            isActive={energyType === "Low"}
          >
            Low
          </Pill>
        </div>
        <div className="text-red-600 text-xs">{errors.energyType?.message}</div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Thoughts*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("thoughts")}
          />
        </div>
        <div className="text-red-600 text-xs">{errors.thoughts?.message}</div>
      </div>
    </BaseForm>
  );
}
