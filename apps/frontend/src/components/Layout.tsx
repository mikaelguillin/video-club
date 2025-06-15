import { Heading, Icon } from "@chakra-ui/react";
import { Link } from "react-router";
import { BsGithub } from "react-icons/bs"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <header className="header">
                <Heading size="3xl" className="logo">
                    <Link to="/">Video Club</Link>
                </Heading>
            </header>

            <main className="main">
                {children}
            </main>

            <footer className="footer">
                <a href="https://github.com/mikaelguillin/video-club">
                    See the code on GitHub
                    <Icon ml="2" size="md">
                        <BsGithub />
                    </Icon>
                </a>
                <p>This is not an official website of Konbini.</p>
            </footer>
        </>
    )
}