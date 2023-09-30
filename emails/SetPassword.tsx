import {Container, Html, Img, Link, Section, Text} from "@react-email/components"
import React, {CSSProperties, JSX} from "react";

const imageHeight = 75
const imageScale = 1.56
const imageWidth = imageHeight * imageScale
const padding = 10


type Props = {
    resetPasswordLink: URL
    username: string
}

export default function SetPassword(props: Props): JSX.Element {
    const {
        username= "Rob",
        resetPasswordLink = "http://localhost:3000/passwords/token/ABCDEFGHIJKLMNOP"
    } = props

    return (
        <Html id="recipes-reset-password-email-html">
            <Section style={main}>
                <Container style={title}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: `${imageWidth + 2 * padding}px 1fr`,
                        gridTemplateRows: `${imageHeight/2}px ${imageHeight/4}px 1fr`,
                        gap: "10px"
                    }}>
                        <Img
                            src="http://localhost:3000/images/goodoletimes.png"
                            style={{...image, paddingTop: padding, gridColumn: "1", gridRow: "1/3"}}
                        />
                        <div style={{...titleText, paddingTop: padding, gridColumn: "2", gridRow: "1"}}>City Recipes</div>
                        <div style={{...subtitleText, gridColumn: "2", gridRow: "2"}}>Welcome / Set Password</div>
                        <div style={{...versionText, gridColumn: "2", gridRow: "3"}}>Version 3.1.4</div>
                    </div>
                </Container>
            </Section>
            <Section style={main}>
                <Container style={container}>
                    <Text style={paragraph}>
                        {username} has invited you to join City Recipes. City Recipes is an online recipe book
                        for managing your recipes. All your recipes are in one convenient spot on the web. Share
                        recipes with others, or keep them private. Develop recipes with others, or on your own.
                    </Text>
                    <Text style={paragraph}>
                        Should you choose to accept this exclusive membership, put on your helmet and elbow pads
                        and enjoy the ride. But first, please click&nbsp;
                        <Link style={link} target="_blank" href={resetPasswordLink.toString()}>here</Link>
                        &nbsp;to set your password and get started. Alternatively,
                        you can paste&nbsp;<span style={linkText}>{resetPasswordLink.toString()}</span>&nbsp;into
                        your browser to set your password.
                    </Text>
                    <Text style={copyrightText}>
                        All this city stuff had been copyrighted by Booboo (&copy; 1905 to March 14, {(new Date()).getFullYear() + 1}).
                    </Text>
                </Container>
            </Section>
        </Html>
    )
}

// Styles for the email template
const main = {
    backgroundColor: "#ffffff",
};

const container: CSSProperties = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "580px",
};

const paragraph: CSSProperties = {
    fontSize: "18px",
    lineHeight: "1.3",
    fontWeight: "500",
    fontFamily: "sans-serif",
    color: "#484848",
};

const titleText: CSSProperties = {
    fontSize: "28px",
    fontWeight: "500",
    fontFamily: "sans-serif",
    color: "#ffffff",
};

const subtitleText: CSSProperties = {
    fontSize: "14px",
    fontFamily: "sans-serif",
    color: "#ffffff"
};

const versionText: CSSProperties = {
    fontSize: "11px",
    fontFamily: "sans-serif",
    color: "#ffffff",
    justifySelf: "end",
    paddingRight: 7
};

const copyrightText: CSSProperties = {
    fontSize: "11px",
    fontFamily: "sans-serif",
    color: "#484848",
};

const link: CSSProperties = {
    fontWeight: "500",
    fontFamily: "sans-serif",
    color: "#328eb2",
}

const linkText: CSSProperties = {
    fontSize: '14px',
    lineHeight: 1.3,
    fontWeight: 400,
    fontFamily: 'monospace',
    color: "#484848",
};



const title: CSSProperties = {
    marginTop: 10,
    backgroundColor: 'rgb(59,59,56)',
    height: imageHeight + 2 * padding
}

const image: CSSProperties = {
    borderRadius: 5,
    height: imageHeight,
    width: imageWidth,
    marginRight: 10,
    marginLeft: padding
}
