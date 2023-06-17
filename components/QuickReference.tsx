import {List, ListItem, Typography} from "@mui/material";
import {amountFor, convertAmount, UnitType} from "../lib/Measurements";
import React from "react";

export default function QuickReference(): JSX.Element {
    return <>
        <List sx={{padding: 0}}>
            <ListItem>
                <Typography sx={{fontSize: 14, fontWeight: 700}}>Quick Reference</Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.TEASPOON), UnitType.MILLILITER).map(amount => `1 tsp ≈ ${Math.round(amount.value)} ml`).getOrDefault('')}
                </Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.TABLESPOON), UnitType.MILLILITER).map(amount => `1 tbsp ≈ ${Math.round(amount.value)} ml`).getOrDefault('')}
                </Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.TABLESPOON), UnitType.TEASPOON).map(amount => `1 tbsp = ${Math.round(amount.value)} tsps`).getOrDefault('')}
                </Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.FLUID_OUNCE), UnitType.TABLESPOON).map(amount => `1 fl oz = ${Math.round(amount.value)} tbsps`).getOrDefault('')}
                </Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.CUP), UnitType.FLUID_OUNCE).map(amount => `1 cup = ${Math.round(amount.value)} fl ozs`).getOrDefault('')}
                </Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.QUART), UnitType.PINT).map(amount => `1 qt = ${Math.round(amount.value)} pts`).getOrDefault('')}
                </Typography>
            </ListItem>
            <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}>
                    {convertAmount(amountFor(1, UnitType.GALLON), UnitType.QUART).map(amount => `1 gal = ${Math.round(amount.value)} qts`).getOrDefault('')}
                </Typography>
            </ListItem>

            <ListItem sx={{paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}/>
            </ListItem>
            {[325, 350, 375, 400, 425, 450].map(fahrenheit => (
                <ListItem key={fahrenheit} sx={{paddingTop: 0, paddingBottom: 0}}>
                    <Typography sx={{fontSize: 13}}>
                        {convertAmount(amountFor(fahrenheit, UnitType.FAHRENHEIT), UnitType.CELSIUS).map(amount => `${fahrenheit} °F = ${Math.round(amount.value)} °C`).getOrDefault('')}
                    </Typography>
                </ListItem>
                )
            )}

            <ListItem sx={{paddingBottom: 0}}>
                <Typography sx={{fontSize: 13}}/>
            </ListItem>
            {[150, 175, 200, 225].map(celsius => (
                <ListItem key={celsius} sx={{paddingTop: 0, paddingBottom: 0}}>
                    <Typography sx={{fontSize: 13}}>
                        {convertAmount(amountFor(celsius, UnitType.CELSIUS), UnitType.FAHRENHEIT).map(amount => `${celsius} °C = ${Math.round(amount.value)} °F`).getOrDefault('')}
                    </Typography>
                </ListItem>
                )
            )}
        </List>
    </>
}