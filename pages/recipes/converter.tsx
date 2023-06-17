import AmountConverter from "../../components/AmountConverter";
import React, {JSX} from "react";
import QuickReference from "../../components/QuickReference";

export default function Converter(): JSX.Element {
    return  <>
        <AmountConverter/>
        <QuickReference/>
    </>
}