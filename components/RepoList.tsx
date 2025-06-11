"use client";

import { useForm, FormProvider } from "react-hook-form";
import { InputWithIcon } from "@/components/ui/input";
import {log} from "util";

interface ChosenRepo {
    name: string;
    html_url: string;
}

interface FormData {
    message: string;
    chosenRepos: ChosenRepo[];
}

export default function RepoList() {
    const methods = useForm<FormData>({
        defaultValues: {
            message: "",
            chosenRepos: [],
        },
    });

    const onSubmit = (data: FormData) => {
        console.log("Form data submitted:", data);
    };

    return (
        <div className="max-container-l pt-[184px] relative">
            {/* Header Section */}
            <div className="max-w-[540px] mx-auto text-center">
                <h2 className="text-4xl">
                    Lorem ipsum lacus volutpat ultricies mattis tellus amet pellentesque
                </h2>
                <p className="text-base mt-10">
                    Ante consequat ultrices sit rhoncus tellus auctor in neque phasellus arcu.
                </p>
            </div>

            {/* Form Section */}
            <div className="max-w-[624px] mx-auto mt-[100px]">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <InputWithIcon name="message"  />
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
