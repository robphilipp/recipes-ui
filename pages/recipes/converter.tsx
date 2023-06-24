import AmountConverter from "../../components/conversions/AmountConverter";
import React, {JSX} from "react";
import QuickReference from "../../components/QuickReference";

export default function Converter(): JSX.Element {
    return  <>
        <AmountConverter/>
        <QuickReference/>
    </>
}