import {AppBar, Toolbar, Typography} from "@mui/material";
import Link from "next/link";
import React from "react";
import {styled} from "@mui/system";

const TitleImage = styled('img')({
    borderRadius: 5,
    height: 50,
    width: 50 * 1.56,
    marginRight: 10,
    marginLeft: -15
})

type Props = {
    smallRightOffset?: string
    mediumRightOffset?: string
    titleImageSrc: string
    titleImageAlt?: string
    titleImageLink?: string
    children?: Array<JSX.Element> | JSX.Element
}

export function Header(props: Props): JSX.Element {
    const {
        smallRightOffset = 0,
        mediumRightOffset = 0,
        titleImageSrc,
        titleImageAlt = "City Recipes",
        titleImageLink = "/",
        children
    } = props

    return (
        <AppBar
            color="primary"
            position="fixed"
            elevation={1}
            sx={{
                width: {
                    sm: `calc(100% - ${smallRightOffset}px)`,
                    md: `calc(100% - ${mediumRightOffset}px)`,
                },
                ml: {sm: `${smallRightOffset}px`},
            }}
        >
            <Toolbar>
                <Link href={titleImageLink} style={{marginTop: 7}}>
                    <TitleImage src={titleImageSrc} alt={titleImageAlt}/>
                </Link>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    color="default"
                    style={{paddingLeft: 10}}
                    sx={{flexGrow: 1, display: {xs: 'none', sm: 'block'}}}
                >
                    {process.env.bookTitle}
                </Typography>
                {children}
            </Toolbar>
        </AppBar>
    )
}