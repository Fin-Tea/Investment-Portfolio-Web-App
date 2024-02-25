import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import BaseForm from "./base-form";
import Pill from "../pill";
import Autocomplete from "../autocomplete";

const symbolFixtures = [{ label: "ES" }, { label: "NQ" }];

export default function Finstrument({ data, items, onSubmit, onDelete }) {
    const { securitySymbols } = items;
  const validationSchema = Yup.object().shape({
    securityTypeId: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .required("Type required"),
    securitySymbol: Yup.object().required("Symbol is required"),
    observations: Yup.string().required("Observations are required"),
  });

  const formOptions = {
    defaultValues: {
      securityTypeId: data?.finstrument.securityTypeId,
      securitySymbol: securitySymbols.find(
        ({ label }) => label === data?.finstrument.securitySymbol
      ),
      observations: data?.finstrument.observations,
    },
    resolver: yupResolver(validationSchema),
  };

  const { register, handleSubmit, formState, setValue, watch, reset } =
    useForm(formOptions);
  const { errors } = formState;

  const securityTypeId = watch("securityTypeId");
  const securitySymbol = watch("securitySymbol");

  function handlePillClick({ id }) {
    setValue("securityTypeId", id);
  }

  useEffect(() => {
    reset(formOptions.defaultValues);
  }, [data]);

  return (
    <BaseForm
      header="Finstrument"
      date={data?.updatedAt}
      edit={!!data}
      onSave={handleSubmit(onSubmit)}
      onDelete={onDelete}
    >
      <div>
        <label className="text-sm ml">Type*</label>
        <div className="flex flex-wrap">
          {/* TODO: fetch instrument types from api */}
          <Pill
            className="mr-2 mb-2"
            key={1}
            id={1}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 1}
          >
            Stock
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={2}
            id={2}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 2}
          >
            ETF
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={3}
            id={3}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 3}
          >
            Bond
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={4}
            id={4}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 4}
          >
            Options
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={5}
            id={5}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 5}
          >
            Futures
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={6}
            id={6}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 6}
          >
            Crypto
          </Pill>
          <Pill
            className="mr-2 mb-2"
            key={7}
            id={7}
            controlled
            onClick={handlePillClick}
            isActive={securityTypeId === 7}
          >
            Forex
          </Pill>
        </div>
        <div className="text-red-600 text-xs">
          {errors.securityTypeId?.message}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm ml">Symbol*</label>
        <Autocomplete
          items={securitySymbols}
          onSelect={(val) => setValue("securitySymbol", val)}
          tooltip="The symbol of the financial instrument being invested in or traded (e.g. AAPL for Apple)"
          value={securitySymbol}
        />
        <div className="text-red-600 text-xs">
          {errors.securitySymbol?.message}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Observations*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("observations")}
          />
        </div>
        <div className="text-red-600 text-xs">
          {errors.observations?.message}
        </div>
      </div>
    </BaseForm>
  );
}
