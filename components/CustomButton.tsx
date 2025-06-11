interface iCustomButtonProps {
    label: string;
    bgCol: "customGreen" | "red" | "blue";
}

const bgColorMap = {
    customGreen: "bg-customGreen",
    red: "bg-red-500",
    blue: "bg-blue-500",
};

export const CustomButton = ({ label, bgCol }: iCustomButtonProps) => {
    return (
        <button
            className={`${bgColorMap[bgCol]} text-2xl text-black w-[134px] h-[48px] rounded-[10px] hover:opacity-[0.9]`}
        >
            {label}
        </button>
    );
};
